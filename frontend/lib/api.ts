// TeleMind API Client for Next.js

export interface User {
  id: string;
  email: string;
  fullName: string;
  organizationId: string;
  organizationName: string;
  role: 'OWNER' | 'ADMIN' | 'AGENT';
}

export interface DocumentItem {
  id: string;
  title: string;
  fileSize: number;
  mimeType: string;
  totalChunks: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AskResult {
  answer: string;
  sources: string[];
}

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  role: 'OWNER' | 'ADMIN' | 'AGENT';
}

export interface IntegrationStatus {
  telegram: { connected: boolean; botUsername: string | null; status: string; lastError: string | null; connectedAt: string | null };
  whatsappDemo: { claimedByWorkspace: boolean; available: boolean; status: string; qrAvailable: boolean; lastError: string | null; phoneNumber: string | null };
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3060/api/v1';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('telemind_token');
  }

  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('telemind_token', token);
    }
  }

  clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('telemind_token');
    }
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || 'An error occurred during request.';
      throw new Error(errorMsg);
    }

    return data as T;
  }

  // Auth Endpoints
  async register(input: {
    fullName: string;
    organizationName: string;
    email: string;
    password: string;
  }): Promise<{ accessToken: string; user: User }> {
    const res = await this.request<{ accessToken: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    this.setToken(res.accessToken);
    return res;
  }

  async login(email: string, password: string): Promise<{ accessToken: string; user: User }> {
    const res = await this.request<{ accessToken: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.accessToken);
    return res;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Organization & Multi-Tenancy Endpoints
  async listOrganizations(): Promise<OrganizationSummary[]> {
    return this.request<OrganizationSummary[]>('/auth/organizations');
  }

  async createOrganization(name: string): Promise<{ accessToken: string; user: User }> {
    const res = await this.request<{ accessToken: string; user: User }>('/auth/organizations', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    this.setToken(res.accessToken);
    return res;
  }

  async switchOrganization(organizationId: string): Promise<{ accessToken: string; user: User }> {
    const res = await this.request<{ accessToken: string; user: User }>('/auth/switch-org', {
      method: 'POST',
      body: JSON.stringify({ organizationId }),
    });
    this.setToken(res.accessToken);
    return res;
  }

  async updateOrganization(name: string): Promise<{ id: string; name: string }> {
    return this.request<{ id: string; name: string }>('/auth/organization', {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
  }

  // Knowledge Endpoints
  async listDocuments(): Promise<DocumentItem[]> {
    return this.request<DocumentItem[]>('/knowledge/documents');
  }

  async createNote(title: string, content: string): Promise<{ documentId: string; chunkCount: number }> {
    return this.request<{ documentId: string; chunkCount: number }>('/knowledge/notes', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
  }

  async uploadDocument(file: File): Promise<{ documentId: string; chunkCount: number }> {
    const form = new FormData();
    form.append('file', file);
    return this.request<{ documentId: string; chunkCount: number }>('/knowledge/documents/upload', {
      method: 'POST',
      body: form,
    });
  }

  async ask(question: string, model?: 'groq' | 'gemini'): Promise<AskResult> {
    return this.request<AskResult>('/knowledge/ask', {
      method: 'POST',
      body: JSON.stringify({ question, model }),
    });
  }

  async deleteDocument(id: string): Promise<{ deleted: boolean; title: string }> {
    return this.request<{ deleted: boolean; title: string }>(`/knowledge/documents/${id}`, {
      method: 'DELETE',
    });
  }

  async getIntegrationStatus(): Promise<IntegrationStatus> {
    return this.request<IntegrationStatus>('/integrations/status');
  }

  async connectTelegram(token: string): Promise<{ connected: boolean; botUsername: string }> {
    return this.request('/integrations/telegram', { method: 'PUT', body: JSON.stringify({ token }) });
  }

  async disconnectTelegram(): Promise<{ disconnected: boolean }> {
    return this.request('/integrations/telegram', { method: 'DELETE' });
  }

  async claimWhatsappDemo(): Promise<{ claimed: boolean; connected: boolean; qrAvailable: boolean }> {
    return this.request('/integrations/whatsapp-demo', { method: 'POST' });
  }

  async getWhatsappDemoQr(): Promise<{ connected: boolean; qrDataUrl: string | null; waiting?: boolean }> {
    return this.request('/integrations/whatsapp-demo/qr');
  }

  async releaseWhatsappDemo(): Promise<{ disconnected: boolean }> {
    return this.request('/integrations/whatsapp-demo', { method: 'DELETE' });
  }
}

export const api = new ApiClient();
