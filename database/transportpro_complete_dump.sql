--
-- PostgreSQL database dump
--

\restrict Hl6qZ6DpyZMtiPF4byBjejg5YaK70UVRDcPsf3eemCgVleTIRXW111xQ6KeH3I9

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id character varying(36) NOT NULL,
    organization_id character varying(36),
    user_id character varying(36),
    action character varying(100) NOT NULL,
    entity_name character varying(50),
    entity_id character varying(50),
    details json,
    ip_address character varying(50),
    created_at timestamp with time zone
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id character varying(36) NOT NULL,
    organization_id character varying(36) NOT NULL,
    name character varying(200) NOT NULL,
    customer_type character varying(50),
    contact_person character varying(150),
    phone character varying(50),
    email character varying(150),
    billing_address text,
    city character varying(100),
    state character varying(100),
    tax_number character varying(50),
    credit_limit double precision,
    opening_balance double precision,
    status character varying(20),
    created_at timestamp with time zone
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: drivers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drivers (
    id character varying(36) NOT NULL,
    organization_id character varying(36) NOT NULL,
    name character varying(150) NOT NULL,
    phone character varying(50) NOT NULL,
    email character varying(150),
    license_number character varying(100) NOT NULL,
    license_expiry timestamp with time zone,
    employment_type character varying(30),
    salary_amount double precision,
    status character varying(30),
    joining_date timestamp with time zone,
    created_at timestamp with time zone
);


ALTER TABLE public.drivers OWNER TO postgres;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id character varying(36) NOT NULL,
    organization_id character varying(36) NOT NULL,
    expense_number character varying(50) NOT NULL,
    expense_date timestamp with time zone NOT NULL,
    category character varying(100) NOT NULL,
    amount double precision,
    tax_amount double precision,
    is_trip_direct boolean,
    trip_id character varying(36),
    vehicle_id character varying(36),
    driver_id character varying(36),
    vendor_name character varying(150),
    payment_method character varying(50),
    payment_status character varying(30),
    is_approved boolean,
    notes text,
    created_by_user_id character varying(36) NOT NULL,
    created_at timestamp with time zone
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id character varying(36) NOT NULL,
    organization_id character varying(36) NOT NULL,
    invoice_number character varying(50) NOT NULL,
    customer_id character varying(36) NOT NULL,
    trip_id character varying(36),
    invoice_date timestamp with time zone NOT NULL,
    due_date timestamp with time zone NOT NULL,
    subtotal double precision,
    tax_amount double precision,
    total_amount double precision,
    paid_amount double precision,
    balance_amount double precision,
    status character varying(30),
    notes text,
    created_at timestamp with time zone
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id character varying(36) NOT NULL,
    organization_id character varying(36) NOT NULL,
    user_id character varying(36),
    title character varying(200) NOT NULL,
    message text NOT NULL,
    notification_type character varying(50),
    link character varying(200),
    is_read boolean,
    created_at timestamp with time zone
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: organization_memberships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organization_memberships (
    id character varying(36) NOT NULL,
    organization_id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    role_id character varying(36) NOT NULL,
    is_active boolean,
    joined_at timestamp with time zone
);


ALTER TABLE public.organization_memberships OWNER TO postgres;

