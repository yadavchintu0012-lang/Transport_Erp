import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { AuthModal } from './components/AuthModal';
import { Loading3D } from './components/Loading3D';
import { OfflineScreen3D } from './components/OfflineScreen3D';
import { UpdateProvider } from './context/UpdateContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppUpdatePrompt } from './components/AppUpdatePrompt';

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
import { DeveloperPage } from './pages/DeveloperPage';

// SaaS Admin Pages
import { SaasDashboard } from './pages/saas/SaasDashboard';
import { SaasAccountsPage } from './pages/saas/SaasAccountsPage';
import { SaasAccountDetailPage } from './pages/saas/SaasAccountDetailPage';
import { SaasPlansPage } from './pages/saas/SaasPlansPage';
import { SaasAnalyticsPage } from './pages/saas/SaasAnalyticsPage';
import { SaasAuditLogsPage } from './pages/saas/SaasAuditLogsPage';

import { useOfflineSync } from './services/syncEngine';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { isOnline, syncNow } = useOfflineSync();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [dismissOffline, setDismissOffline] = useState(false);
  const [showManualOffline, setShowManualOffline] = useState(false);
  const [showManualLoading, setShowManualLoading] = useState(false);

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

  // Ensure 3D Loading animation runs visibly on site load for 1.4s
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  // When internet reconnects, reset dismiss state
  useEffect(() => {
    if (isOnline) {
      setDismissOffline(false);
      setShowManualOffline(false);
    }
  }, [isOnline]);

  if (isInitialLoading || isLoading) {
    return <Loading3D message="Synchronizing TransportPro Cloud ERP..." />;
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
      case 'developer': return 'Developer & System Architect Profile';
      default: return 'TransportPro ERP';
    }
  };

  return (
    <>
      {/* 3D Loading Preview Overlay */}
      {showManualLoading && (
        <div className="fixed inset-0 z-[99999] bg-slate-950 flex flex-col items-center justify-center">
          <Loading3D message="3D Highway Logistics Truck Animation Preview" />
          <button
            onClick={() => setShowManualLoading(false)}
            className="fixed top-6 right-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 shadow-xl cursor-pointer z-50 transition-all"
          >
            &times; Close 3D Loader
          </button>
        </div>
      )}

      {/* 3D Offline Interactive Screen Overlay */}
      {(showManualOffline || (!isOnline && !dismissOffline)) && (
        <OfflineScreen3D 
          onRetry={() => {
            syncNow();
            setShowManualOffline(false);
          }}
          onDismiss={() => {
            setDismissOffline(true);
            setShowManualOffline(false);
          }}
        />
      )}

      {/* In-App Automatic Update Prompt Notification */}
      <AppUpdatePrompt />

      {!user ? (
        <AuthModal />
      ) : (
        <div className="flex h-screen bg-slate-50 overflow-hidden relative">
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
              onShowOfflineModal={() => setShowManualOffline(true)}
              onShowLoadingModal={() => setShowManualLoading(true)}
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

              {/* Standard Enterprise ERP Views */}
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
                  {currentTab === 'developer' && <DeveloperPage />}
                </>
              )}
            </main>
          </div>
        </div>
      )}
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <UpdateProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </UpdateProvider>
    </AuthProvider>
  );
}
