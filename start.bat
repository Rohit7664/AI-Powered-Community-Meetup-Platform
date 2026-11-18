@echo off
echo ========================================================
echo Starting InterestHub Full-Stack Application...
echo ========================================================

echo Starting MongoDB...
start "InterestHub MongoDB" cmd /k ""C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath backend/.mongodata --port 27017"

echo Starting Python AI Microservice (Port 8000)...
start "InterestHub AI Service" cmd /k "cd ai-service && venv\Scripts\activate && uvicorn app.main:app --host 127.0.0.1 --port 8000"

echo Starting Backend API & Socket Server (Port 8080)...
start "InterestHub Backend" cmd /k "cd backend && npm run dev"

echo Starting Frontend Dev Server (Port 5173)...
start "InterestHub Frontend" cmd /k "cd frontend && npm run dev"

echo ========================================================
echo All services launched!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8080/api/v1
echo AI Engine: http://localhost:8000/health
echo ========================================================
pause
