import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { AuthModal } from './components/AuthModal';

import { Dashboard } from './pages/Dashboard';
import { TripsPage } from './pages/TripsPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { DriversPage } from './pages/DriversPage';
import { CustomersPage } from './pages/CustomersPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { ReportsPage } from './pages/ReportsPage';
import { StaffPage } from './pages/StaffPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { AuditPage } from './pages/AuditPage';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Executive Dashboard';
      case 'trips': return 'Trip Operations & Dispatch';
      case 'vehicles': return 'Fleet & Equipment Registry';
      case 'drivers': return 'Drivers & Crew Roster';
      case 'customers': return 'Customer Directory & Accounts';
      case 'expenses': return 'Expense Vouchers & Deductions';
      case 'invoices': return 'Invoicing & Receivables Ledger';
      case 'reports': return 'Financial P&L & Operational Reports';
      case 'staff': return 'Staff Administration & Granular RBAC';
      case 'subscriptions': return 'SaaS Plan & Billing';
      case 'audit': return 'System Activity Audit Trail';
      default: return 'TransportPro ERP';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNavbar
          title={getPageTitle()}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto">
          {currentTab === 'dashboard' && <Dashboard onNavigateTab={(tab) => setCurrentTab(tab)} />}
          {currentTab === 'trips' && <TripsPage />}
          {currentTab === 'vehicles' && <VehiclesPage />}
          {currentTab === 'drivers' && <DriversPage />}
          {currentTab === 'customers' && <CustomersPage />}
          {currentTab === 'expenses' && <ExpensesPage />}
          {currentTab === 'invoices' && <InvoicesPage />}
          {currentTab === 'reports' && <ReportsPage />}
          {currentTab === 'staff' && <StaffPage />}
          {currentTab === 'subscriptions' && <SubscriptionsPage />}
          {currentTab === 'audit' && <AuditPage />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
