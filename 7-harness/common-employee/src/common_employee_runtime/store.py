from __future__ import annotations

from contextlib import closing
import json
import sqlite3
from pathlib import Path


class RuntimeStore:
    def __init__(self, workspace: Path) -> None:
        self._db_path = workspace / "runtime" / "autonomous-runtime.db"
        self._db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    @property
    def db_path(self) -> Path:
        return self._db_path

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self._db_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _init_db(self) -> None:
        with closing(self._connect()) as connection, connection:
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS runs (
                    ticket_key TEXT PRIMARY KEY,
                    state TEXT NOT NULL,
                    current_stage TEXT NOT NULL,
                    classification TEXT NOT NULL,
                    confidence TEXT NOT NULL,
                    attempts INTEGER NOT NULL,
                    gate_results_json TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ticket_key TEXT NOT NULL,
                    stage TEXT NOT NULL,
                    verdict TEXT NOT NULL,
                    payload_json TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                """
            )

    def upsert_run(
        self,
        *,
        ticket_key: str,
        state: str,
        current_stage: str,
        classification: str,
        confidence: str,
        attempts: int,
        gate_results: dict[str, str],
        updated_at: str,
    ) -> None:
        with closing(self._connect()) as connection, connection:
            connection.execute(
                """
                INSERT INTO runs (
                    ticket_key,
                    state,
                    current_stage,
                    classification,
                    confidence,
                    attempts,
                    gate_results_json,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(ticket_key) DO UPDATE SET
                    state = excluded.state,
                    current_stage = excluded.current_stage,
                    classification = excluded.classification,
                    confidence = excluded.confidence,
                    attempts = excluded.attempts,
                    gate_results_json = excluded.gate_results_json,
                    updated_at = excluded.updated_at
                """,
                (
                    ticket_key,
                    state,
                    current_stage,
                    classification,
                    confidence,
                    attempts,
                    json.dumps(gate_results, ensure_ascii=False, sort_keys=True),
                    updated_at,
                ),
            )

    def append_event(
        self,
        *,
        ticket_key: str,
        stage: str,
        verdict: str,
        payload: dict[str, object],
        created_at: str,
    ) -> None:
        with closing(self._connect()) as connection, connection:
            connection.execute(
                """
                INSERT INTO events (ticket_key, stage, verdict, payload_json, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    ticket_key,
                    stage,
                    verdict,
                    json.dumps(payload, ensure_ascii=False, sort_keys=True),
                    created_at,
                ),
            )

    def get_run(self, ticket_key: str) -> dict[str, object] | None:
        with closing(self._connect()) as connection, connection:
            row = connection.execute(
                """
                SELECT ticket_key, state, current_stage, classification, confidence, attempts, gate_results_json, updated_at
                FROM runs
                WHERE ticket_key = ?
                """,
                (ticket_key,),
            ).fetchone()
        return self._serialize_run(row)

    def list_runs(self, *, limit: int = 20) -> list[dict[str, object]]:
        with closing(self._connect()) as connection, connection:
            rows = connection.execute(
                """
                SELECT ticket_key, state, current_stage, classification, confidence, attempts, gate_results_json, updated_at
                FROM runs
                ORDER BY updated_at DESC, ticket_key DESC
                LIMIT ?
                """,
                (limit,),
            ).fetchall()
        return [serialized for row in rows if (serialized := self._serialize_run(row)) is not None]

    def list_events(self, ticket_key: str, *, limit: int = 20) -> list[dict[str, object]]:
        with closing(self._connect()) as connection, connection:
            rows = connection.execute(
                """
                SELECT id, ticket_key, stage, verdict, payload_json, created_at
                FROM events
                WHERE ticket_key = ?
                ORDER BY id DESC
                LIMIT ?
                """,
                (ticket_key, limit),
            ).fetchall()
        return [
            {
                "id": row["id"],
                "ticket_key": row["ticket_key"],
                "stage": row["stage"],
                "verdict": row["verdict"],
                "payload": json.loads(row["payload_json"]),
                "created_at": row["created_at"],
            }
            for row in rows
        ]

    def count_matching_root_cause(self, ticket_key: str, reason: str) -> int:
        with closing(self._connect()) as connection, connection:
            row = connection.execute(
                """
                SELECT COUNT(*) AS count
                FROM events
                WHERE ticket_key = ?
                  AND json_extract(payload_json, '$.reason') = ?
                """,
                (ticket_key, reason),
            ).fetchone()
        return int(row["count"]) if row is not None else 0

    def _serialize_run(self, row: sqlite3.Row | None) -> dict[str, object] | None:
        if row is None:
            return None
        gate_results_json = row["gate_results_json"]
        return {
            "ticket_key": row["ticket_key"],
            "state": row["state"],
            "current_stage": row["current_stage"],
            "classification": row["classification"],
            "confidence": row["confidence"],
            "attempts": row["attempts"],
            "gate_results_json": gate_results_json,
            "gate_results": json.loads(gate_results_json),
            "updated_at": row["updated_at"],
        }
