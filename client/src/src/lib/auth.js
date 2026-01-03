// Auth context and utilities for managing authentication state

import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock user for demo purposes
export const mockUser = {
  id: '1',
  name: 'Alex Morgan',
  email: 'alex.morgan@company.com',
  role: 'employee',
  avatar: '',
  position: 'Software Engineer II',
  department: 'Engineering',
  company: 'TechFlow Solutions',
  manager: 'Sarah Connor',
  location: 'San Francisco, CA',
  phone: '+1 (555) 123-4567',
  loginId: 'alex.morgan01',
};

export const mockAdminUser = {
  id: '2',
  name: 'Admin User',
  email: 'admin@company.com',
  role: 'admin',
  position: 'HR Officer',
  department: 'Human Resources',
  company: 'TechFlow Solutions',
  location: 'San Francisco, CA',
};
