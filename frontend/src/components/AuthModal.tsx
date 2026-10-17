import React, { useState } from 'react';
import { 
  Truck, 
  ArrowRight, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Building2, 
  User, 
  Phone, 
  MapPin, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC<{ initialMode?: 'login' | 'register' }> = ({ initialMode = 'login' }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('owner@apexexpress.com');
  const [loginPassword, setLoginPassword] = useState('Owner@123');

  // Register form
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', {
        email: loginEmail,
        password: loginPassword
      });
      login(
        res.data.access_token,
        res.data.user,
        res.data.organization,
        res.data.role,
        res.data.permissions
      );
    } catch (err: any) {
      const msg = err.response?.data?.detail || (err.message === 'Network Error' ? 'Cannot reach backend server. Please check connection.' : (err.message || 'Invalid email or password'));
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', {
        company_name: companyName,
        owner_name: ownerName,
        email: regEmail,
        password: regPassword,
        phone,
        city,
        plan_code: 'professional'
      });
      login(
        res.data.access_token,
        res.data.user,
        res.data.organization,
        res.data.role,
        res.data.permissions
      );
    } catch (err: any) {
      const msg = err.response?.data?.detail || (err.message === 'Network Error' ? 'Cannot reach backend server. Please check connection.' : (err.message || 'Registration failed'));
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Quick demo credentials loader
  const fillDemoRole = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-blue-950 flex items-center justify-center p-4 sm:p-6 text-slate-900">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-100/80 p-6 sm:p-8 space-y-6 relative overflow-hidden">
        
        {/* Top accent gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />

        {/* Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="inline-flex p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md shadow-blue-500/25 mb-1">
            <Truck size={28} className="stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">TransportPro ERP</h1>
          <p className="text-xs text-slate-500 font-medium">Multi-Tenant Fleet & Transport Operations SaaS</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2.5">
            <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {/* Tab Switcher - Crisp & High Contrast */}
        <div className="grid grid-cols-2 bg-slate-100/90 p-1 rounded-xl text-xs font-semibold border border-slate-200/60">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Sparkles size={13} className={mode === 'register' ? 'text-amber-500' : 'text-slate-400'} />
            <span>Register Company</span>
          </button>
        </div>

        {/* Login Form */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl text-slate-900 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl text-slate-900 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-blue-500/25 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Quick Demo Credentials Buttons */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                  Explore Demo Roles
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Click to prefill</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => fillDemoRole('admin@transportpro.com', 'Admin@123')}
                  className="p-2.5 bg-indigo-50/80 hover:bg-indigo-100/90 text-indigo-900 font-semibold rounded-xl text-left border border-indigo-200/80 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-900">
                    <span>⚡</span>
                    <span>Super Admin</span>
                  </div>
                  <div className="text-[10px] text-indigo-600 font-medium mt-0.5">SaaS Platform</div>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoRole('owner@apexexpress.com', 'Owner@123')}
                  className="p-2.5 bg-blue-50/80 hover:bg-blue-100/90 text-blue-900 font-semibold rounded-xl text-left border border-blue-200/80 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-blue-900">
                    <span>🚚</span>
                    <span>Transport Owner</span>
                  </div>
                  <div className="text-[10px] text-blue-600 font-medium mt-0.5">Apex Express</div>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoRole('accounts@apexexpress.com', 'Accounts@123')}
                  className="p-2.5 bg-emerald-50/80 hover:bg-emerald-100/90 text-emerald-900 font-semibold rounded-xl text-left border border-emerald-200/80 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
                    <span>📊</span>
                    <span>Accountant</span>
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Invoices & Ledger</div>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoRole('operator@apexexpress.com', 'Operator@123')}
                  className="p-2.5 bg-amber-50/80 hover:bg-amber-100/90 text-amber-900 font-semibold rounded-xl text-left border border-amber-200/80 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
                    <span>📋</span>
                    <span>Trip Operator</span>
                  </div>
                  <div className="text-[10px] text-amber-700 font-medium mt-0.5">Fleet & LR Dispatch</div>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Transport Company Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building2 size={16} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahavir Roadlines Pvt Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl text-slate-900 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Owner Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl text-slate-900 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={15} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="owner@fleet.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl text-slate-900 text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone size={15} />
                  </div>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl text-slate-900 text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operating City
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MapPin size={15} />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl text-slate-900 text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={15} />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl text-slate-900 text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-blue-500/25 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Workspace...</span>
                </>
              ) : (
                <>
                  <span>Create Transport Workspace</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
