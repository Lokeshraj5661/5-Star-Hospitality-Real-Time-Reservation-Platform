from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Lakshmi Venkateswara Fast Foods · API")
api_router = APIRouter(prefix="/api")


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


class MenuItem(BaseModel):
    id: str
    name: str
    sanskrit: str
    description: str
    price: str
    category: str


# ============= Static Menu =============
MENU_ITEMS = [
    MenuItem(id="thali", name="Lakshmi Thali", sanskrit="लक्ष्मी थाली",
             description="A presentation of nine offerings — sambar, rasam, two curries, pickle, curd, payasam, rice and ghee.",
             price="₹ 240", category="Signature"),
    MenuItem(id="dosa", name="Crystal Masala Dosa", sanskrit="मसाला डोसा",
             description="24-hour fermented batter, ghee-roasted to lace, folded over potato masala.",
             price="₹ 120", category="Tiffin"),
    MenuItem(id="idli", name="Cloud Idli", sanskrit="इडली",
             description="Steamed by sunrise, served with three chutneys.",
             price="₹ 80", category="Tiffin"),
    MenuItem(id="vada", name="Medu Vada Royale", sanskrit="मेदु वड़ा",
             description="Lentil doughnut, fried to a whisper, crowned with curry leaf.",
             price="₹ 70", category="Tiffin"),
    MenuItem(id="pongal", name="Ven Pongal", sanskrit="वेन पोंगल",
             description="Rice and moong dal, peppered, ghee-laden.",
             price="₹ 110", category="Comfort"),
    MenuItem(id="upma", name="Rava Upma", sanskrit="उपमा",
             description="Roasted semolina, mustard seed, cashew, served with a sliver of lime.",
             price="₹ 90", category="Daily"),
    MenuItem(id="filter", name="Filter Coffee", sanskrit="कापी",
             description="Chicory-laced, frothed at altitude, poured davarah-to-tumbler.",
             price="₹ 40", category="Beverage"),
]


# ============= Routes =============
@api_router.get("/")
async def root():
    return {"message": "Lakshmi Venkateswara Fast Foods · The Culinary Sanctuary"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    rows = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for r in rows:
        if isinstance(r.get('timestamp'), str):
            r['timestamp'] = datetime.fromisoformat(r['timestamp'])
    return rows


@api_router.get("/menu", response_model=List[MenuItem])
async def get_menu():
    return MENU_ITEMS


@api_router.post("/reservations", response_model=Reservation)
async def create_reservation(payload: ReservationCreate):
    if not payload.name.strip() or not payload.phone.strip() or not payload.date.strip():
        raise HTTPException(status_code=400, detail="Name, phone, and date are required.")
    if payload.guests < 1 or payload.guests > 50:
        raise HTTPException(status_code=400, detail="Guest count must be between 1 and 50.")

    obj = Reservation(**payload.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.reservations.insert_one(doc)
    return obj


@api_router.get("/reservations", response_model=List[Reservation])
async def list_reservations():
    rows = await db.reservations.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for r in rows:
        if isinstance(r.get('created_at'), str):
            r['created_at'] = datetime.fromisoformat(r['created_at'])
    return rows


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
