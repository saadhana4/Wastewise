# WasteWise FastAPI Backend Launcher
Write-Host "Starting FastAPI Backend on port 8001..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\..\backend"
.\.venv\Scripts\python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
