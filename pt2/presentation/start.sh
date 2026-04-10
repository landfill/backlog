#!/bin/bash
echo "Starting Hand-Tracking Presentation..."
echo ""
echo "Launching local server on http://localhost:8080"
echo "Press Ctrl+C to stop the server."
echo ""

cd "$(dirname "$0")"

# 브라우저 자동 오픈
if command -v open &> /dev/null; then
    # macOS
    sleep 1 && open "http://localhost:8080" &
elif command -v xdg-open &> /dev/null; then
    # Linux
    sleep 1 && xdg-open "http://localhost:8080" &
fi

# Python 서버 실행
if command -v python3 &> /dev/null; then
    python3 -m http.server 8080
elif command -v python &> /dev/null; then
    python -m http.server 8080
else
    echo "ERROR: Python not found."
    echo "Please install Python from https://www.python.org/downloads/"
    exit 1
fi