--
-- Name: organizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizations (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(100),
    logo_url character varying(500),
    address text,
    city character varying(100),
    state character varying(100),
    postal_code character varying(20),
    country character varying(100),
    phone character varying(50),
    email character varying(150),
    tax_number character varying(50),
    currency character varying(10),
    timezone character varying(50),
    is_active boolean,
    is_demo boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.organizations OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id character varying(36) NOT NULL,
    organization_id character varying(36) NOT NULL,
    invoice_id character varying(36) NOT NULL,
    payment_number character varying(50) NOT NULL,
    payment_date timestamp with time zone NOT NULL,
    amount double precision,
    payment_method character varying(50),
    reference_number character varying(100),
    notes text,
    created_at timestamp with time zone
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id character varying(36) NOT NULL,
    organization_id character varying(36),
    name character varying(100) NOT NULL,
    code character varying(100) NOT NULL,
    description character varying(255),
    is_system boolean,
    permissions json
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: saas_admin_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.saas_admin_notes (
    id character varying(36) NOT NULL,
    organization_id character varying(36) NOT NULL,
    created_by_user_id character varying(36) NOT NULL,
    note text NOT NULL,
    category character varying(50),
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.saas_admin_notes OWNER TO postgres;

--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_plans (
    id character varying(36) NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    price_monthly double precision,
    price_yearly double precision,
    trial_days integer,
    max_vehicles integer,
    max_staff integer,
    max_trips_monthly integer,
    features json,
    is_active boolean,
    is_visible boolean,
    sort_order integer,
    created_at timestamp with time zone
);


ALTER TABLE public.subscription_plans OWNER TO postgres;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id character varying(36) NOT NULL,
    organization_id character varying(36) NOT NULL,
    plan_id character varying(36) NOT NULL,
    status character varying(50),
    billing_cycle character varying(20),
    start_date timestamp with time zone,
    trial_end_date timestamp with time zone,
    expiry_date timestamp with time zone,
    auto_renew boolean,
    suspended_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    cancellation_reason text,
    admin_notes text,
    amount_paid double precision,
    updated_at timestamp with time zone
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: trips; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trips (
    id character varying(36) NOT NULL,
    organization_id character varying(36) NOT NULL,
    trip_number character varying(50) NOT NULL,
    trip_date timestamp with time zone NOT NULL,
    customer_id character varying(36) NOT NULL,
    vehicle_id character varying(36) NOT NULL,
    driver_id character varying(36) NOT NULL,
    customer_po_ref character varying(100),
    pickup_city character varying(100) NOT NULL,
    pickup_address text,
    delivery_city character varying(100) NOT NULL,
    delivery_address text,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    cargo_description character varying(255),
    cargo_weight_tonnes double precision,
    freight_charges double precision,
    additional_charges double precision,
    discount double precision,
    tax_amount double precision,
    total_revenue double precision,
    amount_paid double precision,
    due_amount double precision,
    diesel_expense double precision,
    toll_expense double precision,
    driver_allowance double precision,
    loading_unloading_expense double precision,
    other_direct_expense double precision,
    total_expenses double precision,
    trip_profit double precision,
    status character varying(30),
    cancellation_reason text,
    is_approved boolean,
    approved_by character varying(36),
    created_by_user_id character varying(36) NOT NULL,
    created_at timestamp with time zone
);


ALTER TABLE public.trips OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying(36) NOT NULL,
    email character varying(255) NOT NULL,
    hashed_password character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    phone character varying(50),
    is_superadmin boolean,
    is_active boolean,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicles (
    id character varying(36) NOT NULL,
    organization_id character varying(36) NOT NULL,
    vehicle_number character varying(50) NOT NULL,
    vehicle_type character varying(50) NOT NULL,
    model character varying(100),
    capacity_tonnage double precision,
    ownership_type character varying(30),
    status character varying(30),
    assigned_driver_id character varying(36),
    insurance_expiry timestamp with time zone,
    fitness_expiry timestamp with time zone,
    permit_expiry timestamp with time zone,
    pollution_expiry timestamp with time zone,
    created_at timestamp with time zone
);


ALTER TABLE public.vehicles OWNER TO postgres;

--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.audit_logs (id, organization_id, user_id, action, entity_name, entity_id, details, ip_address, created_at) VALUES ('91380cb9-b667-49b7-a65c-126fd60f3079', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', '3c5c3484-a996-4159-9920-ebcbb398b51e', 'login', 'User', '3c5c3484-a996-4159-9920-ebcbb398b51e', '{}', NULL, '2026-10-17 21:04:04.90296+05:30');
INSERT INTO public.audit_logs (id, organization_id, user_id, action, entity_name, entity_id, details, ip_address, created_at) VALUES ('4973848e-9441-4a30-9d03-4a16e18e50a0', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'abf6514f-6e28-4246-9742-cf14d5490358', 'login', 'User', 'abf6514f-6e28-4246-9742-cf14d5490358', '{}', NULL, '2026-10-17 21:04:05.147411+05:30');
INSERT INTO public.audit_logs (id, organization_id, user_id, action, entity_name, entity_id, details, ip_address, created_at) VALUES ('46b7dae8-cdc8-480f-84d7-f1478a60cab4', 'd04afb87-bb27-4a39-a7f8-6fc5b2caf3df', 'f0d49e88-9f75-4d4e-9cfc-fe38f5170ee3', 'register_company', 'Organization', 'd04afb87-bb27-4a39-a7f8-6fc5b2caf3df', '{"company_name": "BlueDart Cargo 021514d1"}', NULL, '2026-10-17 21:04:05.471768+05:30');


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.customers (id, organization_id, name, customer_type, contact_person, phone, email, billing_address, city, state, tax_number, credit_limit, opening_balance, status, created_at) VALUES ('cac4aa43-f72a-454d-bb7b-95ef8b082d17', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'Reliance Retail Warehousing', 'corporate', 'Anil Mehta', '+91 22 2847 9000', 'logistics@relretail.com', 'Ghansoli MIDC, Navi Mumbai', 'Navi Mumbai', 'Maharashtra', '27AAACR1234M1ZV', 500000, 0, 'active', '2026-10-17 21:02:50.59586+05:30');
INSERT INTO public.customers (id, organization_id, name, customer_type, contact_person, phone, email, billing_address, city, state, tax_number, credit_limit, opening_balance, status, created_at) VALUES ('d0041992-e1df-445c-95c0-9a1a79aefac6', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'Tata Motors Auto Ancillary', 'business', 'Deepak Kulkarni', '+91 20 6613 2000', 'dispatch@tataancillaries.com', 'Pimpri MIDC, Pune', 'Pune', 'Maharashtra', '27AAACT5678Q1Z3', 800000, 0, 'active', '2026-10-17 21:02:50.595865+05:30');
INSERT INTO public.customers (id, organization_id, name, customer_type, contact_person, phone, email, billing_address, city, state, tax_number, credit_limit, opening_balance, status, created_at) VALUES ('a8de66fe-13ec-4bf3-b29f-53fa6e97460d', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'Amazon Fulfillment Center PNQ2', 'corporate', 'Rohan Vernekar', '+91 20 4455 1122', 'fc-pnq2@amazon.in', 'Chakan Phase 2, Pune', 'Chakan', 'Maharashtra', '27AABCA9988D1Z9', 1000000, 0, 'active', '2026-10-17 21:02:50.595868+05:30');


--
-- Data for Name: drivers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.drivers (id, organization_id, name, phone, email, license_number, license_expiry, employment_type, salary_amount, status, joining_date, created_at) VALUES ('ef59af5f-7a78-4a34-af0a-269ad4e564a0', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'Ramesh Kumar', '+91 91234 56789', NULL, 'MH1420180045612', '2027-06-14 21:02:50.580313+05:30', 'permanent', 22000, 'available', NULL, '2026-10-17 21:02:50.581624+05:30');
INSERT INTO public.drivers (id, organization_id, name, phone, email, license_number, license_expiry, employment_type, salary_amount, status, joining_date, created_at) VALUES ('04f5072a-da43-4179-ba54-31f884b20896', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'Mohan Yadav', '+91 92345 67890', NULL, 'MH1220190089123', '2026-11-01 21:02:50.58042+05:30', 'permanent', 24000, 'on_trip', NULL, '2026-10-17 21:02:50.581629+05:30');
INSERT INTO public.drivers (id, organization_id, name, phone, email, license_number, license_expiry, employment_type, salary_amount, status, joining_date, created_at) VALUES ('e961c75d-41fe-487e-98b8-793391cb5777', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'Gurpreet Singh', '+91 93456 78901', NULL, 'PB1020160012984', '2028-01-10 21:02:50.580435+05:30', 'permanent', 26000, 'on_trip', NULL, '2026-10-17 21:02:50.581633+05:30');


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.expenses (id, organization_id, expense_number, expense_date, category, amount, tax_amount, is_trip_direct, trip_id, vehicle_id, driver_id, vendor_name, payment_method, payment_status, is_approved, notes, created_by_user_id, created_at) VALUES ('d50db508-2da9-461e-98e6-45361f172b59', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'EXP-2026-0001', '2026-10-09 21:02:50.60548+05:30', 'office_rent', 25000, 0, false, NULL, NULL, NULL, 'Transport Nagar Commercial Complex', 'bank_transfer', 'paid', true, 'Monthly head office rent', '3c5c3484-a996-4159-9920-ebcbb398b51e', '2026-10-17 21:02:50.616985+05:30');
INSERT INTO public.expenses (id, organization_id, expense_number, expense_date, category, amount, tax_amount, is_trip_direct, trip_id, vehicle_id, driver_id, vendor_name, payment_method, payment_status, is_approved, notes, created_by_user_id, created_at) VALUES ('0b028e3b-8e32-44b4-b43d-204f1cb38852', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'EXP-2026-0002', '2026-10-12 21:02:50.605529+05:30', 'vehicle_maintenance', 8500, 0, false, NULL, '929ce68c-87ba-4d51-98bb-992d9cfc2e0a', NULL, 'Shree Ram Auto Garage', 'upi', 'paid', true, 'Brake pad replacement and oil filter check', '3c5c3484-a996-4159-9920-ebcbb398b51e', '2026-10-17 21:02:50.616991+05:30');


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.invoices (id, organization_id, invoice_number, customer_id, trip_id, invoice_date, due_date, subtotal, tax_amount, total_amount, paid_amount, balance_amount, status, notes, created_at) VALUES ('bb6e75b0-7790-4cee-84a7-5f39d8b5ada4', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'INV-2026-0001', 'cac4aa43-f72a-454d-bb7b-95ef8b082d17', '9fa21977-e412-4cc1-abbf-c0a4a0a7d1c7', '2026-10-12 21:02:50.619638+05:30', '2026-11-11 21:02:50.619645+05:30', 38000, 1900, 39900, 39900, 0, 'paid', 'Paid in full via NEFT', '2026-10-17 21:02:50.620808+05:30');
INSERT INTO public.invoices (id, organization_id, invoice_number, customer_id, trip_id, invoice_date, due_date, subtotal, tax_amount, total_amount, paid_amount, balance_amount, status, notes, created_at) VALUES ('05904880-7d1e-457f-a59e-378cafe4887f', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'INV-2026-0002', 'd0041992-e1df-445c-95c0-9a1a79aefac6', '6e014ada-92ab-4539-a419-1826b8f83cf0', '2026-10-16 21:02:50.624955+05:30', '2026-11-15 21:02:50.624956+05:30', 62000, 3100, 65100, 25000, 40100, 'partially_paid', 'Advance payment received of INR 25,000', '2026-10-17 21:02:50.625238+05:30');


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: organization_memberships; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.organization_memberships (id, organization_id, user_id, role_id, is_active, joined_at) VALUES ('8dea4d41-8ceb-4ad5-91a1-e7e0c2c0f50f', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', '3c5c3484-a996-4159-9920-ebcbb398b51e', 'eddbb5c8-4167-4266-a66c-f593b874d7d7', true, '2026-10-17 21:02:50.354135+05:30');
INSERT INTO public.organization_memberships (id, organization_id, user_id, role_id, is_active, joined_at) VALUES ('85ba83b1-4b63-4c46-9737-13619a46ce35', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'b843a07b-62f5-4e96-93e4-6f9f5f533d03', 'ef0164c0-d0e8-4726-aeb7-33a5cc07af3e', true, '2026-10-17 21:02:50.576242+05:30');
INSERT INTO public.organization_memberships (id, organization_id, user_id, role_id, is_active, joined_at) VALUES ('1c8d693f-4297-4d69-8504-e120f9b128b5', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'abf6514f-6e28-4246-9742-cf14d5490358', '2a2a48b7-987f-4b0f-b267-11496b0655ad', true, '2026-10-17 21:02:50.584586+05:30');
INSERT INTO public.organization_memberships (id, organization_id, user_id, role_id, is_active, joined_at) VALUES ('167a9d2e-5955-408c-bff0-c09b2cfa158a', 'd04afb87-bb27-4a39-a7f8-6fc5b2caf3df', 'f0d49e88-9f75-4d4e-9cfc-fe38f5170ee3', '4fda6430-bf76-4795-b745-12d3fdba72b1', true, '2026-10-17 21:04:05.464563+05:30');


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.organizations (id, name, slug, logo_url, address, city, state, postal_code, country, phone, email, tax_number, currency, timezone, is_active, is_demo, created_at, updated_at) VALUES ('c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'Apex Express Logistics', 'apex-express', NULL, 'Plot 42, Transport Nagar, Nigdi', 'Pune', 'Maharashtra', NULL, 'India', '+91 98765 43210', 'ops@apexexpress.com', '27AABCA1234F1Z5', 'INR', 'Asia/Kolkata', true, true, '2026-10-17 21:02:49.904035+05:30', '2026-10-17 21:02:49.904038+05:30');
INSERT INTO public.organizations (id, name, slug, logo_url, address, city, state, postal_code, country, phone, email, tax_number, currency, timezone, is_active, is_demo, created_at, updated_at) VALUES ('d04afb87-bb27-4a39-a7f8-6fc5b2caf3df', 'BlueDart Cargo 021514d1', 'bluedart-cargo-021514d1', NULL, NULL, 'Bengaluru', 'Karnataka', NULL, 'India', '+91 9988776655', 'karan_021514d1@bluedartcargo.com', NULL, 'INR', 'Asia/Kolkata', true, false, '2026-10-17 21:04:05.222288+05:30', '2026-10-17 21:04:05.222291+05:30');


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.payments (id, organization_id, invoice_id, payment_number, payment_date, amount, payment_method, reference_number, notes, created_at) VALUES ('73c5934e-72d7-4e98-95cd-8f1ae02703e7', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'bb6e75b0-7790-4cee-84a7-5f39d8b5ada4', 'PAY-2026-0001', '2026-10-14 21:02:50.62489+05:30', 39900, 'bank_transfer', 'NEFT-HDFC-99281726', NULL, '2026-10-17 21:02:50.62605+05:30');
INSERT INTO public.payments (id, organization_id, invoice_id, payment_number, payment_date, amount, payment_method, reference_number, notes, created_at) VALUES ('7e492dec-6ee6-42a6-af55-fbce396e6bca', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', '05904880-7d1e-457f-a59e-378cafe4887f', 'PAY-2026-0002', '2026-10-16 21:02:50.629279+05:30', 25000, 'bank_transfer', 'RTGS-ICICI-44129988', NULL, '2026-10-17 21:02:50.629988+05:30');


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.roles (id, organization_id, name, code, description, is_system, permissions) VALUES ('eddbb5c8-4167-4266-a66c-f593b874d7d7', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'Company Owner', 'owner', 'Full access to all company records, financial analytics, settings, and staff administration.', true, '{"dashboard": ["view", "view_financials", "view_profit"], "trips": ["view", "create", "edit", "delete", "approve", "export", "view_financials", "view_profit"], "vehicles": ["view", "create", "edit", "delete", "export", "view_financials"], "drivers": ["view", "create", "edit", "delete", "export", "view_financials"], "customers": ["view", "create", "edit", "delete", "export", "view_financials"], "expenses": ["view", "create", "edit", "delete", "approve", "export", "view_financials"], "accounts": ["view", "create", "edit", "delete", "export", "view_financials", "view_profit"], "reports": ["view", "export", "view_financials", "view_profit"], "staff": ["view", "create", "edit", "delete", "manage_users"], "settings": ["view", "edit", "manage_settings"]}');
INSERT INTO public.roles (id, organization_id, name, code, description, is_system, permissions) VALUES ('014ae824-f701-4c64-ad50-406d6c6be121', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'Company Admin', 'admin', 'High level management of fleet, operations, customers, and staff.', true, '{"dashboard": ["view", "view_financials", "view_profit"], "trips": ["view", "create", "edit", "delete", "approve", "export", "view_financials", "view_profit"], "vehicles": ["view", "create", "edit", "delete", "export", "view_financials"], "drivers": ["view", "create", "edit", "delete", "export", "view_financials"], "customers": ["view", "create", "edit", "delete", "export", "view_financials"], "expenses": ["view", "create", "edit", "approve", "export", "view_financials"], "accounts": ["view", "create", "edit", "export", "view_financials"], "reports": ["view", "export", "view_financials"], "staff": ["view", "create", "edit", "manage_users"], "settings": ["view"]}');
INSERT INTO public.roles (id, organization_id, name, code, description, is_system, permissions) VALUES ('48ab041a-065e-4a5d-b826-b8452b167808', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'Operations Manager', 'ops_manager', 'Manages day-to-day fleet assignments, drivers, trip dispatches and cargo details.', true, '{"dashboard": ["view"], "trips": ["view", "create", "edit", "approve", "export"], "vehicles": ["view", "create", "edit", "export"], "drivers": ["view", "create", "edit", "export"], "customers": ["view", "create", "edit"], "expenses": ["view", "create"], "accounts": [], "reports": ["view", "export"], "staff": ["view"], "settings": []}');
INSERT INTO public.roles (id, organization_id, name, code, description, is_system, permissions) VALUES ('ef0164c0-d0e8-4726-aeb7-33a5cc07af3e', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'Accountant', 'accountant', 'Manages invoices, payments, financial reports, expenses, customer ledger, and trip freight billing.', true, '{"dashboard": ["view", "view_financials", "view_profit"], "trips": ["view", "export", "view_financials", "view_profit"], "vehicles": ["view", "view_financials"], "drivers": ["view", "view_financials"], "customers": ["view", "create", "edit", "export", "view_financials"], "expenses": ["view", "create", "edit", "approve", "export", "view_financials"], "accounts": ["view", "create", "edit", "export", "view_financials", "view_profit"], "reports": ["view", "export", "view_financials", "view_profit"], "staff": [], "settings": []}');
INSERT INTO public.roles (id, organization_id, name, code, description, is_system, permissions) VALUES ('2a2a48b7-987f-4b0f-b267-11496b0655ad', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'Trip Entry Operator', 'trip_operator', 'Creates and updates daily trips, routes, cargo weights, and direct trip vouchers without profit visibility.', true, '{"dashboard": ["view"], "trips": ["view", "create", "edit"], "vehicles": ["view"], "drivers": ["view"], "customers": ["view"], "expenses": ["view", "create"], "accounts": [], "reports": [], "staff": [], "settings": []}');
INSERT INTO public.roles (id, organization_id, name, code, description, is_system, permissions) VALUES ('871b8de1-d12c-486e-b025-9b8df603223f', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'Vehicle Manager', 'vehicle_manager', 'Specialized in fleet health, document renewals (insurance/fitness/pollution), maintenance logs.', true, '{"dashboard": ["view"], "trips": ["view"], "vehicles": ["view", "create", "edit", "delete", "export"], "drivers": ["view"], "customers": [], "expenses": ["view", "create"], "accounts": [], "reports": ["view"], "staff": [], "settings": []}');
INSERT INTO public.roles (id, organization_id, name, code, description, is_system, permissions) VALUES ('8ca20e2d-6e09-465d-8173-eff4b493062a', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'Driver Manager', 'driver_manager', 'Manages driver profiles, license expiries, salary structures, and duty rosters.', true, '{"dashboard": ["view"], "trips": ["view"], "vehicles": ["view"], "drivers": ["view", "create", "edit", "delete", "export"], "customers": [], "expenses": ["view", "create"], "accounts": [], "reports": ["view"], "staff": [], "settings": []}');
INSERT INTO public.roles (id, organization_id, name, code, description, is_system, permissions) VALUES ('6182d534-02fb-418e-a045-b91b0a45ba1a', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'Read-only Viewer', 'viewer', 'Read-only operational visibility across fleet, trips, and non-sensitive dashboards.', true, '{"dashboard": ["view"], "trips": ["view"], "vehicles": ["view"], "drivers": ["view"], "customers": ["view"], "expenses": ["view"], "accounts": [], "reports": ["view"], "staff": [], "settings": []}');
INSERT INTO public.roles (id, organization_id, name, code, description, is_system, permissions) VALUES ('4fda6430-bf76-4795-b745-12d3fdba72b1', 'd04afb87-bb27-4a39-a7f8-6fc5b2caf3df', 'Company Owner', 'owner', 'Full access to all company records, financial analytics, settings, and staff administration.', true, '{"dashboard": ["view", "view_financials", "view_profit"], "trips": ["view", "create", "edit", "delete", "approve", "export", "view_financials", "view_profit"], "vehicles": ["view", "create", "edit", "delete", "export", "view_financials"], "drivers": ["view", "create", "edit", "delete", "export", "view_financials"], "customers": ["view", "create", "edit", "delete", "export", "view_financials"], "expenses": ["view", "create", "edit", "delete", "approve", "export", "view_financials"], "accounts": ["view", "create", "edit", "delete", "export", "view_financials", "view_profit"], "reports": ["view", "export", "view_financials", "view_profit"], "staff": ["view", "create", "edit", "delete", "manage_users"], "settings": ["view", "edit", "manage_settings"]}');
INSERT INTO public.roles (id, organization_id, name, code, description, is_system, permissions) VALUES ('3bf347b2-1290-4e7c-8c7c-0ac57a87cc0b', 'd04afb87-bb27-4a39-a7f8-6fc5b2caf3df', 'Company Admin', 'admin', 'High level management of fleet, operations, customers, and staff.', true, '{"dashboard": ["view", "view_financials", "view_profit"], "trips": ["view", "create", "edit", "delete", "approve", "export", "view_financials", "view_profit"], "vehicles": ["view", "create", "edit", "delete", "export", "view_financials"], "drivers": ["view", "create", "edit", "delete", "export", "view_financials"], "customers": ["view", "create", "edit", "delete", "export", "view_financials"], "expenses": ["view", "create", "edit", "approve", "export", "view_financials"], "accounts": ["view", "create", "edit", "export", "view_financials"], "reports": ["view", "export", "view_financials"], "staff": ["view", "create", "edit", "manage_users"], "settings": ["view"]}');
INSERT INTO public.roles (id, organization_id, name, code, description, is_system, permissions) VALUES ('d7ea805c-a5b0-4f19-b8b8-1bf472c29eeb', 'd04afb87-bb27-4a39-a7f8-6fc5b2caf3df', 'Operations Manager', 'ops_manager', 'Manages day-to-day fleet assignments, drivers, trip dispatches and cargo details.', true, '{"dashboard": ["view"], "trips": ["view", "create", "edit", "approve", "export"], "vehicles": ["view", "create", "edit", "export"], "drivers": ["view", "create", "edit", "export"], "customers": ["view", "create", "edit"], "expenses": ["view", "create"], "accounts": [], "reports": ["view", "export"], "staff": ["view"], "settings": []}');
INSERT INTO public.roles (id, organization_id, name, code, description, is_system, permissions) VALUES ('5aeb5044-00b0-416a-8a20-2a1bd4cc92a5', 'd04afb87-bb27-4a39-a7f8-6fc5b2caf3df', 'Accountant', 'accountant', 'Manages invoices, payments, financial reports, expenses, customer ledger, and trip freight billing.', true, '{"dashboard": ["view", "view_financials", "view_profit"], "trips": ["view", "export", "view_financials", "view_profit"], "vehicles": ["view", "view_financials"], "drivers": ["view", "view_financials"], "customers": ["view", "create", "edit", "export", "view_financials"], "expenses": ["view", "create", "edit", "approve", "export", "view_financials"], "accounts": ["view", "create", "edit", "export", "view_financials", "view_profit"], "reports": ["view", "export", "view_financials", "view_profit"], "staff": [], "settings": []}');
INSERT INTO public.roles (id, organization_id, name, code, description, is_system, permissions) VALUES ('fb2034c7-5074-4088-941d-4d972447c062', 'd04afb87-bb27-4a39-a7f8-6fc5b2caf3df', 'Trip Entry Operator', 'trip_operator', 'Creates and updates daily trips, routes, cargo weights, and direct trip vouchers without profit visibility.', true, '{"dashboard": ["view"], "trips": ["view", "create", "edit"], "vehicles": ["view"], "drivers": ["view"], "customers": ["view"], "expenses": ["view", "create"], "accounts": [], "reports": [], "staff": [], "settings": []}');
INSERT INTO public.roles (id, organization_id, name, code, description, is_system, permissions) VALUES ('48aed33c-517e-4081-8619-c5c71a0ae77d', 'd04afb87-bb27-4a39-a7f8-6fc5b2caf3df', 'Vehicle Manager', 'vehicle_manager', 'Specialized in fleet health, document renewals (insurance/fitness/pollution), maintenance logs.', true, '{"dashboard": ["view"], "trips": ["view"], "vehicles": ["view", "create", "edit", "delete", "export"], "drivers": ["view"], "customers": [], "expenses": ["view", "create"], "accounts": [], "reports": ["view"], "staff": [], "settings": []}');
INSERT INTO public.roles (id, organization_id, name, code, description, is_system, permissions) VALUES ('709607cb-fdeb-4005-9367-b6319b5c1b02', 'd04afb87-bb27-4a39-a7f8-6fc5b2caf3df', 'Driver Manager', 'driver_manager', 'Manages driver profiles, license expiries, salary structures, and duty rosters.', true, '{"dashboard": ["view"], "trips": ["view"], "vehicles": ["view"], "drivers": ["view", "create", "edit", "delete", "export"], "customers": [], "expenses": ["view", "create"], "accounts": [], "reports": ["view"], "staff": [], "settings": []}');
INSERT INTO public.roles (id, organization_id, name, code, description, is_system, permissions) VALUES ('817c6fc7-fc04-4b0f-98b2-fb4d7f068b66', 'd04afb87-bb27-4a39-a7f8-6fc5b2caf3df', 'Read-only Viewer', 'viewer', 'Read-only operational visibility across fleet, trips, and non-sensitive dashboards.', true, '{"dashboard": ["view"], "trips": ["view"], "vehicles": ["view"], "drivers": ["view"], "customers": ["view"], "expenses": ["view"], "accounts": [], "reports": ["view"], "staff": [], "settings": []}');


--
-- Data for Name: saas_admin_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.subscription_plans (id, name, code, description, price_monthly, price_yearly, trial_days, max_vehicles, max_staff, max_trips_monthly, features, is_active, is_visible, sort_order, created_at) VALUES ('b7fdc033-3120-4969-b936-c6fde12740c5', 'Starter Fleet', 'starter', NULL, 1499, 14990, 14, 5, 3, 50, '["basic_trips", "expense_logging"]', true, true, 0, '2026-10-17 21:02:49.649967+05:30');
INSERT INTO public.subscription_plans (id, name, code, description, price_monthly, price_yearly, trial_days, max_vehicles, max_staff, max_trips_monthly, features, is_active, is_visible, sort_order, created_at) VALUES ('6dde80ad-a9f9-4c71-873a-c13793bd9d21', 'Professional Logistics', 'professional', NULL, 3999, 39990, 14, 25, 10, 300, '["all_trips", "invoicing", "profit_loss", "csv_export"]', true, true, 0, '2026-10-17 21:02:49.650006+05:30');
INSERT INTO public.subscription_plans (id, name, code, description, price_monthly, price_yearly, trial_days, max_vehicles, max_staff, max_trips_monthly, features, is_active, is_visible, sort_order, created_at) VALUES ('b1abefe6-d77b-4f8f-9d77-4f4d4f328756', 'Enterprise Freight', 'enterprise', NULL, 8999, 89990, 14, 100, 50, 2000, '["unlimited", "multi_branch", "api_access", "custom_roles"]', true, true, 0, '2026-10-17 21:02:49.650011+05:30');


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.subscriptions (id, organization_id, plan_id, status, billing_cycle, start_date, trial_end_date, expiry_date, auto_renew, suspended_at, cancelled_at, cancellation_reason, admin_notes, amount_paid, updated_at) VALUES ('75c9659d-319f-4011-9362-9c14fd2d57c9', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', '6dde80ad-a9f9-4c71-873a-c13793bd9d21', 'active', 'monthly', '2026-10-17 21:02:50.585792+05:30', NULL, NULL, true, NULL, NULL, NULL, NULL, 0, '2026-10-17 21:02:50.585796+05:30');
INSERT INTO public.subscriptions (id, organization_id, plan_id, status, billing_cycle, start_date, trial_end_date, expiry_date, auto_renew, suspended_at, cancelled_at, cancellation_reason, admin_notes, amount_paid, updated_at) VALUES ('5036c151-2804-4001-aed6-0aad9f263ea9', 'd04afb87-bb27-4a39-a7f8-6fc5b2caf3df', '6dde80ad-a9f9-4c71-873a-c13793bd9d21', 'active', 'monthly', '2026-10-17 21:04:05.466363+05:30', NULL, NULL, true, NULL, NULL, NULL, NULL, 0, '2026-10-17 21:04:05.466367+05:30');


--
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.trips (id, organization_id, trip_number, trip_date, customer_id, vehicle_id, driver_id, customer_po_ref, pickup_city, pickup_address, delivery_city, delivery_address, start_time, end_time, cargo_description, cargo_weight_tonnes, freight_charges, additional_charges, discount, tax_amount, total_revenue, amount_paid, due_amount, diesel_expense, toll_expense, driver_allowance, loading_unloading_expense, other_direct_expense, total_expenses, trip_profit, status, cancellation_reason, is_approved, approved_by, created_by_user_id, created_at) VALUES ('9fa21977-e412-4cc1-abbf-c0a4a0a7d1c7', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'TRP-2026-0001', '2026-10-11 21:02:50.598654+05:30', 'cac4aa43-f72a-454d-bb7b-95ef8b082d17', '929ce68c-87ba-4d51-98bb-992d9cfc2e0a', 'ef59af5f-7a78-4a34-af0a-269ad4e564a0', 'PO-REL-9921', 'Pune', 'Chakan Industrial Area', 'Navi Mumbai', 'Reliance Central Warehouse, Ghansoli', NULL, NULL, 'FMCG & Packaged Goods', 14.2, 38000, 0, 0, 1900, 39900, 39900, 0, 11500, 2400, 1500, 1000, 0, 16400, 21600, 'completed', NULL, true, NULL, '3c5c3484-a996-4159-9920-ebcbb398b51e', '2026-10-17 21:02:50.600462+05:30');
INSERT INTO public.trips (id, organization_id, trip_number, trip_date, customer_id, vehicle_id, driver_id, customer_po_ref, pickup_city, pickup_address, delivery_city, delivery_address, start_time, end_time, cargo_description, cargo_weight_tonnes, freight_charges, additional_charges, discount, tax_amount, total_revenue, amount_paid, due_amount, diesel_expense, toll_expense, driver_allowance, loading_unloading_expense, other_direct_expense, total_expenses, trip_profit, status, cancellation_reason, is_approved, approved_by, created_by_user_id, created_at) VALUES ('6e014ada-92ab-4539-a419-1826b8f83cf0', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'TRP-2026-0002', '2026-10-15 21:02:50.598785+05:30', 'd0041992-e1df-445c-95c0-9a1a79aefac6', '81cc087e-c039-4b85-a551-00fff9fc0c0b', '04f5072a-da43-4179-ba54-31f884b20896', 'PO-TATA-5541', 'Pune', 'Tata Motors Plant 1, Pimpri', 'Ahmedabad', 'Sanand Auto Cluster, Ahmedabad', NULL, NULL, 'Automotive Engine Assemblies', 18.5, 62000, 0, 0, 3100, 65100, 25000, 40100, 22000, 4200, 2500, 1200, 0, 29900, 32100, 'in_transit', NULL, true, NULL, '3c5c3484-a996-4159-9920-ebcbb398b51e', '2026-10-17 21:02:50.60047+05:30');
INSERT INTO public.trips (id, organization_id, trip_number, trip_date, customer_id, vehicle_id, driver_id, customer_po_ref, pickup_city, pickup_address, delivery_city, delivery_address, start_time, end_time, cargo_description, cargo_weight_tonnes, freight_charges, additional_charges, discount, tax_amount, total_revenue, amount_paid, due_amount, diesel_expense, toll_expense, driver_allowance, loading_unloading_expense, other_direct_expense, total_expenses, trip_profit, status, cancellation_reason, is_approved, approved_by, created_by_user_id, created_at) VALUES ('809208c6-6035-4510-942f-88688bc80246', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'TRP-2026-0003', '2026-10-16 21:02:50.598822+05:30', 'a8de66fe-13ec-4bf3-b29f-53fa6e97460d', 'bd9205b8-2d1d-4fe2-af86-9f2145c514c9', 'e961c75d-41fe-487e-98b8-793391cb5777', 'AMZ-DEL-0091', 'Pune', 'Amazon FC PNQ2, Chakan', 'Hyderabad', 'Amazon FC HYD1, Shamshabad', NULL, NULL, 'High-value Consumer Electronics', 4.5, 54000, 0, 0, 2700, 56700, 0, 56700, 18500, 3800, 2000, 1000, 0, 25300, 28700, 'dispatched', NULL, true, NULL, '3c5c3484-a996-4159-9920-ebcbb398b51e', '2026-10-17 21:02:50.600473+05:30');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (id, email, hashed_password, full_name, phone, is_superadmin, is_active, last_login_at, created_at) VALUES ('c5d55c18-e9d7-4f42-a542-8fc5abc09842', 'admin@transportpro.com', '$2b$12$jVovf9WeH23TncCiIs5nb.jY47BJIB2CLp4x6jzwJF7Tzi1xhTRBW', 'Platform Super Admin', NULL, true, true, NULL, '2026-10-17 21:02:49.895398+05:30');
INSERT INTO public.users (id, email, hashed_password, full_name, phone, is_superadmin, is_active, last_login_at, created_at) VALUES ('b843a07b-62f5-4e96-93e4-6f9f5f533d03', 'accounts@apexexpress.com', '$2b$12$aKhDHnk6D1Dp3q5w1LXT4uY2MWI6ewxuFHh.KH2GhMk5GyKoWHlxm', 'Sunil Deshmukh', '+91 98220 44556', false, true, NULL, '2026-10-17 21:02:50.352525+05:30');
INSERT INTO public.users (id, email, hashed_password, full_name, phone, is_superadmin, is_active, last_login_at, created_at) VALUES ('3c5c3484-a996-4159-9920-ebcbb398b51e', 'owner@apexexpress.com', '$2b$12$4JvI.FTIAbuFXiU34G.vIO/PgZ0Jd4pUmTLRxlQRYceL1qatkx/WO', 'Rajesh Sharma', '+91 98220 11223', false, true, '2026-10-17 21:04:04.863122+05:30', '2026-10-17 21:02:50.118767+05:30');
INSERT INTO public.users (id, email, hashed_password, full_name, phone, is_superadmin, is_active, last_login_at, created_at) VALUES ('abf6514f-6e28-4246-9742-cf14d5490358', 'operator@apexexpress.com', '$2b$12$BxO4scEaqRMGQSqeUrK4MuSIfL6fg2JFZsfPe2HQJ4gKfN039./Qq', 'Vikas Patil', '+91 98220 77889', false, true, '2026-10-17 21:04:05.139989+05:30', '2026-10-17 21:02:50.57556+05:30');
INSERT INTO public.users (id, email, hashed_password, full_name, phone, is_superadmin, is_active, last_login_at, created_at) VALUES ('f0d49e88-9f75-4d4e-9cfc-fe38f5170ee3', 'karan_021514d1@bluedartcargo.com', '$2b$12$Q2uJcBfzngUJLpOikMFpouWGqWTpB8JdaovxmCDFmp8S9R.lTwFne', 'Karan Singhania', '+91 9988776655', false, true, NULL, '2026-10-17 21:04:05.448569+05:30');


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.vehicles (id, organization_id, vehicle_number, vehicle_type, model, capacity_tonnage, ownership_type, status, assigned_driver_id, insurance_expiry, fitness_expiry, permit_expiry, pollution_expiry, created_at) VALUES ('929ce68c-87ba-4d51-98bb-992d9cfc2e0a', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'MH 12 AB 9988', 'Heavy Truck (10 Wheeler)', 'Tata Signa 2823.K', 16.5, 'owned', 'available', 'ef59af5f-7a78-4a34-af0a-269ad4e564a0', '2026-11-06 21:02:50.589845+05:30', '2027-04-15 21:02:50.58985+05:30', NULL, NULL, '2026-10-17 21:02:50.590642+05:30');
INSERT INTO public.vehicles (id, organization_id, vehicle_number, vehicle_type, model, capacity_tonnage, ownership_type, status, assigned_driver_id, insurance_expiry, fitness_expiry, permit_expiry, pollution_expiry, created_at) VALUES ('81cc087e-c039-4b85-a551-00fff9fc0c0b', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'MH 14 CC 4521', 'Container 32ft MXL', 'BharatBenz 3528C', 22, 'owned', 'on_trip', '04f5072a-da43-4179-ba54-31f884b20896', '2027-02-14 21:02:50.589899+05:30', '2026-10-29 21:02:50.589901+05:30', NULL, NULL, '2026-10-17 21:02:50.590648+05:30');
INSERT INTO public.vehicles (id, organization_id, vehicle_number, vehicle_type, model, capacity_tonnage, ownership_type, status, assigned_driver_id, insurance_expiry, fitness_expiry, permit_expiry, pollution_expiry, created_at) VALUES ('bd9205b8-2d1d-4fe2-af86-9f2145c514c9', 'c2490339-159a-4946-9bc9-0b0b18a0c3a0', 'MH 04 GD 7712', 'Light Commercial Vehicle', 'Eicher Pro 2049', 4.9, 'owned', 'on_trip', 'e961c75d-41fe-487e-98b8-793391cb5777', '2027-08-03 21:02:50.589916+05:30', '2027-09-12 21:02:50.589917+05:30', NULL, NULL, '2026-10-17 21:02:50.590651+05:30');


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: drivers drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: organization_memberships organization_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_memberships
    ADD CONSTRAINT organization_memberships_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: saas_admin_notes saas_admin_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saas_admin_notes
    ADD CONSTRAINT saas_admin_notes_pkey PRIMARY KEY (id);


--
-- Name: subscription_plans subscription_plans_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_code_key UNIQUE (code);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_organization_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_organization_id_key UNIQUE (organization_id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: ix_audit_logs_organization_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_audit_logs_organization_id ON public.audit_logs USING btree (organization_id);


--
-- Name: ix_customers_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_customers_name ON public.customers USING btree (name);


--
-- Name: ix_customers_organization_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_customers_organization_id ON public.customers USING btree (organization_id);


--
-- Name: ix_drivers_organization_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_drivers_organization_id ON public.drivers USING btree (organization_id);


--
-- Name: ix_expenses_organization_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_expenses_organization_id ON public.expenses USING btree (organization_id);


--
-- Name: ix_invoices_invoice_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_invoices_invoice_number ON public.invoices USING btree (invoice_number);


--
-- Name: ix_invoices_organization_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_invoices_organization_id ON public.invoices USING btree (organization_id);


--
-- Name: ix_notifications_organization_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_notifications_organization_id ON public.notifications USING btree (organization_id);


--
-- Name: ix_organization_memberships_organization_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_organization_memberships_organization_id ON public.organization_memberships USING btree (organization_id);


--
-- Name: ix_organization_memberships_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_organization_memberships_user_id ON public.organization_memberships USING btree (user_id);


--
-- Name: ix_organizations_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_organizations_slug ON public.organizations USING btree (slug);


--
-- Name: ix_payments_organization_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_payments_organization_id ON public.payments USING btree (organization_id);


--
-- Name: ix_saas_admin_notes_organization_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_saas_admin_notes_organization_id ON public.saas_admin_notes USING btree (organization_id);


--
-- Name: ix_trips_organization_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_trips_organization_id ON public.trips USING btree (organization_id);


--
-- Name: ix_trips_trip_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_trips_trip_number ON public.trips USING btree (trip_number);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_vehicles_organization_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_vehicles_organization_id ON public.vehicles USING btree (organization_id);


--
-- Name: ix_vehicles_vehicle_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_vehicles_vehicle_number ON public.vehicles USING btree (vehicle_number);


--
-- Name: audit_logs audit_logs_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: customers customers_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: drivers drivers_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: expenses expenses_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id);


--
-- Name: expenses expenses_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id);


--
-- Name: expenses expenses_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: expenses expenses_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id);


--
-- Name: expenses expenses_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: invoices invoices_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: invoices invoices_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: invoices invoices_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id);


--
-- Name: notifications notifications_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: organization_memberships organization_memberships_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_memberships
    ADD CONSTRAINT organization_memberships_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: organization_memberships organization_memberships_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_memberships
    ADD CONSTRAINT organization_memberships_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: organization_memberships organization_memberships_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_memberships
    ADD CONSTRAINT organization_memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: payments payments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id);


--
-- Name: payments payments_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: roles roles_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: saas_admin_notes saas_admin_notes_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saas_admin_notes
    ADD CONSTRAINT saas_admin_notes_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id);


--
-- Name: saas_admin_notes saas_admin_notes_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saas_admin_notes
    ADD CONSTRAINT saas_admin_notes_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: subscriptions subscriptions_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: subscriptions subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id);


--
-- Name: trips trips_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id);


--
-- Name: trips trips_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: trips trips_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id);


--
-- Name: trips trips_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: trips trips_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: vehicles vehicles_assigned_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_assigned_driver_id_fkey FOREIGN KEY (assigned_driver_id) REFERENCES public.drivers(id);


--
-- Name: vehicles vehicles_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- PostgreSQL database dump complete
--

\unrestrict Hl6qZ6DpyZMtiPF4byBjejg5YaK70UVRDcPsf3eemCgVleTIRXW111xQ6KeH3I9

