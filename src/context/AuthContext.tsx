import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, getStoredToken, type User, type AuthResponse } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string) => Promise<AuthResponse>;
  googleLogin: (credential?: string, profile?: any) => Promise<AuthResponse>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const checkUserSession = useCallback(async () => {
    setIsLoading(true);
    const storedToken = getStoredToken();
    if (storedToken) {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setToken(storedToken);
      } else {
        setUser(null);
        setToken(null);
      }
    } else {
      setUser(null);
      setToken(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setError(null);
    try {
      const res = await authService.login(email, password);
      setUser(res.user);
      setToken(res.token);
      return res;
    } catch (err: any) {
      const msg = err.message || 'Invalid email or password';
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
    setError(null);
    try {
      const res = await authService.register(name, email, password);
      setUser(res.user);
      setToken(res.token);
      return res;
    } catch (err: any) {
      const msg = err.message || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  const googleLogin = async (credential?: string, profile?: any): Promise<AuthResponse> => {
    setError(null);
    try {
      const res = await authService.googleAuth(credential, profile);
      setUser(res.user);
      setToken(res.token);
      return res;
    } catch (err: any) {
      const msg = err.message || 'Google authentication failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  const forgotPassword = async (email: string): Promise<{ message: string }> => {
    setError(null);
    try {
      return await authService.forgotPassword(email);
    } catch (err: any) {
      const msg = err.message || 'Failed to send reset link';
      setError(msg);
      throw new Error(msg);
    }
  };

  const resetPassword = async (tokenStr: string, newPassword: string): Promise<{ message: string }> => {
    setError(null);
    try {
      return await authService.resetPassword(tokenStr, newPassword);
    } catch (err: any) {
      const msg = err.message || 'Password reset failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        error,
        clearError,
        login,
        register,
        googleLogin,
        forgotPassword,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
