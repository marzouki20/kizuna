
from fastapi import FastAPI

app = FastAPI(title="RoboCore API")

@app.get("/")
def home():
    return {
        "message": "RoboCore backend is working",
        "status": "online"
    }

@app.get("/api/robot/status")
def robot_status():
    return {
        "robot": "RoboCore-01",
        "status": "Standby",
        "position": {"x": 10, "y": 10},
        "battery": 95,
        "reservoir": 80
    }

