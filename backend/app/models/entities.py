import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON, Enum
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def gen_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, index=True)
    logo_url = Column(String(500), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    country = Column(String(100), default="India")
    phone = Column(String(50), nullable=True)
    email = Column(String(150), nullable=True)
    tax_number = Column(String(50), nullable=True) # GSTIN
    currency = Column(String(10), default="INR")
    timezone = Column(String(50), default="Asia/Kolkata")
    is_active = Column(Boolean, default=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    memberships = relationship("OrganizationMembership", back_populates="organization", cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="organization", uselist=False, cascade="all, delete-orphan")
    trips = relationship("Trip", back_populates="organization", cascade="all, delete-orphan")
    vehicles = relationship("Vehicle", back_populates="organization", cascade="all, delete-orphan")
    drivers = relationship("Driver", back_populates="organization", cascade="all, delete-orphan")
    customers = relationship("Customer", back_populates="organization", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="organization", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="organization", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="organization", cascade="all, delete-orphan")

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(100), nullable=False) # Starter, Professional, Enterprise
    code = Column(String(50), unique=True, nullable=False)
    price_monthly = Column(Float, default=0.0)
    price_yearly = Column(Float, default=0.0)
    max_vehicles = Column(Integer, default=5)
    max_staff = Column(Integer, default=3)
    max_trips_monthly = Column(Integer, default=50)
    features = Column(JSON, default=list) # e.g. ["basic_reports", "csv_export", "audit_log"]
    is_active = Column(Boolean, default=True)

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id"), unique=True, nullable=False)
    plan_id = Column(String(36), ForeignKey("subscription_plans.id"), nullable=False)
    status = Column(String(50), default="active") # active, trial, past_due, canceled
    billing_cycle = Column(String(20), default="monthly") # monthly, yearly
    start_date = Column(DateTime(timezone=True), default=utc_now)
    expiry_date = Column(DateTime(timezone=True), nullable=True)
    auto_renew = Column(Boolean, default=True)

    organization = relationship("Organization", back_populates="subscription")
    plan = relationship("SubscriptionPlan")

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    is_superadmin = Column(Boolean, default=False) # SaaS Platform Owner
    is_active = Column(Boolean, default=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    memberships = relationship("OrganizationMembership", back_populates="user", cascade="all, delete-orphan")

class Role(Base):
    __tablename__ = "roles"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=True) # Null for system default roles
    name = Column(String(100), nullable=False)
    code = Column(String(100), nullable=False) # owner, admin, ops_manager, accountant, trip_operator, vehicle_manager, driver_manager, viewer, custom
    description = Column(String(255), nullable=True)
    is_system = Column(Boolean, default=False)
    permissions = Column(JSON, default=dict) # e.g. {"trips": ["view", "create", "edit", "approve"], "financials": ["view_profit"]}

class OrganizationMembership(Base):
    __tablename__ = "organization_memberships"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    role_id = Column(String(36), ForeignKey("roles.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    joined_at = Column(DateTime(timezone=True), default=utc_now)

    organization = relationship("Organization", back_populates="memberships")
    user = relationship("User", back_populates="memberships")
    role = relationship("Role")

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False, index=True)
    vehicle_number = Column(String(50), nullable=False, index=True) # e.g. MH 12 AB 1234
    vehicle_type = Column(String(50), nullable=False) # Truck, Container, Trailer, Tanker, Light Commercial
    model = Column(String(100), nullable=True)
    capacity_tonnage = Column(Float, default=0.0)
    ownership_type = Column(String(30), default="owned") # owned, leased, attached
    status = Column(String(30), default="available") # available, on_trip, maintenance, inactive
    assigned_driver_id = Column(String(36), ForeignKey("drivers.id"), nullable=True)
    insurance_expiry = Column(DateTime(timezone=True), nullable=True)
    fitness_expiry = Column(DateTime(timezone=True), nullable=True)
    permit_expiry = Column(DateTime(timezone=True), nullable=True)
    pollution_expiry = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    organization = relationship("Organization", back_populates="vehicles")
    assigned_driver = relationship("Driver", foreign_keys=[assigned_driver_id])
    trips = relationship("Trip", back_populates="vehicle")

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(150), nullable=True)
    license_number = Column(String(100), nullable=False)
    license_expiry = Column(DateTime(timezone=True), nullable=True)
    employment_type = Column(String(30), default="permanent") # permanent, contract, trip_basis
    salary_amount = Column(Float, default=0.0)
    status = Column(String(30), default="available") # available, on_trip, on_leave, inactive
    joining_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    organization = relationship("Organization", back_populates="drivers")
    trips = relationship("Trip", back_populates="driver")

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False, index=True)
    customer_type = Column(String(50), default="business") # business, individual, logistics_partner
    contact_person = Column(String(150), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(150), nullable=True)
    billing_address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    tax_number = Column(String(50), nullable=True) # GSTIN
    credit_limit = Column(Float, default=0.0)
    opening_balance = Column(Float, default=0.0)
    status = Column(String(20), default="active")
    created_at = Column(DateTime(timezone=True), default=utc_now)

    organization = relationship("Organization", back_populates="customers")
    trips = relationship("Trip", back_populates="customer")
    invoices = relationship("Invoice", back_populates="customer")

