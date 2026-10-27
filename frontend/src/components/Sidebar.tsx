import React from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Building2, 
  Receipt, 
  FileText, 
  BarChart3, 
  ShieldCheck, 
  Settings, 
  CreditCard,
  LogOut,
  ChevronRight,
  X,
  Layers,
  Code2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, isOpen, setIsOpen }) => {
  const { user, organization, role, logout, hasPermission } = useAuth();

  const isSuperadmin = user?.is_superadmin || false;

  // SaaS Platform Admin navigation (ONLY for Super Admin)
  const saasNavItems = [
    { id: 'saas-dashboard', label: 'SaaS Command Center', icon: LayoutDashboard },
    { id: 'saas-accounts', label: 'Transport Companies', icon: Building2 },
    { id: 'saas-plans', label: 'Subscription Tiers', icon: Layers },
    { id: 'saas-analytics', label: 'Platform Analytics', icon: BarChart3 },
    { id: 'saas-audit', label: 'Platform Audit Trail', icon: ShieldCheck },
  ];

  // ERP Operations navigation (ONLY for ERP IDs / Tenant Users)
  const erpNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, module: 'dashboard', action: 'view' },
    { id: 'trips', label: 'Trip Operations', icon: Truck, module: 'trips', action: 'view' },
    { id: 'vehicles', label: 'Fleet Registry', icon: Truck, module: 'vehicles', action: 'view' },
    { id: 'drivers', label: 'Drivers & Crew', icon: Users, module: 'drivers', action: 'view' },
    { id: 'customers', label: 'Customers', icon: Building2, module: 'customers', action: 'view' },
    { id: 'expenses', label: 'Expense Vouchers', icon: Receipt, module: 'expenses', action: 'view' },
    { id: 'invoices', label: 'Invoices & Ledger', icon: FileText, module: 'accounts', action: 'view' },
    { id: 'reports', label: 'Reports & P&L', icon: BarChart3, module: 'reports', action: 'view' },
    { id: 'staff', label: 'Staff & Roles', icon: ShieldCheck, module: 'staff', action: 'view' },
    { id: 'subscriptions', label: 'Subscription Plan', icon: CreditCard, module: 'settings', action: 'view' },
    { id: 'audit', label: 'Audit Trail', icon: Settings, module: 'settings', action: 'view' },
    { id: 'developer', label: 'Developer & Rights', icon: Code2, module: 'dashboard', action: 'view' },
  ];

  const filteredErpItems = erpNavItems.filter(item => hasPermission(item.module, item.action));

  const [touchStart, setTouchStart] = React.useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = touchStart - currentTouch;
    if (diff > 50) {
      setIsOpen(false);
      setTouchStart(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  return (
    <>
      {/* Backdrop for Drawer (Closes on outside click) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 z-50 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container (Slide-over drawer that stays closed unless More/Menu is clicked) */}
      <aside 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`
        fixed top-0 left-0 z-50 h-screen w-72 sm:w-80 bg-slate-900 text-slate-100 flex flex-col
        transition-transform duration-300 ease-in-out border-r border-slate-800 shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Navigation Drawer Header with Close Button */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation Menu</span>
          <button 
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            onClick={() => setIsOpen(false)}
            title="Close Menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Workspace or SuperAdmin Badge */}
        {isSuperadmin ? (
          <div className="mx-3 my-3 p-3 rounded-lg bg-indigo-950/70 border border-indigo-700/50 shadow-inner">
            <div className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">Administrative Access</div>
            <div className="text-sm font-bold text-white mt-0.5">SaaS Owner Portal</div>
            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-indigo-800/60 text-[11px]">
              <span className="text-indigo-300 font-medium">Platform Super Admin</span>
              <span className="px-1.5 py-0.5 bg-indigo-500/40 text-indigo-200 rounded font-semibold text-[10px]">
                SAAS ONLY
              </span>
            </div>
          </div>
        ) : organization ? (
          <div className="mx-3 my-3 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Workspace</div>
            <div className="text-sm font-semibold text-slate-100 truncate">{organization.name}</div>
            <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-700/40 text-[11px]">
              <span className="text-emerald-400 font-medium capitalize">{role?.name || 'Member'}</span>
              {organization.is_demo && (
                <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-semibold text-[10px]">
                  DEMO ORG
                </span>
              )}
            </div>
          </div>
        ) : null}

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-2 overflow-y-auto">
          {/* CASE 1: Super Admin -> ONLY SaaS Admin navigation */}
          {isSuperadmin ? (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-indigo-400">
                SaaS Platform Controls
              </div>
              {saasNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id || (item.id === 'saas-accounts' && currentTab === 'saas-account-detail');
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTab(item.id);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all
                      ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon size={18} className={isActive ? 'text-white' : 'text-indigo-400'} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight size={15} className="text-white/80" />}
                  </button>
                );
              })}
            </div>
          ) : (
            /* CASE 2: ERP ID Login -> ONLY ERP Operations navigation with full explore permission */
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                ERP Operations
              </div>
              {filteredErpItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTab(item.id);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight size={15} className="text-white/80" />}
                  </button>
                );
              })}
            </div>
          )}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
            <div className="min-w-0 pr-2">
              <div className="text-sm font-semibold text-slate-200 truncate">{user?.full_name}</div>
              <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-slate-700/60 transition-colors"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
