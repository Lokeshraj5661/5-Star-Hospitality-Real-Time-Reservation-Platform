from fastapi import FastAPI, APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Header, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import json
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

from notifications import send_sms, send_email, render_event_email, NOTIFY_EMAIL_TO


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Lakshmi Venkateswara Fast Foods · API")
api_router = APIRouter(prefix="/api")

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


# ============= Models =============
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class ReservationCreate(BaseModel):
    name: str
    phone: str
    date: str
    time: Optional[str] = "19:30"
    guests: int = 2
    occasion: Optional[str] = ""
    note: Optional[str] = ""


class Reservation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    date: str
    time: str = "19:30"
    guests: int = 2
    occasion: str = ""
    note: str = ""
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class OrderItem(BaseModel):
    id: str
    name: str
    price: float
    qty: int = 1


class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    items: List[OrderItem]
    total: float
    note: Optional[str] = ""


class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    customer_phone: str
    items: List[OrderItem]
    total: float
    note: str = ""
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class MenuItem(BaseModel):
    id: str
    name: str
    sanskrit: str
    description: str
    price: str
    category: str


class AdminLogin(BaseModel):
    password: str


# ============= WebSocket connection manager =============
class ConnectionManager:
    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, payload: dict):
        dead: List[WebSocket] = []
        for ws in self.active:
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


manager = ConnectionManager()


# ============= Admin auth dep =============
def require_admin(x_admin_password: Optional[str] = Header(default=None)):
    if not ADMIN_PASSWORD:
        raise HTTPException(status_code=503, detail="Admin not configured. Set ADMIN_PASSWORD in backend/.env")
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin password")
    return True


