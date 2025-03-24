import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => void;
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@veggiemarket.com',
    name: 'Admin User',
    password: 'admin123',
    isAdmin: true,
  },
  {
    id: '2',
    email: 'user@example.com',
    name: 'Regular User',
    password: 'user123',
    isAdmin: false,
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as User;
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    // Simulate API call latency
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      // Find user in mock data
      const foundUser = MOCK_USERS.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      // Omit password before saving to state
      const { password: _, ...userWithoutPassword } = foundUser;
      
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      toast.success(`Welcome back, ${foundUser.name}!`);
    } catch (error) {
      toast.error((error as Error).message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    
    // Simulate API call latency
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      // Check if user already exists
      if (MOCK_USERS.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('User with this email already exists');
      }
      
      // In a real app, we would make an API call to register the user
      // For demo purposes, we'll just create a new user object
      const newUser = {
        id: `${MOCK_USERS.length + 1}`,
        email,
        name,
        password,
        isAdmin: false,
      };
      
      // Add the new user to MOCK_USERS array for admin panel display
      MOCK_USERS.push(newUser);
      
      // Omit password before saving to state
      const { password: _, ...userWithoutPassword } = newUser;
      
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      toast.success('Registration successful! Welcome aboard.');
    } catch (error) {
      toast.error((error as Error).message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    toast.success('Profile updated successfully!');
  };

  const logout = () => {
    // Clear all cart data for the current user 
    if (user) {
      localStorage.removeItem(`cart_${user.id}`);
    }
    
    // Also clear guest cart data if any exists
    localStorage.removeItem('cart_guest');
    
    setUser(null);
    localStorage.removeItem('user');
    toast.success('You have been logged out.');
  };

  const getAllUsers = () => {
    // Return users without passwords
    return MOCK_USERS.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUserProfile,
        getAllUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
