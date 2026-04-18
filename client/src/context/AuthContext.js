import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => { localStorage.removeItem('token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    
    // Intercept Temporary Password Flag
    if (res.data.requiresPasswordChange) {
      return res.data; 
    }

    const { token, user } = res.data;
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    return { user };
  };

  const forceChangePassword = async (email, oldPassword, newPassword) => {
    const res = await api.post('/auth/force-change-password', { email, oldPassword, newPassword });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    return { user };
  };

  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role });
    const { token, user, pending } = res.data;
    
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
    }
    
    return { user, token, pending };
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const role = user?.role === 'user' ? 'staff' : user?.role;
  const isAdmin   = role === 'admin';
  const isManager = role === 'manager';
  const isStaff   = role === 'staff';

  // Permission map — what each role CAN do
  const PERMISSIONS = {
    admin: ['add_item','edit_item','delete_item','manage_categories','print_barcodes','manage_users','adjust_stock','view_logs', 'add_maintenance','close_maintenance'],
    manager: ['add_item','edit_item','delete_item','manage_categories', 'print_barcodes', 'adjust_stock','view_logs','add_maintenance','close_maintenance'],
    staff: ['add_item', 'adjust_stock','view_logs','add_maintenance'],
  };

  const hasPermission = (action) => {
    if (!role) return false;
    return (PERMISSIONS[role] || []).includes(action);
  };

  return (
    <AuthContext.Provider value={{ user, login, forceChangePassword, logout, loading, isAdmin, isManager, isStaff, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
