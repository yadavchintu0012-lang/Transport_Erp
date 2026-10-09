from typing import List, Dict

# Standard permission actions: view, create, edit, delete, approve, export, view_financials, view_profit, manage_users, manage_settings
SYSTEM_ROLES: Dict[str, Dict] = {
    "owner": {
        "name": "Company Owner",
        "code": "owner",
        "description": "Full access to all company records, financial analytics, settings, and staff administration.",
        "permissions": {
            "dashboard": ["view", "view_financials", "view_profit"],
            "trips": ["view", "create", "edit", "delete", "approve", "export", "view_financials", "view_profit"],
            "vehicles": ["view", "create", "edit", "delete", "export", "view_financials"],
            "drivers": ["view", "create", "edit", "delete", "export", "view_financials"],
            "customers": ["view", "create", "edit", "delete", "export", "view_financials"],
            "expenses": ["view", "create", "edit", "delete", "approve", "export", "view_financials"],
            "accounts": ["view", "create", "edit", "delete", "export", "view_financials", "view_profit"],
            "reports": ["view", "export", "view_financials", "view_profit"],
            "staff": ["view", "create", "edit", "delete", "manage_users"],
            "settings": ["view", "edit", "manage_settings"]
        }
    },
    "admin": {
        "name": "Company Admin",
        "code": "admin",
        "description": "High level management of fleet, operations, customers, and staff.",
        "permissions": {
            "dashboard": ["view", "view_financials", "view_profit"],
            "trips": ["view", "create", "edit", "delete", "approve", "export", "view_financials", "view_profit"],
            "vehicles": ["view", "create", "edit", "delete", "export", "view_financials"],
            "drivers": ["view", "create", "edit", "delete", "export", "view_financials"],
            "customers": ["view", "create", "edit", "delete", "export", "view_financials"],
            "expenses": ["view", "create", "edit", "approve", "export", "view_financials"],
            "accounts": ["view", "create", "edit", "export", "view_financials"],
            "reports": ["view", "export", "view_financials"],
            "staff": ["view", "create", "edit", "manage_users"],
            "settings": ["view"]
        }
    },
    "ops_manager": {
        "name": "Operations Manager",
        "code": "ops_manager",
        "description": "Manages day-to-day fleet assignments, drivers, trip dispatches and cargo details.",
        "permissions": {
            "dashboard": ["view"],
            "trips": ["view", "create", "edit", "approve", "export"],
            "vehicles": ["view", "create", "edit", "export"],
            "drivers": ["view", "create", "edit", "export"],
            "customers": ["view", "create", "edit"],
            "expenses": ["view", "create"],
            "accounts": [],
            "reports": ["view", "export"],
            "staff": ["view"],
            "settings": []
        }
    },
    "accountant": {
        "name": "Accountant",
        "code": "accountant",
        "description": "Manages invoices, payments, financial reports, expenses, customer ledger, and trip freight billing.",
        "permissions": {
            "dashboard": ["view", "view_financials", "view_profit"],
            "trips": ["view", "export", "view_financials", "view_profit"],
            "vehicles": ["view", "view_financials"],
            "drivers": ["view", "view_financials"],
            "customers": ["view", "create", "edit", "export", "view_financials"],
            "expenses": ["view", "create", "edit", "approve", "export", "view_financials"],
            "accounts": ["view", "create", "edit", "export", "view_financials", "view_profit"],
            "reports": ["view", "export", "view_financials", "view_profit"],
            "staff": [],
            "settings": []
        }
    },
    "trip_operator": {
        "name": "Trip Entry Operator",
        "code": "trip_operator",
        "description": "Creates and updates daily trips, routes, cargo weights, and direct trip vouchers without profit visibility.",
        "permissions": {
            "dashboard": ["view"],
            "trips": ["view", "create", "edit"],
            "vehicles": ["view"],
            "drivers": ["view"],
            "customers": ["view"],
            "expenses": ["view", "create"],
            "accounts": [],
            "reports": [],
            "staff": [],
            "settings": []
        }
    },
    "vehicle_manager": {
        "name": "Vehicle Manager",
        "code": "vehicle_manager",
        "description": "Specialized in fleet health, document renewals (insurance/fitness/pollution), maintenance logs.",
        "permissions": {
            "dashboard": ["view"],
            "trips": ["view"],
            "vehicles": ["view", "create", "edit", "delete", "export"],
            "drivers": ["view"],
            "customers": [],
            "expenses": ["view", "create"],
            "accounts": [],
            "reports": ["view"],
            "staff": [],
            "settings": []
        }
    },
    "driver_manager": {
        "name": "Driver Manager",
        "code": "driver_manager",
        "description": "Manages driver profiles, license expiries, salary structures, and duty rosters.",
        "permissions": {
            "dashboard": ["view"],
            "trips": ["view"],
            "vehicles": ["view"],
            "drivers": ["view", "create", "edit", "delete", "export"],
            "customers": [],
            "expenses": ["view", "create"],
            "accounts": [],
            "reports": ["view"],
            "staff": [],
            "settings": []
        }
    },
    "viewer": {
        "name": "Read-only Viewer",
        "code": "viewer",
        "description": "Read-only operational visibility across fleet, trips, and non-sensitive dashboards.",
        "permissions": {
            "dashboard": ["view"],
            "trips": ["view"],
            "vehicles": ["view"],
            "drivers": ["view"],
            "customers": ["view"],
            "expenses": ["view"],
            "accounts": [],
            "reports": ["view"],
            "staff": [],
            "settings": []
        }
    }
}
