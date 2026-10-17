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
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [organization, setOrganization] = useState<Organization | null>(() => {
    try {
      const saved = localStorage.getItem('organization');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [role, setRole] = useState<Role | null>(() => {
    try {
      const saved = localStorage.getItem('role');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [permissions, setPermissions] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem('permissions');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Only display full-screen loading if a token is present but user profile is not yet loaded
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const hasToken = !!localStorage.getItem('token');
    const hasUser = !!localStorage.getItem('user');
    return hasToken && !hasUser;
  });

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

          // Persist user and session info
          localStorage.setItem('user', JSON.stringify(res.data.user));
          if (res.data.organization) {
            localStorage.setItem('organization', JSON.stringify(res.data.organization));
          } else {
            localStorage.removeItem('organization');
          }
          if (res.data.role) {
            localStorage.setItem('role', JSON.stringify(res.data.role));
          } else {
            localStorage.removeItem('role');
          }
          localStorage.setItem('permissions', JSON.stringify(res.data.permissions || {}));
        } catch (err: any) {
          const status = err?.response?.status;
          // ONLY log out if backend returns 401 Unauthorized
          // Never log out on temporary backend cold starts, network errors, 502/503/504
          if (status === 401) {
            console.warn('Session expired or unauthorized, logging out');
            logout();
          } else {
            console.warn('Backend updating or waking up, retaining saved session');
          }
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
    localStorage.setItem('user', JSON.stringify(newUser));
    if (newOrg) {
      localStorage.setItem('organization', JSON.stringify(newOrg));
    } else {
      localStorage.removeItem('organization');
    }
    if (newRole) {
      localStorage.setItem('role', JSON.stringify(newRole));
    } else {
      localStorage.removeItem('role');
    }
    localStorage.setItem('permissions', JSON.stringify(newPerms || {}));

    setToken(newToken);
    setUser(newUser);
    setOrganization(newOrg);
    setRole(newRole);
    setPermissions(newPerms || {});
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('organization');
    localStorage.removeItem('role');
    localStorage.removeItem('permissions');
    setToken(null);
    setUser(null);
    setOrganization(null);
    setRole(null);
    setPermissions({});
  };

  const hasPermission = (module: string, action: string): boolean => {
    if (user?.is_superadmin) return true;
    if (role?.code === 'owner') return true;
    // Allow exploring and viewing all operational ERP modules
    if (action === 'view') return true;
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