# ============= Static Menu (mirrors frontend menuData.js) =============
MENU_ITEMS = [
    MenuItem(id="thali", name="Lakshmi Thali", sanskrit="लक्ष्मी थाली",
             description="Nine offerings on banana leaf — Chef's selection.",
             price="₹ 240", category="Signature"),
    MenuItem(id="dosa", name="Crystal Masala Dosa", sanskrit="मसाला डोसा",
             description="24-hour fermented batter, ghee-roasted.",
             price="₹ 120", category="Breakfast"),
    MenuItem(id="idli", name="Cloud Idli", sanskrit="इडली",
             description="Steamed at sunrise on banana leaf.",
             price="₹ 80", category="Breakfast"),
    MenuItem(id="vada", name="Medu Vada Royale", sanskrit="मेदु वड़ा",
             description="Lentil doughnut with curry leaf and pepper.",
             price="₹ 70", category="Breakfast"),
    MenuItem(id="pongal", name="Ven Pongal", sanskrit="वेन पोंगल",
             description="Rice and moong dal, peppered, ghee-laden.",
             price="₹ 110", category="Breakfast"),
    MenuItem(id="upma", name="Rava Upma", sanskrit="उपमा",
             description="Roasted semolina with mustard and cashew.",
             price="₹ 90", category="Breakfast"),
    MenuItem(id="gobi-manchurian", name="Gobi Manchurian", sanskrit="गोबी मंचूरियन",
             description="Crisp cauliflower in soy-chilli glaze.",
             price="₹ 160", category="Indo-Chinese"),
    MenuItem(id="gobi-rice", name="Gobi Fried Rice", sanskrit="गोबी राइस",
             description="Wok-tossed rice with glazed gobi.",
             price="₹ 150", category="Indo-Chinese"),
    MenuItem(id="egg-rice", name="Egg Fried Rice", sanskrit="एग राइस",
             description="Wok-fried rice with egg ribbons.",
             price="₹ 140", category="Indo-Chinese"),
    MenuItem(id="egg-gobi-rice", name="Egg & Gobi Fried Rice", sanskrit="एग गोबी राइस",
             description="Egg ribbons with caramelised gobi.",
             price="₹ 180", category="Indo-Chinese"),
    MenuItem(id="egg-noodles", name="Egg Hakka Noodles", sanskrit="एग नूडल्स",
             description="Hakka noodles with vegetables and egg.",
             price="₹ 150", category="Indo-Chinese"),
    MenuItem(id="gobi-noodles", name="Gobi Hakka Noodles", sanskrit="गोबी नूडल्स",
             description="Hakka noodles with glazed gobi.",
             price="₹ 160", category="Indo-Chinese"),
    MenuItem(id="veg-biryani", name="Hyderabadi Veg Biryani", sanskrit="वेज बिरयानी",
             description="Saffron-streaked basmati with paneer and peas.",
             price="₹ 220", category="Biryani"),
    MenuItem(id="egg-biryani", name="Egg Dum Biryani", sanskrit="एग बिरयानी",
             description="Basmati layered with eggs and birista.",
             price="₹ 200", category="Biryani"),
    MenuItem(id="gulab-jamun", name="Gulab Jamun", sanskrit="गुलाब जामुन",
             description="Amber dumplings in sugar syrup.",
             price="₹ 90", category="Dessert"),
    MenuItem(id="rasgulla", name="Rasgulla", sanskrit="रसगुल्ला",
             description="Snow-white chhena spheres in syrup.",
             price="₹ 80", category="Dessert"),
    MenuItem(id="paneer-butter-masala", name="Paneer Butter Masala", sanskrit="पनीर मक्खनी",
             description="Paneer in tomato-cream gravy with butter.",
             price="₹ 220", category="Curry"),
    MenuItem(id="veg-kurma", name="Veg Kurma", sanskrit="वेज कुर्मा",
             description="Mixed vegetables in coconut gravy.",
             price="₹ 180", category="Curry"),
    MenuItem(id="green-salad", name="Garden Salad", sanskrit="हरा सलाद",
             description="Crisp cucumber, tomato, onion, carrot, lime.",
             price="₹ 60", category="Salad"),
    MenuItem(id="fruit-salad", name="Fruit Bowl", sanskrit="फ्रूट सलाद",
             description="Mango, pineapple, kiwi, pomegranate.",
             price="₹ 110", category="Salad"),
    MenuItem(id="vanilla-ic", name="Vanilla Bean", sanskrit="वनीला",
             description="Vanilla bean scoops with caramel and tuile.",
             price="₹ 90", category="Ice Cream"),
    MenuItem(id="mango-ic", name="Alphonso Mango", sanskrit="आम",
             description="Mango scoops with fresh fruit and coulis.",
             price="₹ 110", category="Ice Cream"),
    MenuItem(id="filter", name="Filter Coffee", sanskrit="कापी",
             description="Chicory-laced, frothed, brass tumbler.",
             price="₹ 40", category="Drink"),
    MenuItem(id="badam-milk", name="Saffron Badam Milk", sanskrit="बादाम दूध",
             description="Saffron almond milk in brushed-gold tumbler.",
             price="₹ 70", category="Drink"),
    MenuItem(id="soft-drink", name="Crystal Cola", sanskrit="कोला",
             description="Chilled cola in faceted crystal glass.",
             price="₹ 50", category="Drink"),
]