class Trip(Base):
    __tablename__ = "trips"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False, index=True)
    trip_number = Column(String(50), nullable=False, index=True) # e.g. TRP-2026-0001
    trip_date = Column(DateTime(timezone=True), nullable=False)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    vehicle_id = Column(String(36), ForeignKey("vehicles.id"), nullable=False)
    driver_id = Column(String(36), ForeignKey("drivers.id"), nullable=False)
    customer_po_ref = Column(String(100), nullable=True)

    pickup_city = Column(String(100), nullable=False)
    pickup_address = Column(Text, nullable=True)
    delivery_city = Column(String(100), nullable=False)
    delivery_address = Column(Text, nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=True)
    end_time = Column(DateTime(timezone=True), nullable=True)

    cargo_description = Column(String(255), nullable=True)
    cargo_weight_tonnes = Column(Float, default=0.0)

    # Revenue
    freight_charges = Column(Float, default=0.0)
    additional_charges = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    total_revenue = Column(Float, default=0.0) # freight + additional + tax - discount
    amount_paid = Column(Float, default=0.0) # customer advance or paid amount
    due_amount = Column(Float, default=0.0) # total_revenue - amount_paid

    # Direct Trip Expenses
    diesel_expense = Column(Float, default=0.0)
    toll_expense = Column(Float, default=0.0)
    driver_allowance = Column(Float, default=0.0)
    loading_unloading_expense = Column(Float, default=0.0)
    other_direct_expense = Column(Float, default=0.0)
    total_expenses = Column(Float, default=0.0)
    trip_profit = Column(Float, default=0.0) # (total_revenue - tax_amount) - total_expenses

    status = Column(String(30), default="scheduled") # scheduled, dispatched, in_transit, delivered, completed, cancelled
    cancellation_reason = Column(Text, nullable=True)
    is_approved = Column(Boolean, default=False)
    approved_by = Column(String(36), nullable=True)
    created_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    organization = relationship("Organization", back_populates="trips")
    customer = relationship("Customer", back_populates="trips")
    vehicle = relationship("Vehicle", back_populates="trips")
    driver = relationship("Driver", back_populates="trips")
    created_by = relationship("User")
    expenses_rel = relationship("Expense", back_populates="trip")
    invoices = relationship("Invoice", back_populates="trip")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False, index=True)
    expense_number = Column(String(50), nullable=False)
    expense_date = Column(DateTime(timezone=True), nullable=False)
    category = Column(String(100), nullable=False) # diesel, toll, driver_allowance, maintenance, office_rent, road_tax, insurance, administrative, other
    amount = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    is_trip_direct = Column(Boolean, default=False) # direct trip cost vs company overhead
    trip_id = Column(String(36), ForeignKey("trips.id"), nullable=True)
    vehicle_id = Column(String(36), ForeignKey("vehicles.id"), nullable=True)
    driver_id = Column(String(36), ForeignKey("drivers.id"), nullable=True)
    vendor_name = Column(String(150), nullable=True)
    payment_method = Column(String(50), default="cash") # cash, bank_transfer, upi, card, credit
    payment_status = Column(String(30), default="paid") # paid, pending, partial
    is_approved = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    created_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    organization = relationship("Organization", back_populates="expenses")
    trip = relationship("Trip", back_populates="expenses_rel")
    vehicle = relationship("Vehicle")
    driver = relationship("Driver")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False, index=True)
    invoice_number = Column(String(50), nullable=False, index=True) # INV-2026-0001
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    trip_id = Column(String(36), ForeignKey("trips.id"), nullable=True)
    invoice_date = Column(DateTime(timezone=True), nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=False)
    subtotal = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    paid_amount = Column(Float, default=0.0)
    balance_amount = Column(Float, default=0.0)
    status = Column(String(30), default="issued") # draft, issued, partially_paid, paid, overdue, cancelled
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    organization = relationship("Organization", back_populates="invoices")
    customer = relationship("Customer", back_populates="invoices")
    trip = relationship("Trip", back_populates="invoices")
    payments = relationship("Payment", back_populates="invoice", cascade="all, delete-orphan")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False, index=True)
    invoice_id = Column(String(36), ForeignKey("invoices.id"), nullable=False)
    payment_number = Column(String(50), nullable=False)
    payment_date = Column(DateTime(timezone=True), nullable=False)
    amount = Column(Float, default=0.0)
    payment_method = Column(String(50), default="bank_transfer") # cash, bank_transfer, upi, cheque
    reference_number = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    invoice = relationship("Invoice", back_populates="payments")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True) # Null for all org staff
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="info") # info, warning, alert, expiry, trip
    link = Column(String(200), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False) # e.g. login, trip_create, expense_approve, role_update
    entity_name = Column(String(50), nullable=True)
    entity_id = Column(String(50), nullable=True)
    details = Column(JSON, default=dict)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    organization = relationship("Organization", back_populates="audit_logs")
    user = relationship("User")
