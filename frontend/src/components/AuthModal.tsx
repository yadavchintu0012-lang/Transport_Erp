import React, { useState } from 'react';
import { Truck, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC<{ initialMode?: 'login' | 'register' }> = ({ initialMode = 'login' }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

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
      setError(err.response?.data?.detail || 'Invalid email or password');
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
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Quick demo credentials loader
  const fillDemoRole = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl mb-1">
            <Truck size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">TransportPro ERP</h2>
          <p className="text-xs text-slate-500">Multi-Tenant Fleet & Transport Operations SaaS</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setMode('login')}
            className="lex-1 py-2 rounded-lg transition-all "
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className="lex-1 py-2 rounded-lg transition-all "
          >
            Register Company
          </button>
        </div>

        {/* Login Form */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full mt-1 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full mt-1 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            </button>

            {/* Quick Demo Credentials Buttons */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Explore Demo Roles:
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => fillDemoRole('owner@apexexpress.com', 'Owner@123')}
                  className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded text-center truncate"
                >
                  Owner
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoRole('accounts@apexexpress.com', 'Accounts@123')}
                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium rounded text-center truncate"
                >
                  Accountant
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoRole('operator@apexexpress.com', 'Operator@123')}
                  className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium rounded text-center truncate"
                >
                  Trip Operator
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700">Transport Company Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Mahavir Roadlines Pvt Ltd"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full mt-1 p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Company Owner Name *</label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full mt-1 p-2 border rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="font-semibold text-slate-700">Secure Password *</label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full mt-1 p-2 border rounded-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors mt-2"
            >
              {loading ? 'Creating Workspace...' : 'Create Transport Workspace'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
