'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, OrganizationSummary, User } from './api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  organizations: OrganizationSummary[];
  aiModel: 'groq' | 'gemini';
  setAiModel: (model: 'groq' | 'gemini') => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, org: string, email: string, pass: string) => Promise<void>;
  switchOrg: (orgId: string) => Promise<void>;
  createOrg: (name: string) => Promise<void>;
  updateOrgName: (name: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  organizations: [],
  aiModel: 'groq',
  setAiModel: () => {},
  login: async () => {},
  register: async () => {},
  switchOrg: async () => {},
  createOrg: async () => {},
  updateOrgName: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiModel, setAiModelState] = useState<'groq' | 'gemini'>('groq');

  // Load preferred model from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      void Promise.resolve().then(() => {
        const savedModel = localStorage.getItem('telemind_ai_model') as 'groq' | 'gemini' | null;
        if (savedModel === 'groq' || savedModel === 'gemini') setAiModelState(savedModel);
      });
    }
  }, []);

  const setAiModel = (m: 'groq' | 'gemini') => {
    setAiModelState(m);
    if (typeof window !== 'undefined') {
      localStorage.setItem('telemind_ai_model', m);
    }
  };

  const loadOrgs = useCallback(async () => {
    try {
      const orgs = await api.listOrganizations();
      setOrganizations(orgs);
    } catch {
      setOrganizations([]);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.getMe();
      setUser(data);
      await loadOrgs();
    } catch {
      setUser(null);
      setOrganizations([]);
      api.clearToken();
    } finally {
      setLoading(false);
    }
  }, [loadOrgs]);

  useEffect(() => {
    void Promise.resolve().then(refreshUser);
  }, [refreshUser]);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUser(res.user);
    await loadOrgs();
  };

  const register = async (name: string, org: string, email: string, pass: string) => {
    const res = await api.register({ fullName: name, organizationName: org, email, password: pass });
    setUser(res.user);
    await loadOrgs();
  };

  const switchOrg = async (orgId: string) => {
    setLoading(true);
    try {
      const res = await api.switchOrganization(orgId);
      setUser(res.user);
      await loadOrgs();
    } finally {
      setLoading(false);
    }
  };

  const createOrg = async (name: string) => {
    setLoading(true);
    try {
      const res = await api.createOrganization(name);
      setUser(res.user);
      await loadOrgs();
    } finally {
      setLoading(false);
    }
  };

  const updateOrgName = async (name: string) => {
    await api.updateOrganization(name);
    await refreshUser();
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
    setOrganizations([]);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        organizations,
        aiModel,
        setAiModel,
        login,
        register,
        switchOrg,
        createOrg,
        updateOrgName,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
