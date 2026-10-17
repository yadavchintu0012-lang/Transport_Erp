--
-- PostgreSQL database dump
--

\restrict 1GAze14tDIrxEj2FGhd51pWYAiYE8E17D5L99eZranpCQAeg5VBCnFA5elAZUlH

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

\unrestrict 1GAze14tDIrxEj2FGhd51pWYAiYE8E17D5L99eZranpCQAeg5VBCnFA5elAZUlH

