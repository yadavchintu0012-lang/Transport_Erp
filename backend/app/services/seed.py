from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.core.rbac import SYSTEM_ROLES
from app.models.entities import (
    User, Organization, OrganizationMembership, Role,
    SubscriptionPlan, Subscription, Vehicle, Driver, Customer,
    Trip, Expense, Invoice, Payment
)

def seed():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # 1. Seed Subscription Plans
    plans_data = [
        {"name": "Starter Fleet", "code": "starter", "price_monthly": 1499, "price_yearly": 14990, "max_vehicles": 5, "max_staff": 3, "max_trips_monthly": 50, "features": ["basic_trips", "expense_logging"]},
        {"name": "Professional Logistics", "code": "professional", "price_monthly": 3999, "price_yearly": 39990, "max_vehicles": 25, "max_staff": 10, "max_trips_monthly": 300, "features": ["all_trips", "invoicing", "profit_loss", "csv_export"]},
        {"name": "Enterprise Freight", "code": "enterprise", "price_monthly": 8999, "price_yearly": 89990, "max_vehicles": 100, "max_staff": 50, "max_trips_monthly": 2000, "features": ["unlimited", "multi_branch", "api_access", "custom_roles"]}
    ]
    for p in plans_data:
        if not db.query(SubscriptionPlan).filter(SubscriptionPlan.code == p["code"]).first():
            db.add(SubscriptionPlan(**p))
    db.commit()

    # 2. Seed Super Admin
    if not db.query(User).filter(User.email == "admin@transportpro.com").first():
        super_admin = User(
            email="admin@transportpro.com",
            hashed_password=get_password_hash("Admin@123"),
            full_name="Platform Super Admin",
            is_superadmin=True
        )
        db.add(super_admin)
        db.commit()

    # 3. Seed Demo Transport Organization: "Apex Express Logistics"
    demo_org = db.query(Organization).filter(Organization.slug == "apex-express").first()
    if not demo_org:
        demo_org = Organization(
            name="Apex Express Logistics",
            slug="apex-express",
            address="Plot 42, Transport Nagar, Nigdi",
            city="Pune",
            state="Maharashtra",
            phone="+91 98765 43210",
            email="ops@apexexpress.com",
            tax_number="27AABCA1234F1Z5",
            currency="INR",
            is_demo=True
        )
        db.add(demo_org)
        db.flush()

        # Seed roles for demo org
        roles_dict = {}
        for code, info in SYSTEM_ROLES.items():
            r = Role(
                organization_id=demo_org.id,
                name=info["name"],
                code=code,
                description=info["description"],
                is_system=True,
                permissions=info["permissions"]
            )
            db.add(r)
            db.flush()
            roles_dict[code] = r

        # Seed Demo Users
        # 1. Owner
        owner_user = User(
            email="owner@apexexpress.com",
            hashed_password=get_password_hash("Owner@123"),
            full_name="Rajesh Sharma",
            phone="+91 98220 11223"
        )
        db.add(owner_user)
        db.flush()
        db.add(OrganizationMembership(organization_id=demo_org.id, user_id=owner_user.id, role_id=roles_dict["owner"].id))

        # 2. Accountant
        acc_user = User(
            email="accounts@apexexpress.com",
            hashed_password=get_password_hash("Accounts@123"),
            full_name="Sunil Deshmukh",
            phone="+91 98220 44556"
        )
        db.add(acc_user)
        db.flush()
        db.add(OrganizationMembership(organization_id=demo_org.id, user_id=acc_user.id, role_id=roles_dict["accountant"].id))

        # 3. Trip Entry Operator
        trip_op = User(
            email="operator@apexexpress.com",
            hashed_password=get_password_hash("Operator@123"),
            full_name="Vikas Patil",
            phone="+91 98220 77889"
        )
        db.add(trip_op)
        db.flush()
        db.add(OrganizationMembership(organization_id=demo_org.id, user_id=trip_op.id, role_id=roles_dict["trip_operator"].id))

        # Subscription
        pro_plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.code == "professional").first()
        db.add(Subscription(organization_id=demo_org.id, plan_id=pro_plan.id, status="active"))

        # Seed Drivers
        d1 = Driver(
            organization_id=demo_org.id,
            name="Ramesh Kumar",
            phone="+91 91234 56789",
            license_number="MH1420180045612",
            license_expiry=datetime.now(timezone.utc) + timedelta(days=240),
            salary_amount=22000,
            status="available"
        )
        d2 = Driver(
            organization_id=demo_org.id,
            name="Mohan Yadav",
            phone="+91 92345 67890",
            license_number="MH1220190089123",
            license_expiry=datetime.now(timezone.utc) + timedelta(days=15), # Expiry warning
            salary_amount=24000,
            status="available"
        )
        d3 = Driver(
            organization_id=demo_org.id,
            name="Gurpreet Singh",
            phone="+91 93456 78901",
            license_number="PB1020160012984",
            license_expiry=datetime.now(timezone.utc) + timedelta(days=450),
            salary_amount=26000,
            status="available"
        )
        db.add_all([d1, d2, d3])
        db.flush()

        # Seed Vehicles
        v1 = Vehicle(
            organization_id=demo_org.id,
            vehicle_number="MH 12 AB 9988",
            vehicle_type="Heavy Truck (10 Wheeler)",
            model="Tata Signa 2823.K",
            capacity_tonnage=16.5,
            assigned_driver_id=d1.id,
            insurance_expiry=datetime.now(timezone.utc) + timedelta(days=20), # Expiry alert
            fitness_expiry=datetime.now(timezone.utc) + timedelta(days=180),
            status="available"
        )
        v2 = Vehicle(
            organization_id=demo_org.id,
            vehicle_number="MH 14 CC 4521",
            vehicle_type="Container 32ft MXL",
            model="BharatBenz 3528C",
            capacity_tonnage=22.0,
            assigned_driver_id=d2.id,
            insurance_expiry=datetime.now(timezone.utc) + timedelta(days=120),
            fitness_expiry=datetime.now(timezone.utc) + timedelta(days=12), # Expiry alert
            status="available"
        )
        v3 = Vehicle(
            organization_id=demo_org.id,
            vehicle_number="MH 04 GD 7712",
            vehicle_type="Light Commercial Vehicle",
            model="Eicher Pro 2049",
            capacity_tonnage=4.9,
            assigned_driver_id=d3.id,
            insurance_expiry=datetime.now(timezone.utc) + timedelta(days=290),
            fitness_expiry=datetime.now(timezone.utc) + timedelta(days=330),
            status="available"
        )
        db.add_all([v1, v2, v3])
        db.flush()

        # Seed Customers
        c1 = Customer(
            organization_id=demo_org.id,
            name="Reliance Retail Warehousing",
            customer_type="corporate",
            contact_person="Anil Mehta",
            phone="+91 22 2847 9000",
            email="logistics@relretail.com",
            billing_address="Ghansoli MIDC, Navi Mumbai",
            city="Navi Mumbai",
            state="Maharashtra",
            tax_number="27AAACR1234M1ZV",
            credit_limit=500000,
            opening_balance=0
        )
        c2 = Customer(
            organization_id=demo_org.id,
            name="Tata Motors Auto Ancillary",
            customer_type="business",
            contact_person="Deepak Kulkarni",
            phone="+91 20 6613 2000",
            email="dispatch@tataancillaries.com",
            billing_address="Pimpri MIDC, Pune",
            city="Pune",
            state="Maharashtra",
            tax_number="27AAACT5678Q1Z3",
            credit_limit=800000,
            opening_balance=0
        )
        c3 = Customer(
            organization_id=demo_org.id,
            name="Amazon Fulfillment Center PNQ2",
            customer_type="corporate",
            contact_person="Rohan Vernekar",
            phone="+91 20 4455 1122",
            email="fc-pnq2@amazon.in",
            billing_address="Chakan Phase 2, Pune",
            city="Chakan",
            state="Maharashtra",
            tax_number="27AABCA9988D1Z9",
            credit_limit=1000000,
            opening_balance=0
        )
        db.add_all([c1, c2, c3])
        db.flush()

        # Seed Realistic Operational Trips
        # Trip 1: Pune -> Mumbai (Delivered & Completed)
        t1_rev = 38000
        t1_tax = 1900
        t1_exp = 11500 + 2400 + 1500 + 1000 # diesel, toll, allowance, loading
        t1 = Trip(
            organization_id=demo_org.id,
            trip_number="TRP-2026-0001",
            trip_date=datetime.now(timezone.utc) - timedelta(days=6),
            customer_id=c1.id,
            vehicle_id=v1.id,
            driver_id=d1.id,
            customer_po_ref="PO-REL-9921",
            pickup_city="Pune",
            pickup_address="Chakan Industrial Area",
            delivery_city="Navi Mumbai",
            delivery_address="Reliance Central Warehouse, Ghansoli",
            cargo_description="FMCG & Packaged Goods",
            cargo_weight_tonnes=14.2,
            freight_charges=38000,
            tax_amount=t1_tax,
            total_revenue=39900,
            amount_paid=39900,
            due_amount=0,
            diesel_expense=11500,
            toll_expense=2400,
            driver_allowance=1500,
            loading_unloading_expense=1000,
            total_expenses=t1_exp,
            trip_profit=(39900 - t1_tax) - t1_exp,
            status="completed",
            is_approved=True,
            created_by_user_id=owner_user.id
        )

        # Trip 2: Pune -> Ahmedabad (In Transit)
        t2_rev = 62000
        t2_tax = 3100
        t2_exp = 22000 + 4200 + 2500 + 1200
        t2 = Trip(
            organization_id=demo_org.id,
            trip_number="TRP-2026-0002",
            trip_date=datetime.now(timezone.utc) - timedelta(days=2),
            customer_id=c2.id,
            vehicle_id=v2.id,
            driver_id=d2.id,
            customer_po_ref="PO-TATA-5541",
            pickup_city="Pune",
            pickup_address="Tata Motors Plant 1, Pimpri",
            delivery_city="Ahmedabad",
            delivery_address="Sanand Auto Cluster, Ahmedabad",
            cargo_description="Automotive Engine Assemblies",
            cargo_weight_tonnes=18.5,
            freight_charges=62000,
            tax_amount=t2_tax,
            total_revenue=65100,
            amount_paid=25000,
            due_amount=40100,
            diesel_expense=22000,
            toll_expense=4200,
            driver_allowance=2500,
            loading_unloading_expense=1200,
            total_expenses=t2_exp,
            trip_profit=(65100 - t2_tax) - t2_exp,
            status="in_transit",
            is_approved=True,
            created_by_user_id=owner_user.id
        )

        # Trip 3: Chakan -> Hyderabad (Dispatched)
        t3_rev = 54000
        t3_tax = 2700
        t3_exp = 18500 + 3800 + 2000 + 1000
        t3 = Trip(
            organization_id=demo_org.id,
            trip_number="TRP-2026-0003",
            trip_date=datetime.now(timezone.utc) - timedelta(days=1),
            customer_id=c3.id,
            vehicle_id=v3.id,
            driver_id=d3.id,
            customer_po_ref="AMZ-DEL-0091",
            pickup_city="Pune",
            pickup_address="Amazon FC PNQ2, Chakan",
            delivery_city="Hyderabad",
            delivery_address="Amazon FC HYD1, Shamshabad",
            cargo_description="High-value Consumer Electronics",
            cargo_weight_tonnes=4.5,
            freight_charges=54000,
            tax_amount=t3_tax,
            total_revenue=56700,
            amount_paid=0,
            due_amount=56700,
            diesel_expense=18500,
            toll_expense=3800,
            driver_allowance=2000,
            loading_unloading_expense=1000,
            total_expenses=t3_exp,
            trip_profit=(56700 - t3_tax) - t3_exp,
            status="dispatched",
            is_approved=True,
            created_by_user_id=owner_user.id
        )

        db.add_all([t1, t2, t3])
        db.flush()

        # Update vehicles status
        v2.status = "on_trip"
        d2.status = "on_trip"
        v3.status = "on_trip"
        d3.status = "on_trip"

        # General Overheads (Office Rent, Maintenance, Road Tax)
        e1 = Expense(
            organization_id=demo_org.id,
            expense_number="EXP-2026-0001",
            expense_date=datetime.now(timezone.utc) - timedelta(days=8),
            category="office_rent",
            amount=25000,
            is_trip_direct=False,
            vendor_name="Transport Nagar Commercial Complex",
            payment_method="bank_transfer",
            payment_status="paid",
            notes="Monthly head office rent",
            created_by_user_id=owner_user.id
        )
        e2 = Expense(
            organization_id=demo_org.id,
            expense_number="EXP-2026-0002",
            expense_date=datetime.now(timezone.utc) - timedelta(days=5),
            category="vehicle_maintenance",
            amount=8500,
            is_trip_direct=False,
            vehicle_id=v1.id,
            vendor_name="Shree Ram Auto Garage",
            payment_method="upi",
            payment_status="paid",
            notes="Brake pad replacement and oil filter check",
            created_by_user_id=owner_user.id
        )
        db.add_all([e1, e2])
        db.flush()

        # Invoices and Payments
        inv1 = Invoice(
            organization_id=demo_org.id,
            invoice_number="INV-2026-0001",
            customer_id=c1.id,
            trip_id=t1.id,
            invoice_date=datetime.now(timezone.utc) - timedelta(days=5),
            due_date=datetime.now(timezone.utc) + timedelta(days=25),
            subtotal=38000,
            tax_amount=1900,
            total_amount=39900,
            paid_amount=39900,
            balance_amount=0,
            status="paid",
            notes="Paid in full via NEFT"
        )
        db.add(inv1)
        db.flush()

        pay1 = Payment(
            organization_id=demo_org.id,
            invoice_id=inv1.id,
            payment_number="PAY-2026-0001",
            payment_date=datetime.now(timezone.utc) - timedelta(days=3),
            amount=39900,
            payment_method="bank_transfer",
            reference_number="NEFT-HDFC-99281726"
        )
        db.add(pay1)

        inv2 = Invoice(
            organization_id=demo_org.id,
            invoice_number="INV-2026-0002",
            customer_id=c2.id,
            trip_id=t2.id,
            invoice_date=datetime.now(timezone.utc) - timedelta(days=1),
            due_date=datetime.now(timezone.utc) + timedelta(days=29),
            subtotal=62000,
            tax_amount=3100,
            total_amount=65100,
            paid_amount=25000,
            balance_amount=40100,
            status="partially_paid",
            notes="Advance payment received of INR 25,000"
        )
        db.add(inv2)
        db.flush()

        pay2 = Payment(
            organization_id=demo_org.id,
            invoice_id=inv2.id,
            payment_number="PAY-2026-0002",
            payment_date=datetime.now(timezone.utc) - timedelta(days=1),
            amount=25000,
            payment_method="bank_transfer",
            reference_number="RTGS-ICICI-44129988"
        )
        db.add(pay2)

        db.commit()
        print("Demo seed data created successfully!")

    db.close()

if __name__ == "__main__":
    seed()
