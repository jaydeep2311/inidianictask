import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api';
import { Snackbar, Alert } from '@mui/material';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser({ token });
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  }, [token]);

  const notify = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    setToken(res.data.token);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    notify('Login successful', 'success');
    return res.data.user;
  };

  const register = async (name, email, password) => {
    await axios.post('/api/auth/register', { name, email, password });
    notify('Registration successful! Please login.', 'success');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    notify('Logged out', 'info');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, notify }}>
      {children}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 