# ============= Routes =============
@api_router.get("/")
async def root():
    return {"message": "Lakshmi Venkateswara Fast Foods · The Culinary Sanctuary"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    rows = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for r in rows:
        if isinstance(r.get("timestamp"), str):
            r["timestamp"] = datetime.fromisoformat(r["timestamp"])
    return rows


@api_router.get("/menu", response_model=List[MenuItem])
async def get_menu():
    return MENU_ITEMS


# --------- Reservations ---------
@api_router.post("/reservations", response_model=Reservation)
async def create_reservation(payload: ReservationCreate):
    if not payload.name.strip() or not payload.phone.strip() or not payload.date.strip():
        raise HTTPException(status_code=400, detail="Name, phone, and date are required.")
    if payload.guests < 1 or payload.guests > 50:
        raise HTTPException(status_code=400, detail="Guest count must be between 1 and 50.")

    obj = Reservation(**payload.model_dump())
    doc = obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.reservations.insert_one(doc)

    # Notifications + broadcast
    asyncio.create_task(_handle_reservation_notify(obj))
    return obj


async def _handle_reservation_notify(obj: Reservation):
    short = obj.id[:6].upper()
    sms_body = (
        f"LAKSHMI VENKATESWARA — Reservation #{short} for {obj.name} on {obj.date} {obj.time} "
        f"(party of {obj.guests}). We'll call to confirm. — Concierge"
    )
    send_sms(obj.phone, sms_body)
    email_html = render_event_email(
        f"New Reservation · #{short}",
        [
            ("Guest", obj.name),
            ("Phone", obj.phone),
            ("Date", obj.date),
            ("Time", obj.time),
            ("Party", str(obj.guests)),
            ("Occasion", obj.occasion or "—"),
            ("Note", obj.note or "—"),
        ],
    )
    send_email(f"[LVFF] Reservation #{short}", email_html)

    await manager.broadcast({"type": "reservation", "data": obj.model_dump(mode="json")})


@api_router.get("/reservations", response_model=List[Reservation])
async def list_reservations(_=Depends(require_admin)):
    rows = await db.reservations.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for r in rows:
        if isinstance(r.get("created_at"), str):
            r["created_at"] = datetime.fromisoformat(r["created_at"])
    return rows


# --------- Orders ---------
@api_router.post("/orders", response_model=Order)
async def create_order(payload: OrderCreate):
    if not payload.customer_name.strip() or not payload.customer_phone.strip():
        raise HTTPException(status_code=400, detail="Name and phone are required.")
    if not payload.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item.")

    obj = Order(**payload.model_dump())
    doc = obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.orders.insert_one(doc)

    asyncio.create_task(_handle_order_notify(obj))
    return obj


async def _handle_order_notify(obj: Order):
    short = obj.id[:6].upper()
    item_lines = "; ".join(f"{i.qty}× {i.name}" for i in obj.items)
    sms_body = (
        f"LAKSHMI VENKATESWARA — Order #{short}: {item_lines}. Total ₹{int(obj.total)}. "
        f"Ready in ~25 min. — Kitchen"
    )
    send_sms(obj.customer_phone, sms_body)
    items_html = "<br>".join(
        f"&nbsp;&nbsp;{i.qty}× {i.name} — ₹{int(i.price * i.qty)}" for i in obj.items
    )
    email_html = render_event_email(
        f"New Order · #{short}",
        [
            ("Guest", obj.customer_name),
            ("Phone", obj.customer_phone),
            ("Items", items_html),
            ("Total", f"₹ {int(obj.total)}"),
        ],
    )
    send_email(f"[LVFF] Order #{short}", email_html)

    await manager.broadcast({"type": "order", "data": obj.model_dump(mode="json")})


@api_router.get("/orders", response_model=List[Order])
async def list_orders(_=Depends(require_admin)):
    rows = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for r in rows:
        if isinstance(r.get("created_at"), str):
            r["created_at"] = datetime.fromisoformat(r["created_at"])
    return rows


# --------- Admin auth ---------
@api_router.post("/admin/login")
async def admin_login(payload: AdminLogin):
    if not ADMIN_PASSWORD:
        raise HTTPException(status_code=503, detail="Admin password not configured.")
    if payload.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    return {"ok": True}


@api_router.get("/admin/config")
async def admin_config():
    return {
        "admin_configured": bool(ADMIN_PASSWORD),
        "twilio_configured": all(
            os.environ.get(k) for k in ("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM_NUMBER")
        ),
        "email_configured": bool(os.environ.get("GMAIL_USER") and os.environ.get("GMAIL_APP_PASSWORD")),
        "notify_email_to": NOTIFY_EMAIL_TO,
    }


# --------- WebSocket admin feed ---------
@app.websocket("/api/admin/ws")
async def admin_ws(ws: WebSocket, password: str = ""):
    if not ADMIN_PASSWORD or password != ADMIN_PASSWORD:
        await ws.close(code=4401)
        return
    await manager.connect(ws)
    try:
        await ws.send_json({"type": "hello", "ts": datetime.now(timezone.utc).isoformat()})
        while True:
            # keep-alive
            await asyncio.sleep(20)
            try:
                await ws.send_json({"type": "ping"})
            except Exception:
                break
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(ws)


# ============= App wiring =============
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
