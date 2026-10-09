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
  Menu,
  X
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

  const navItems = [
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
  ];

  const filteredNavItems = navItems.filter(item => hasPermission(item.module, item.action));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className="
        fixed lg:static top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-slate-100 flex flex-col
        transition-transform duration-200 ease-in-out border-r border-slate-800
        
      ">
        {/* Header Branding */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
              TP
            </div>
            <div>
              <div className="font-bold text-base tracking-wide text-white">TransportPro</div>
              <div className="text-[11px] text-blue-400 font-medium">Enterprise ERP</div>
            </div>
          </div>
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Company Workspace Badge */}
        {organization && (
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
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setIsOpen(false);
                }}
                className="
                  w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  
                "
              >
                <div className="flex items-center space-x-3">
                  <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={15} className="text-white/80" />}
              </button>
            );
          })}
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
