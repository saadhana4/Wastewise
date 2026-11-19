# WasteWise Database Launcher (Docker + PostGIS)
Write-Host "Starting Docker and PostgreSQL/PostGIS container..." -ForegroundColor Cyan
wsl -u root -d Ubuntu -- sh -c "service docker start && cd /mnt/c/Users/dell/OneDrive/Documents/WasteWise && docker compose up -d"

Write-Host "Starting Windows <-> WSL TCP Bridge on port 5432..." -ForegroundColor Cyan
Start-Process -NoNewWindow powershell -ArgumentList "-Command `".\backend\.venv\Scripts\python database\tunnel_server.py`""
wsl -u root -d Ubuntu -- sh -c "python3 /mnt/c/Users/dell/OneDrive/Documents/WasteWise/database/tunnel_client.py &"

Write-Host "PostgreSQL + PostGIS database is ready at localhost:5432!" -ForegroundColor Green
