from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]
    organization: Optional[Dict[str, Any]] = None
    role: Optional[Dict[str, Any]] = None
    permissions: Dict[str, List[str]] = {}

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterCompanyRequest(BaseModel):
    company_name: str
    owner_name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    tax_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    plan_code: Optional[str] = "professional"

# --- User & Staff Schemas ---
class StaffCreateRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role_id: str

class StaffUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role_id: Optional[str] = None
    is_active: Optional[bool] = None

# --- Role & RBAC Schemas ---
class RoleCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: Dict[str, List[str]] # e.g. {"trips": ["view", "create"]}

class RoleUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[Dict[str, List[str]]] = None

# --- Vehicle Schemas ---
class VehicleCreateRequest(BaseModel):
    vehicle_number: str
    vehicle_type: str
    model: Optional[str] = None
    capacity_tonnage: Optional[float] = 0.0
    ownership_type: Optional[str] = "owned"
    assigned_driver_id: Optional[str] = None
    insurance_expiry: Optional[datetime] = None
    fitness_expiry: Optional[datetime] = None
    permit_expiry: Optional[datetime] = None
    pollution_expiry: Optional[datetime] = None

class VehicleUpdateRequest(BaseModel):
    vehicle_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    model: Optional[str] = None
    capacity_tonnage: Optional[float] = None
    ownership_type: Optional[str] = None
    status: Optional[str] = None
    assigned_driver_id: Optional[str] = None
    insurance_expiry: Optional[datetime] = None
    fitness_expiry: Optional[datetime] = None
    permit_expiry: Optional[datetime] = None
    pollution_expiry: Optional[datetime] = None

# --- Driver Schemas ---
class DriverCreateRequest(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    license_number: str
    license_expiry: Optional[datetime] = None
    employment_type: Optional[str] = "permanent"
    salary_amount: Optional[float] = 0.0

class DriverUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    license_number: Optional[str] = None
    license_expiry: Optional[datetime] = None
    employment_type: Optional[str] = None
    salary_amount: Optional[float] = None
    status: Optional[str] = None

# --- Customer Schemas ---
class CustomerCreateRequest(BaseModel):
    name: str
    customer_type: Optional[str] = "business"
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    billing_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    tax_number: Optional[str] = None
    credit_limit: Optional[float] = 0.0
    opening_balance: Optional[float] = 0.0

class CustomerUpdateRequest(BaseModel):
    name: Optional[str] = None
    customer_type: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    billing_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    tax_number: Optional[str] = None
    credit_limit: Optional[float] = None
    status: Optional[str] = None

# --- Trip Schemas ---
class TripCreateRequest(BaseModel):
    trip_date: datetime
    customer_id: str
    vehicle_id: str
    driver_id: str
    customer_po_ref: Optional[str] = None
    pickup_city: str
    pickup_address: Optional[str] = None
    delivery_city: str
    delivery_address: Optional[str] = None
    cargo_description: Optional[str] = None
    cargo_weight_tonnes: Optional[float] = 0.0
    
    # Financials
    freight_charges: float = 0.0
    additional_charges: float = 0.0
    discount: float = 0.0
    tax_amount: float = 0.0
    amount_paid: float = 0.0
    due_amount: Optional[float] = None

    # Direct Expenses
    diesel_expense: float = 0.0
    toll_expense: float = 0.0
    driver_allowance: float = 0.0
    loading_unloading_expense: float = 0.0
    other_direct_expense: float = 0.0

class TripUpdateRequest(BaseModel):
    trip_date: Optional[datetime] = None
    customer_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    customer_po_ref: Optional[str] = None
    pickup_city: Optional[str] = None
    pickup_address: Optional[str] = None
    delivery_city: Optional[str] = None
    delivery_address: Optional[str] = None
    cargo_description: Optional[str] = None
    cargo_weight_tonnes: Optional[float] = None
    freight_charges: Optional[float] = None
    additional_charges: Optional[float] = None
    discount: Optional[float] = None
    tax_amount: Optional[float] = None
    amount_paid: Optional[float] = None
    due_amount: Optional[float] = None
    diesel_expense: Optional[float] = None
    toll_expense: Optional[float] = None
    driver_allowance: Optional[float] = None
    loading_unloading_expense: Optional[float] = None
    other_direct_expense: Optional[float] = None
    status: Optional[str] = None
    cancellation_reason: Optional[str] = None

# --- Expense Schemas ---
class ExpenseCreateRequest(BaseModel):
    expense_date: datetime
    category: str
    amount: float
    tax_amount: Optional[float] = 0.0
    is_trip_direct: Optional[bool] = False
    trip_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    vendor_name: Optional[str] = None
    payment_method: Optional[str] = "cash"
    payment_status: Optional[str] = "paid"
    notes: Optional[str] = None

class ExpenseUpdateRequest(BaseModel):
    expense_date: Optional[datetime] = None
    category: Optional[str] = None
    amount: Optional[float] = None
    tax_amount: Optional[float] = None
    is_trip_direct: Optional[bool] = None
    trip_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    vendor_name: Optional[str] = None
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None
    is_approved: Optional[bool] = None
    notes: Optional[str] = None

# --- Invoice & Payment Schemas ---
class InvoiceCreateRequest(BaseModel):
    customer_id: str
    trip_id: Optional[str] = None
    invoice_date: datetime
    due_date: datetime
    subtotal: float
    tax_amount: Optional[float] = 0.0
    notes: Optional[str] = None

class PaymentCreateRequest(BaseModel):
    amount: float
    payment_date: datetime
    payment_method: Optional[str] = "bank_transfer"
    reference_number: Optional[str] = None
    notes: Optional[str] = None
