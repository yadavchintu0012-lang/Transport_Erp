# TransportPro ERP - Enterprise Multi-Tenant SaaS

Production-grade multi-tenant Transport & Logistics Management Software with database-level tenant isolation, granular role-based access control (RBAC), operational trip dispatch, compliance tracking, and financial reconciliation.

## Architecture & Technology Stack

- **Backend**: Python 3.13, FastAPI 0.115, SQLAlchemy 2.0 ORM, Pydantic v2, SQLite / PostgreSQL ready.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts.
- **Security**: JWT Authentication, bcrypt password hashing, Organization-scoped data isolation middleware, RBAC with 8 default roles + custom roles.

---

## Quickstart Guide

### 1. Backend Service
`ash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
`
- API Documentation (Swagger): http://127.0.0.1:8000/docs

### 2. Frontend Application
`ash
cd frontend
npm install
npm run dev
`
- Web Application: http://localhost:5173/

---

## Pre-configured Demo Environment

A complete operational logistics enterprise (**Apex Express Logistics**) is pre-seeded with realistic trips, compliance alerts, and ledgers:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Company Owner** | owner@apexexpress.com | Owner@123 | Full workspace access, P&L, financials, staff RBAC |
| **Accountant** | ccounts@apexexpress.com | Accounts@123 | Invoicing, payments, P&L, ledger, direct vouchers |
| **Trip Operator** | operator@apexexpress.com | Operator@123 | Trips creation & dispatch (Profit & Admin restricted) |
| **Platform Super Admin** | dmin@transportpro.com | Admin@123 | Global SaaS management |

---

## Automated Test Verification

Run the automated integration and tenant-isolation test suite:
`ash
cd backend
python -m pytest tests/test_multi_tenancy_and_rbac.py -v
`
All tests verify:
1. Root operational health.
2. Tenant login and workspace resolution.
3. RBAC isolation (Trip Operator cannot access restricted profit or financial invoices).
4. Strict multi-tenant database isolation (Company B cannot read Company A data).
