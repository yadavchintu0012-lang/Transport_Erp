import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  is_superadmin: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  tax_number?: string;
  currency: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  is_demo?: boolean;
}

export interface Role {
  id: string;
  name: string;
  code: string;
}

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  role: Role | null;
  permissions: Record<string, string[]>;
  token: string | null;
  login: (token: string, user: User, organization: Organization | null, role: Role | null, permissions: Record<string, string[]>) => void;
  logout: () => void;
  hasPermission: (module: string, action: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          setOrganization(res.data.organization);
          setRole(res.data.role);
          setPermissions(res.data.permissions || {});
        } catch (err) {
          console.error('Session expired or invalid', err);
          logout();
        }
      }
      setIsLoading(false);
    };
    fetchMe();
  }, []);

  const login = (
    newToken: string,
    newUser: User,
    newOrg: Organization | null,
    newRole: Role | null,
    newPerms: Record<string, string[]>
  ) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    setOrganization(newOrg);
    setRole(newRole);
    setPermissions(newPerms);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setOrganization(null);
    setRole(null);
    setPermissions({});
  };

  const hasPermission = (module: string, action: string): boolean => {
    if (user?.is_superadmin) return true;
    if (role?.code === 'owner') return true;
    const modulePerms = permissions[module] || [];
    return modulePerms.includes(action);
  };

  return (
    <AuthContext.Provider value={{ user, organization, role, permissions, token, login, logout, hasPermission, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
