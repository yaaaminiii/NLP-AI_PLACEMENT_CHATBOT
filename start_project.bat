@echo off
title AI Placement Assistant Chatbot
echo ============================================================
echo   AI PLACEMENT ASSISTANT CHATBOT FOR STUDENTS
echo ============================================================
echo.
echo Checking Python virtual environment...

if exist venv\Scripts\python.exe (
    set PYTHON_EXE=venv\Scripts\python.exe
) else (
    set PYTHON_EXE=python
)

echo Starting Flask server on http://127.0.0.1:5000...
echo.

start "" "http://127.0.0.1:5000"

%PYTHON_EXE% backend\app.py

pause
