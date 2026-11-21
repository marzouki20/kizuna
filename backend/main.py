
import hashlib
import hmac
import os
import secrets
import time

from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="RoboCore API")

# Demonstration identity only. This user is held in memory and is not a production
# account store. Replace this with a database-backed user repository before launch.
DEMO_EMAIL = os.getenv("ROBOCORE_DEMO_EMAIL", "admin@robocore.local").lower()
DEMO_PASSWORD = os.getenv("ROBOCORE_DEMO_PASSWORD", "RoboCoreDemo2026!")
_PASSWORD_SALT = secrets.token_bytes(16)
_PASSWORD_HASH = hashlib.pbkdf2_hmac("sha256", DEMO_PASSWORD.encode(), _PASSWORD_SALT, 310_000)
_sessions: dict[str, tuple[str, int]] = {}
SESSION_COOKIE = "robocore_session"
SESSION_TTL_SECONDS = 60 * 60 * 12

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class LoginRequest(BaseModel):
    email: str
    password: str
    remember_me: bool = False


def current_user(request: Request):
    session_id = request.cookies.get(SESSION_COOKIE)
    session = _sessions.get(session_id or "")
    if not session or session[1] < int(time.time()):
        if session_id:
            _sessions.pop(session_id, None)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expirée. Veuillez vous reconnecter.")
    return {"name": "RoboCore Admin", "email": session[0]}


@app.post("/api/auth/login")
def login(credentials: LoginRequest, response: Response):
    candidate = hashlib.pbkdf2_hmac("sha256", credentials.password.encode(), _PASSWORD_SALT, 310_000)
    if credentials.email.lower() != DEMO_EMAIL or not hmac.compare_digest(candidate, _PASSWORD_HASH):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email ou mot de passe incorrect.")

    session_id = secrets.token_urlsafe(32)
    session_ttl = 60 * 60 * 24 * 30 if credentials.remember_me else SESSION_TTL_SECONDS
    expires_at = int(time.time()) + session_ttl
    _sessions[session_id] = (DEMO_EMAIL, expires_at)
    response.set_cookie(
        SESSION_COOKIE,
        session_id,
        max_age=session_ttl if credentials.remember_me else None,
        httponly=True,
        secure=os.getenv("ROBOCORE_COOKIE_SECURE", "false").lower() == "true",
        samesite="lax",
        path="/",
    )
    return {"user": {"name": "RoboCore Admin", "email": DEMO_EMAIL}, "mode": "demo"}


@app.get("/api/auth/session")
def session(request: Request):
    return {"user": current_user(request), "mode": "demo"}


@app.post("/api/auth/logout")
def logout(request: Request, response: Response):
    _sessions.pop(request.cookies.get(SESSION_COOKIE, ""), None)
    response.delete_cookie(SESSION_COOKIE, path="/", httponly=True, samesite="lax")
    return {"ok": True}

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

