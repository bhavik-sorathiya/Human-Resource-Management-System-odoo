import { useState, useCallback } from 'react';
import { AuthContext, mockUser, mockAdminUser } from '@/lib/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo: admin@company.com logs in as admin, others as employee
      if (email.toLowerCase().includes('admin')) {
        setUser(mockAdminUser);
      } else {
        setUser(mockUser);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser({
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        role: 'employee',
        company: data.companyName,
        phone: data.phone,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
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
