from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum


class Verdict(StrEnum):
    APPROVED = "APPROVED"
    CHANGES_REQUESTED = "CHANGES_REQUESTED"
    BLOCKED = "BLOCKED"
    SKIPPED = "SKIPPED"


class CleanupStatus(StrEnum):
    CLEAN = "CLEAN"
    REMAINING_OK = "REMAINING_OK"
    BLOCKED = "BLOCKED"


@dataclass(slots=True)
class GateRecord:
    verdict: Verdict
    reason: str
    checked: list[str] = field(default_factory=list)
    evidence: list[str] = field(default_factory=list)
    cleanup_status: CleanupStatus = CleanupStatus.CLEAN
    open_risks: list[str] = field(default_factory=list)

