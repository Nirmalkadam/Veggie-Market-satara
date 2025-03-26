
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
      
      // First try standard login for all users
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // If login succeeds, we're done
      if (!error) {
        console.log("Login successful:", data);
        toast.success(`Welcome back!`);
        setLoading(false);
        return;
      }
      
      // If login fails and it's admin, check if we need to create the admin account
      const isAdminAttempt = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      
      if (isAdminAttempt && error.message.includes('Invalid login credentials')) {
        console.log("Admin login failed, checking if admin exists");
        
        // Check for existing admin users using email instead of name
        const { count, error: countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('name', 'Admin');
        
        if (countError) {
          console.error("Error checking for admin:", countError);
          setLoading(false);
          throw error; // Use original error
        }
        
        if (count === 0) {
          console.log("Admin account doesn't exist, creating it");
          
          // Create admin account
          const { data, error: signUpError } = await supabase.auth.signUp({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            options: {
              data: { name: "Admin" }
            }
          });
          
          if (signUpError) {
            console.error("Error creating admin account:", signUpError);
            setLoading(false);
            throw signUpError;
          }
          
          // Log in with the newly created admin account
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
          });
          
          if (loginError) {
            setLoading(false);
            throw loginError;
          }
          
          toast.success('Welcome, Admin!');
          setLoading(false);
          return;
        } else {
          // Admin exists but password might be wrong
          toast.error("Admin account exists but password is incorrect");
          setLoading(false);
          throw new Error("Admin account exists but password is incorrect");
        }
      }
      
      // Handle other error cases
      if (error.message.includes('Email not confirmed')) {
        // If email not confirmed, send another confirmation email
        await supabase.auth.resend({
          type: 'signup',
          email,
        });
        
        setLoading(false);
        throw new Error('Please check your email to confirm your account. We\'ve sent a new confirmation link.');
      }
      
      // For any other errors, just throw the original error
      setLoading(false);
      throw error;
      
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || 'Login failed');
      setLoading(false);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    
    try {
      // Check if user is trying to register with admin email
      if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        // First check if admin already exists
        const { data: userData } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password,
        });
        
        if (userData.user) {
          toast.error('Admin account already exists. Please login instead.');
          setLoading(false);
          throw new Error('Admin account already exists');
        }
        
        // If admin doesn't exist, create and auto-login
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: "Admin" },
          },
        });
        
        if (error) {
          setLoading(false);
          throw error;
        }
        
        // For admin account, log them in immediately
        await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        toast.success('Admin account created and logged in successfully!');
        setLoading(false);
        return;
      }
      
      // Regular user registration with email confirmation
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });
      
      if (error) {
        setLoading(false);
        throw error;
      }
      
      toast.success('Registration successful! Please check your email to confirm your account.');
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      setLoading(false);
      throw error;
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
