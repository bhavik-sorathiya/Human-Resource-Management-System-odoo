import { useState, useCallback, useEffect } from 'react';
import { AuthContext } from '@/lib/auth';
import { api } from '@/lib/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) return;
      try {
        const me = await api.me(token);
        setUser(me);
      } catch (err) {
        console.error('Failed to load user', err);
        setToken(null);
        localStorage.removeItem('token');
      }
    };
    loadUser();
  }, [token]);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const { token: jwt } = await api.login({ email, password });
      setToken(jwt);
      localStorage.setItem('token', jwt);
      const me = await api.me(jwt);
      setUser(me);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data) => {
    setIsLoading(true);
    try {
      await api.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || 'ADMIN',
        companyName: data.companyName,
        phone: data.phone,
      });
      const { token: jwt } = await api.login({ email: data.email, password: data.password });
      setToken(jwt);
      localStorage.setItem('token', jwt);
      const me = await api.me(jwt);
      setUser(me);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
