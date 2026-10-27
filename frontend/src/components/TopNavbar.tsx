import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  ChevronDown, 
  Menu, 
  Truck, 
  LogOut, 
  Code2, 
  ShieldCheck, 
  User, 
  RefreshCw, 
  Sparkles,
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  BadgeCheck,
  CreditCard,
  IndianRupee,
  Hash,
  X,
  Camera,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOfflineSync } from '../services/syncEngine';
import { useAppUpdate } from '../context/UpdateContext';
import { useAppNotifications } from '../context/NotificationContext';
import { NotificationDropdown } from './NotificationDropdown';

interface TopNavbarProps {
  onToggleSidebar: () => void;
  title?: string;
  onNavigateTab?: (tab: string) => void;
  onShowOfflineModal?: () => void;
  onShowLoadingModal?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ 
  onToggleSidebar, 
  title, 
  onNavigateTab,
  onShowOfflineModal,
  onShowLoadingModal 
}) => {
  const { user, organization, role, logout } = useAuth();
  const { isOnline, pendingCount, isSyncing, syncNow } = useOfflineSync();
  const { currentVersion, remoteVersion, isUpdateAvailable, setShowModal } = useAppUpdate();
  const { unreadCount, hasPendingUpdate } = useAppNotifications();
  
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Picture state with localStorage persistence
  const [profilePic, setProfilePic] = useState<string>(() => {
    return localStorage.getItem('custom_profile_pic') || (user as any)?.avatar_url || '/developer-photo.jpg';
  });

  // Listen for storage updates across tabs/windows
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('custom_profile_pic');
      if (saved) {
        setProfilePic(saved);
      } else {
        setProfilePic((user as any)?.avatar_url || '/developer-photo.jpg');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  // Handle uploading and compressing a new profile picture
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.9);
          setProfilePic(compressed);
          localStorage.setItem('custom_profile_pic', compressed);
          window.dispatchEvent(new Event('storage'));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Reset profile photo to default
  const handleResetProfilePic = () => {
    localStorage.removeItem('custom_profile_pic');
    setProfilePic('/developer-photo.jpg');
    window.dispatchEvent(new Event('storage'));
  };

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user?.full_name || 'Chintu Kumar';
  const userEmail = user?.email || 'yadavchintu0012@gmail.com';
  const userPhone = user?.phone || '+91 98765 43210';
  const companyName = organization?.name || 'Apex Express Logistics';
  const companyGstin = organization?.tax_number || '07AABCA1234F1Z5';
  const companySlug = organization?.slug || 'apex-express-erp';
  const companyCity = organization?.city || 'New Delhi';
  const companyState = organization?.state || 'Delhi NCR';
  const companyAddress = organization?.address || 'Plot 42, Transport Nagar Phase-1';
  const companyPhone = organization?.phone || user?.phone || '+91 98765 43210';
  const companyEmail = organization?.email || user?.email || 'dispatch@apexlogistics.in';
  const roleName = role?.name || (user?.is_superadmin ? 'SaaS Superadmin' : 'Company Owner');
  const currency = organization?.currency || 'INR';

  return (
    <header className="relative w-full bg-gradient-to-r from-[#072456] via-[#0b3882] to-[#061e47] text-white shadow-xl overflow-visible select-none z-30">
      {/* Hidden file input for changing profile picture */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        onChange={handleImageChange} 
        className="hidden" 
      />

      {/* Background Highway Graphics & Truck Silhouette */}
      <div className="absolute inset-0 pointer-events-none opacity-45 overflow-hidden">
        {/* Curving Highway Surface */}
        <svg 
          className="absolute right-0 bottom-0 h-full w-[650px] max-w-full"
          viewBox="0 0 600 120" 
          fill="none" 
          preserveAspectRatio="none"
        >
          {/* Horizon glow */}
          <path d="M0,120 Q300,45 600,75 L600,120 Z" fill="url(#roadGrad)" opacity="0.6" />
          
          {/* Highway Lanes with Perspective Lines */}
          <path d="M120,120 Q340,55 600,80" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="8 8" opacity="0.8" />
          <path d="M220,120 Q390,65 600,85" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="14 10" opacity="0.6" />
          
          {/* Route Navigation Pins with dashed flight paths */}
          <path d="M240,65 Q310,35 370,42" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="4 4" opacity="0.75" />
          <circle cx="310" cy="50" r="3" fill="#38bdf8" />
          <circle cx="370" cy="42" r="4.5" fill="#38bdf8" />
          <circle cx="370" cy="42" r="1.5" fill="#ffffff" />

          {/* Gradients */}
          <defs>
            <linearGradient id="roadGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>

        {/* Photorealistic 3D Semi-Truck Vector driving along the highway */}
        <div className="absolute right-12 md:right-28 bottom-0 transform translate-y-1 w-36 sm:w-48 h-18 pointer-events-none">
          <svg viewBox="0 0 200 90" className="w-full h-full drop-shadow-2xl">
            {/* Trailer Body */}
            <rect x="40" y="16" width="135" height="52" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
            <rect x="42" y="18" width="131" height="48" fill="#f8fafc" />
            <rect x="40" y="52" width="135" height="7" fill="#2563eb" />
            <line x1="65" y1="18" x2="65" y2="66" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="95" y1="18" x2="95" y2="66" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="125" y1="18" x2="125" y2="66" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="155" y1="18" x2="155" y2="66" stroke="#e2e8f0" strokeWidth="1" />
            
            {/* Truck Cab */}
            <path d="M40 38 L22 38 L12 52 L8 68 L40 68 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
            <path d="M22 41 L36 41 L36 52 L15 52 Z" fill="#0284c7" opacity="0.85" />
            <polygon points="12,56 8,62 8,66 12,66" fill="#facc15" />
            <circle cx="8" cy="62" r="3" fill="#fef08a" opacity="0.8" />
            
            {/* Wheels */}
            <circle cx="24" cy="72" r="9.5" fill="#0f172a" stroke="#475569" strokeWidth="2" />
            <circle cx="24" cy="72" r="4.5" fill="#94a3b8" />
            <circle cx="68" cy="72" r="9.5" fill="#0f172a" stroke="#475569" strokeWidth="2" />
            <circle cx="68" cy="72" r="4.5" fill="#94a3b8" />
            <circle cx="145" cy="72" r="9.5" fill="#0f172a" stroke="#475569" strokeWidth="2" />
            <circle cx="145" cy="72" r="4.5" fill="#94a3b8" />
            <circle cx="162" cy="72" r="9.5" fill="#0f172a" stroke="#475569" strokeWidth="2" />
            <circle cx="162" cy="72" r="4.5" fill="#94a3b8" />
          </svg>
        </div>
      </div>

      {/* Main Header Bar Container */}
      <div className="relative z-20 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Left Side: Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          {/* Hamburger Menu Toggle (Opens Left Sidebar Drawer) */}
          <button
            onClick={onToggleSidebar}
            className="p-1.5 -ml-1 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Open Navigation Menu"
          >
            <Menu size={22} />
          </button>

          {/* Truck Icon Logo */}
          <div 
            onClick={onToggleSidebar}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/25 flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-[#082855] rounded-[10px] flex items-center justify-center">
                <Truck size={22} className="text-sky-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center tracking-tight">
                <span className="text-lg font-black text-white">FLEET</span>
                <span className="text-lg font-black text-sky-400">FLOW</span>
                <span className="text-lg font-black text-white ml-1">ERP</span>
              </div>
              <p className="text-[11px] font-medium text-sky-200/80 tracking-wide -mt-0.5">
                Smart Transport Management
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Notification Bell & Profile Avatar with Dropdown */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Pending Offline Sync Badge */}
          {pendingCount > 0 && (
            <button
              onClick={() => syncNow()}
              disabled={isSyncing}
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-semibold"
              title="Sync pending offline records"
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
              <span>{pendingCount}</span>
            </button>
          )}

          {/* In-App Update Ready Badge */}
          {isUpdateAvailable && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-full text-xs font-bold shadow-md shadow-emerald-500/30 transition-all cursor-pointer animate-pulse"
              title="New version available"
            >
              <Sparkles size={12} className="text-yellow-200" />
              <span className="text-[11px]">Update</span>
            </button>
          )}

          {/* Notification Bell Button */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all shadow-md cursor-pointer active:scale-95"
              title="Notifications"
            >
              <Bell size={20} className={hasPendingUpdate ? 'animate-bounce text-amber-300' : 'text-white'} />
              
              {/* Red Badge with counter */}
              {(unreadCount > 0 || unreadCount === 0) && (
                <span className="absolute -top-1 -right-1 min-w-[19px] h-[19px] px-1 bg-rose-500 text-white text-[11px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-[#072456] shadow-sm">
                  {unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : '2'}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            <NotificationDropdown
              isOpen={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
            />
          </div>

          {/* User Profile Avatar with Downward Chevron */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-1.5 p-0.5 rounded-full hover:bg-white/10 transition-all cursor-pointer group"
              title="User Profile & Company Details"
            >
              <div className="relative w-10 h-10 rounded-full ring-2 ring-white/50 group-hover:ring-sky-400 overflow-hidden bg-slate-900 shadow-md">
                <img
                  src={profilePic}
                  alt={displayName}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'developer-photo.jpg';
                  }}
                />
              </div>

              <ChevronDown 
                size={16} 
                className={`text-white/80 group-hover:text-white transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Backdrop overlay for mobile screen to close profile dropdown easily */}
            {profileOpen && (
              <div 
                className="sm:hidden fixed inset-0 bg-slate-950/60 z-40 backdrop-blur-xs" 
                onClick={() => setProfileOpen(false)} 
              />
            )}

            {/* Profile Dropdown Menu with Complete Signup & Company Information */}
            {profileOpen && (
              <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-full mt-2 w-[calc(100vw-24px)] sm:w-[440px] max-w-[460px] rounded-3xl bg-slate-900/98 backdrop-blur-2xl border border-slate-700/80 shadow-2xl p-4 sm:p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-4 max-h-[85vh] overflow-y-auto">
                {/* 1. Logged-in User Profile Header */}
                <div className="flex items-start justify-between pb-3.5 border-b border-slate-800">
                  <div className="flex items-center space-x-3.5 min-w-0">
                    {/* User Avatar with interactive Camera / Change option */}
                    <div 
                      className="relative shrink-0 group/avatar cursor-pointer" 
                      onClick={() => fileInputRef.current?.click()} 
                      title="Click to change profile picture"
                    >
                      <img
                        src={profilePic}
                        alt={displayName}
                        className="w-14 h-14 rounded-2xl object-cover object-top ring-2 ring-sky-500/70 shadow-lg group-hover/avatar:ring-blue-400 transition-all"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'developer-photo.jpg';
                        }}
                      />
                      <div className="absolute inset-0 rounded-2xl bg-black/45 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera size={18} className="text-white drop-shadow" />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center ring-2 ring-slate-900 shadow transition-transform active:scale-90 cursor-pointer"
                        title="Upload new picture"
                      >
                        <Camera size={11} />
                      </button>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm sm:text-base font-extrabold text-white truncate">{displayName}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {roleName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        <span className="truncate">{userEmail}</span>
                      </div>
                      {userPhone && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone size={11} className="text-sky-400" />
                          <span>{userPhone}</span>
                        </p>
                      )}

                      {/* Change Profile Pic / Reset Buttons */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                          title="Choose photo from device"
                        >
                          <Camera size={12} />
                          <span>Change Photo</span>
                        </button>
                        {localStorage.getItem('custom_profile_pic') && (
                          <button
                            type="button"
                            onClick={handleResetProfilePic}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-medium transition-all cursor-pointer"
                            title="Reset to default photo"
                          >
                            <RotateCcw size={10} />
                            <span>Reset</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setProfileOpen(false)}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* 2. Comprehensive Company Signup Details Card */}
                <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3.5 space-y-3 shadow-inner">
                  {/* Card Section Header */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center space-x-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                      <Building2 size={16} />
                      <span>Company Registration Profile</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-700/50 shadow-xs">
                      <CheckCircle2 size={12} />
                      Active & Verified
                    </span>
                  </div>

                  {/* Company Name & Slug */}
                  <div>
                    <h4 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
                      {companyName}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono text-sky-300 bg-sky-950/70 px-2 py-0.5 rounded border border-sky-800/40">
                        Org ID: {companySlug}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Currency: {currency}
                      </span>
                    </div>
                  </div>

                  {/* Complete 2-Column Info Grid for all Signup Details */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {/* GSTIN / Tax Number */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <FileText size={12} className="text-sky-400" />
                        <span>GSTIN / Tax ID</span>
                      </div>
                      <p className="font-mono font-bold text-white text-[11px] truncate tracking-wide">
                        {companyGstin}
                      </p>
                    </div>

                    {/* Operating Plan */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <Sparkles size={12} className="text-amber-400" />
                        <span>Signup Plan</span>
                      </div>
                      <p className="font-bold text-blue-400 text-[11px] truncate">
                        Enterprise Fleet Pro
                      </p>
                    </div>

                    {/* Headquarters / City */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <MapPin size={12} className="text-rose-400" />
                        <span>Headquarters</span>
                      </div>
                      <p className="font-semibold text-slate-200 text-[11px] truncate">
                        {companyCity}, {companyState}
                      </p>
                    </div>

                    {/* Dispatch Contact Phone */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <Phone size={12} className="text-emerald-400" />
                        <span>Dispatch Phone</span>
                      </div>
                      <p className="font-semibold text-slate-200 text-[11px] truncate">
                        {companyPhone}
                      </p>
                    </div>

                    {/* Registered Address */}
                    <div className="col-span-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <Building2 size={12} className="text-indigo-400" />
                        <span>Registered Office Address</span>
                      </div>
                      <p className="font-medium text-slate-300 text-[11px] truncate">
                        {companyAddress}
                      </p>
                    </div>

                    {/* Official Dispatch Email */}
                    <div className="col-span-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <Mail size={12} className="text-violet-400" />
                        <span>Official Dispatch Email</span>
                      </div>
                      <p className="font-medium text-slate-200 text-[11px] truncate">
                        {companyEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Action Shortcuts & Developer Link */}
                <div className="space-y-1 text-xs font-medium text-slate-300 pt-1">
                  {onNavigateTab && (
                    <button
                      onClick={() => {
                        onNavigateTab('developer');
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-blue-600/20 hover:text-blue-300 border border-transparent hover:border-blue-500/30 transition-all cursor-pointer text-left"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Code2 size={16} className="text-blue-400" />
                        <span>Developer & Legal Rights Section</span>
                      </div>
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">View</span>
                    </button>
                  )}

                  {onNavigateTab && (
                    <button
                      onClick={() => {
                        onNavigateTab('subscriptions');
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-emerald-600/20 hover:text-emerald-300 border border-transparent hover:border-emerald-500/30 transition-all cursor-pointer text-left"
                    >
                      <div className="flex items-center space-x-2.5">
                        <CreditCard size={16} className="text-emerald-400" />
                        <span>Subscription & Plan Details</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">Active</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer text-left border-t border-slate-800/80 mt-2"
                  >
                    <LogOut size={16} />
                    <span>Sign Out from {companyName}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
