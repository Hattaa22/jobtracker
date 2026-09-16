export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  provider?: 'email' | 'google';
  phone?: string | null;
  location?: string | null;
  portfolioUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  preferences?: Record<string, any>;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

const API_BASE = `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '')}/auth`;

export const getStoredToken = (): string | null => {
  return localStorage.getItem('jobtrack_auth_token');
};

export const setStoredToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('jobtrack_auth_token', token);
  } else {
    localStorage.removeItem('jobtrack_auth_token');
  }
};

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    setStoredToken(data.token);
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    setStoredToken(data.token);
    return data;
  },

  async googleAuth(credential?: string, profile?: any): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, profile }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Google authentication failed');
    setStoredToken(data.token);
    return data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Reset failed');
    return data;
  },

  async getCurrentUser(): Promise<User | null> {
    const token = getStoredToken();
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/me`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        setStoredToken(null);
        return null;
      }
      return await res.json();
    } catch {
      return null;
    }
  },

  logout(): void {
    setStoredToken(null);
  },
};
