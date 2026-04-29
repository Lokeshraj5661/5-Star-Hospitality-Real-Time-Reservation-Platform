import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://hospitality-gallery.preview.emergentagent.com").rstrip("/")


@pytest.fixture
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ============= Root =============
def test_root_welcome(api):
    r = api.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    data = r.json()
    assert "message" in data
    assert "Lakshmi" in data["message"] or "Culinary" in data["message"]


# ============= Menu =============
def test_menu_returns_seven_items(api):
    r = api.get(f"{BASE_URL}/api/menu")
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    assert len(items) == 7
    ids = {i["id"] for i in items}
    assert ids == {"thali", "dosa", "idli", "vada", "pongal", "upma", "filter"}
    for it in items:
        assert it["name"]
        assert it["price"]
        assert it["category"]


# ============= Reservations =============
def test_create_reservation_success_and_persist(api):
    payload = {
        "name": "TEST_Ananya",
        "phone": "9999999999",
        "date": "2026-02-14",
        "time": "20:00",
        "guests": 4,
        "occasion": "Anniversary",
        "note": "Window seat please",
    }
    r = api.post(f"{BASE_URL}/api/reservations", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
    assert data["status"] == "pending"
    assert data["name"] == "TEST_Ananya"
    assert data["guests"] == 4

    # Persist verification via list
    rid = data["id"]
    lr = api.get(f"{BASE_URL}/api/reservations")
    assert lr.status_code == 200
    listing = lr.json()
    assert any(x["id"] == rid for x in listing)


def test_create_reservation_missing_fields_returns_422(api):
    # Missing required fields should fail Pydantic validation -> 422
    r = api.post(f"{BASE_URL}/api/reservations", json={})
    assert r.status_code in (400, 422)


def test_create_reservation_blank_required_returns_400(api):
    r = api.post(f"{BASE_URL}/api/reservations", json={"name": "  ", "phone": "  ", "date": "  "})
    assert r.status_code == 400


def test_list_reservations_ok(api):
    r = api.get(f"{BASE_URL}/api/reservations")
    assert r.status_code == 200
    assert isinstance(r.json(), list)
