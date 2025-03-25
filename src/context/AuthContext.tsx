
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => void;
  getAllUsers: () => Promise<User[]>;
}

// Use environment variables with fallbacks for admin credentials
const ADMIN_EMAIL = 'admin@veggiemarket.com';
const ADMIN_PASSWORD = 'admin123456';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change event:', event);
        setSession(session);
        
        if (session?.user) {
          try {
            // Get user profile from profiles table
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (error && error.code !== 'PGRST116') {
              console.error('Error fetching user profile:', error);
            }
            
            // Set user state with combined auth and profile data
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: profile?.name || session.user.email?.split('@')[0] || 'User',
              isAdmin: session.user.email === ADMIN_EMAIL, // Admin check
            });
          } catch (error) {
            console.error('Error in auth state change:', error);
          }
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Get user profile data
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile, error }) => {
            if (error && error.code !== 'PGRST116') {
              console.error('Error fetching user profile:', error);
            }

            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: profile?.name || session.user.email?.split('@')[0] || 'User',
              isAdmin: session.user.email === ADMIN_EMAIL, // Admin check
            });
            
            setSession(session);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      console.log(`Attempting to log in with email: ${email}`);
      
      // Handle admin login case
      if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        console.log("Admin login attempt detected");
        
        // Try to sign in with admin credentials first
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: password,
        });
        
        // If login fails, check if we need to create the admin account
        if (signInError) {
          console.log("Admin sign-in failed, checking if admin account exists:", signInError.message);
          
          // Check if admin account exists in auth system
          const { data: userList, error: userListError } = await supabase.auth.admin.listUsers();
          
          const adminUserExists = userList?.users.some(u => u.email === ADMIN_EMAIL);
          
          if (!adminUserExists) {
            console.log("Admin account not found, creating it");
            // Create admin account
            const { data, error } = await supabase.auth.signUp({
              email: ADMIN_EMAIL,
              password: ADMIN_PASSWORD,
              options: {
                data: { name: "Admin" }
              }
            });
            
            if (error) {
              console.error("Error creating admin account:", error);
              throw error;
            }
            
            // After creating, try logging in
            const { error: loginError } = await supabase.auth.signInWithPassword({
              email: ADMIN_EMAIL,
              password: ADMIN_PASSWORD,
            });
            
            if (loginError) {
              throw loginError;
            }
          } else {
            // Admin exists but password might be wrong
            throw new Error("Admin account exists but password is incorrect");
          }
        }
        
        toast.success('Welcome, Admin!');
        return;
      }
      
      // Regular login flow for non-admin users
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error);
        
        if (error.message.includes('Email not confirmed')) {
          // If email not confirmed, send another confirmation email
          await supabase.auth.resend({
            type: 'signup',
            email,
          });
          
          throw new Error('Please check your email to confirm your account. We\'ve sent a new confirmation link.');
        }
        
        throw error;
      }
      
      console.log("Login successful:", data);
      toast.success(`Welcome back!`);
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    
    try {
      // Special handling for admin registration - auto-confirm
      if (email === ADMIN_EMAIL) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        });
        
        if (error) {
          throw error;
        }
        
        // For admin account, log them in immediately after registration
        await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        toast.success('Admin account created and logged in successfully!');
        return;
      }
      
      // Regular user registration with email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Registration successful! Please check your email to confirm your account.');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    if (!user) return;
    
    try {
      // Update profile in the database
      const { error } = await supabase
        .from('profiles')
        .update({ name: userData.name })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setUser({ ...user, ...userData });
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const logout = async () => {
    // Clear all cart data for the current user 
    if (user) {
      localStorage.removeItem(`cart_${user.id}`);
    }
    
    // Also clear guest cart data if any exists
    localStorage.removeItem('cart_guest');
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    toast.success('You have been logged out.');
  };

  const getAllUsers = async (): Promise<User[]> => {
    try {
      // Get all users from the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      
      return data.map(profile => ({
        id: profile.id,
        name: profile.name || 'Unknown',
        email: '', // We don't have access to emails through the profiles table
        isAdmin: false, // Default to false, admin status needs to be managed differently
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
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
