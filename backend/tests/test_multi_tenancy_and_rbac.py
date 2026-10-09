import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["service"] == "TransportPro ERP"

def test_login_owner():
    response = client.post("/api/v1/auth/login", json={
        "email": "owner@apexexpress.com",
        "password": "Owner@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"]["code"] == "owner"
    assert data["organization"]["name"] == "Apex Express Logistics"

def test_login_trip_operator_permission_isolation():
    response = client.post("/api/v1/auth/login", json={
        "email": "operator@apexexpress.com",
        "password": "Operator@123"
    })
    assert response.status_code == 200
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    trips_res = client.get("/api/v1/trips/", headers=headers)
    assert trips_res.status_code == 200
    items = trips_res.json()["items"]
    if items:
        assert "profit" not in items[0]

    inv_res = client.get("/api/v1/invoices/", headers=headers)
    assert inv_res.status_code == 403

def test_register_new_tenant_isolation():
    rand_id = str(uuid.uuid4())[:8]
    email = f"karan_{rand_id}@bluedartcargo.com"
    reg_res = client.post("/api/v1/auth/register", json={
        "company_name": f"BlueDart Cargo {rand_id}",
        "owner_name": "Karan Singhania",
        "email": email,
        "password": "Password@123",
        "phone": "+91 9988776655",
        "city": "Bengaluru",
        "state": "Karnataka",
        "plan_code": "professional"
    })
    assert reg_res.status_code == 200
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    trips_res = client.get("/api/v1/trips/", headers=headers)
    assert trips_res.status_code == 200
    assert trips_res.json()["total"] == 0