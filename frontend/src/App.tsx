import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { AuthModal } from './components/AuthModal';
import { Loading3D } from './components/Loading3D';
import { OfflineScreen3D } from './components/OfflineScreen3D';

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

// SaaS Admin Pages
import { SaasDashboard } from './pages/saas/SaasDashboard';
import { SaasAccountsPage } from './pages/saas/SaasAccountsPage';
import { SaasAccountDetailPage } from './pages/saas/SaasAccountDetailPage';
import { SaasPlansPage } from './pages/saas/SaasPlansPage';
import { SaasAnalyticsPage } from './pages/saas/SaasAnalyticsPage';
import { SaasAuditLogsPage } from './pages/saas/SaasAuditLogsPage';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-switch tabs strictly depending on user role
  useEffect(() => {
    if (user?.is_superadmin) {
      if (!currentTab.startsWith('saas-')) {
        setCurrentTab('saas-dashboard');
      }
    } else if (user) {
      if (currentTab.startsWith('saas-')) {
        setCurrentTab('dashboard');
      }
    }
  }, [user]);

  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [dismissOffline, setDismissOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setDismissOffline(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setDismissOffline(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isLoading) {
    return <Loading3D message="Connecting to Neon Cloud Database..." />;
  }

  if (!user) {
    return (
      <>
        {!isOnline && !dismissOffline && (
          <OfflineScreen3D 
            onRetry={() => {
              if (navigator.onLine) setIsOnline(true);
              else window.location.reload();
            }}
            onDismiss={() => setDismissOffline(true)}
          />
        )}
        <AuthModal />
      </>
    );
  }

  const getPageTitle = () => {
    switch (currentTab) {
      // SaaS Admin Tabs
      case 'saas-dashboard': return 'SaaS Owner Command Center & Metrics';
      case 'saas-accounts': return 'Transport Companies & Accounts Directory';
      case 'saas-account-detail': return 'Transport Business Account Profile';
      case 'saas-plans': return 'SaaS Subscription Tiers & Packaging';
      case 'saas-analytics': return 'Platform Analytics & Growth';
      case 'saas-audit': return 'Platform Administrative Audit Trail';
      // Standard ERP Tabs
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
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {!isOnline && !dismissOffline && (
        <OfflineScreen3D 
          onRetry={() => {
            if (navigator.onLine) setIsOnline(true);
            else window.location.reload();
          }}
          onDismiss={() => setDismissOffline(true)}
        />
      )}
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
          onShowOfflineModal={() => setDismissOffline(false)}
        />
        <main className="flex-1 overflow-y-auto">
          {/* SaaS Admin Views (ONLY FOR SUPER ADMIN) */}
          {user.is_superadmin && (
            <>
              {currentTab === 'saas-dashboard' && <SaasDashboard onNavigateTab={(tab) => setCurrentTab(tab)} />}
              {currentTab === 'saas-accounts' && (
                <SaasAccountsPage
                  onSelectAccount={(orgId) => {
                    setSelectedAccountId(orgId);
                    setCurrentTab('saas-account-detail');
                  }}
                />
              )}
              {currentTab === 'saas-account-detail' && selectedAccountId && (
                <SaasAccountDetailPage
                  orgId={selectedAccountId}
                  onBack={() => setCurrentTab('saas-accounts')}
                />
              )}
              {currentTab === 'saas-plans' && <SaasPlansPage />}
              {currentTab === 'saas-analytics' && <SaasAnalyticsPage />}
              {currentTab === 'saas-audit' && <SaasAuditLogsPage />}
            </>
          )}

          {/* ERP Operational Views (ONLY FOR ERP / TENANT USERS) */}
          {!user.is_superadmin && (
            <>
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
            </>
          )}
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
