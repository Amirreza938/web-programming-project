import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check if user is logged in when app loads
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = (email, password) => {
    // This would be an API call in a real app
    // For now we'll simulate a successful login
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'user@example.com' && password === 'password') {
          const user = {
            id: '1',
            name: 'کاربر نمونه',
            email: 'user@example.com',
            role: 'user',
            verified: true,
          };
          localStorage.setItem('user', JSON.stringify(user));
          setCurrentUser(user);
          toast.success('با موفقیت وارد شدید');
          resolve(user);
        } else if (email === 'admin@example.com' && password === 'admin') {
          const admin = {
            id: '2',
            name: 'مدیر سیستم',
            email: 'admin@example.com',
            role: 'admin',
            verified: true,
          };
          localStorage.setItem('user', JSON.stringify(admin));
          setCurrentUser(admin);
          toast.success('با موفقیت وارد شدید');
          resolve(admin);
        } else {
          toast.error('ایمیل یا رمز عبور اشتباه است');
          reject(new Error('ایمیل یا رمز عبور اشتباه است'));
        }
      }, 1000);
    });
  };

  // Register function
  const register = (name, email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = {
          id: Date.now().toString(),
          name,
          email,
          role: 'user',
          verified: false,
        };
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        toast.success('ثبت‌نام با موفقیت انجام شد');
        resolve(user);
      }, 1000);
    });
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    toast.info('از حساب کاربری خود خارج شدید');
  };

  // Update profile function
  const updateProfile = (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        toast.success('پروفایل با موفقیت به‌روزرسانی شد');
        resolve(updatedUser);
      }, 1000);
    });
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    updateProfile,
    isAdmin: currentUser?.role === 'admin',
    isVerified: currentUser?.verified,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
