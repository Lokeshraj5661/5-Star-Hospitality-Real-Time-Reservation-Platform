"""Emergent-managed Google Auth — session exchange + verification.

REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
"""
from __future__ import annotations
import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, Request, Response, Header
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel

logger = logging.getLogger(__name__)

EMERGENT_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
SESSION_TTL_DAYS = 7

ADMIN_ALLOWED_EMAILS = {
    e.strip().lower()
    for e in (os.environ.get("ADMIN_ALLOWED_EMAILS") or "").split(",")
    if e.strip()
}


class SessionUser(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    is_admin: bool = False


async def _fetch_emergent_session(session_id: str) -> dict:
    async with httpx.AsyncClient(timeout=15) as ac:
        r = await ac.get(EMERGENT_SESSION_URL, headers={"X-Session-ID": session_id})
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired Google session")
    return r.json()


def build_router(db: AsyncIOMotorDatabase) -> APIRouter:
    router = APIRouter(prefix="/api/auth", tags=["auth"])

    async def _upsert_user(email: str, name: str, picture: str) -> str:
        existing = await db.users.find_one({"email": email}, {"_id": 0})
        if existing:
            await db.users.update_one(
                {"email": email},
                {"$set": {"name": name, "picture": picture, "last_login": datetime.now(timezone.utc).isoformat()}},
            )
            return existing["user_id"]
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_login": datetime.now(timezone.utc).isoformat(),
        })
        return user_id

    async def _store_session(user_id: str, session_token: str) -> None:
        expires_at = datetime.now(timezone.utc) + timedelta(days=SESSION_TTL_DAYS)
        await db.user_sessions.insert_one({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    @router.post("/session")
    async def exchange_session(response: Response, x_session_id: Optional[str] = Header(default=None)):
        if not x_session_id:
            raise HTTPException(status_code=400, detail="Missing X-Session-ID header")
        data = await _fetch_emergent_session(x_session_id)
        email = (data.get("email") or "").lower()
        name = data.get("name") or email.split("@")[0]
        picture = data.get("picture") or ""
        session_token = data.get("session_token")
        if not (email and session_token):
            raise HTTPException(status_code=502, detail="Malformed Google session response")
        user_id = await _upsert_user(email, name, picture)
        await _store_session(user_id, session_token)

        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=SESSION_TTL_DAYS * 24 * 60 * 60,
            path="/",
        )
        return {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "is_admin": email in ADMIN_ALLOWED_EMAILS,
        }

    @router.get("/me")
    async def me(request: Request, authorization: Optional[str] = Header(default=None)):
        token = request.cookies.get("session_token")
        if not token and authorization and authorization.lower().startswith("bearer "):
            token = authorization.split(" ", 1)[1].strip()
        if not token:
            raise HTTPException(status_code=401, detail="Not authenticated")
        user = await session_user_from_token(db, token)
        if not user:
            raise HTTPException(status_code=401, detail="Session expired")
        return user.model_dump()

    @router.post("/logout")
    async def logout(request: Request, response: Response):
        token = request.cookies.get("session_token")
        if token:
            await db.user_sessions.delete_many({"session_token": token})
        response.delete_cookie(key="session_token", path="/", samesite="none", secure=True)
        return {"ok": True}

    return router


async def session_user_from_token(db: AsyncIOMotorDatabase, token: str) -> Optional[SessionUser]:
    doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not doc:
        return None
    expires_at = doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and expires_at < datetime.now(timezone.utc):
        await db.user_sessions.delete_one({"session_token": token})
        return None
    user = await db.users.find_one({"user_id": doc["user_id"]}, {"_id": 0})
    if not user:
        return None
    email = (user.get("email") or "").lower()
    return SessionUser(
        user_id=user["user_id"],
        email=email,
        name=user.get("name") or email,
        picture=user.get("picture") or "",
        is_admin=email in ADMIN_ALLOWED_EMAILS,
    )
