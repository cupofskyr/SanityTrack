// FILE: src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// Define the shape of the context data
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This is safe because it's in a 'use client' file.
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Create the provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedInUser = result.user;
      toast({
        title: "Sign-In Successful",
        description: `Welcome back, ${loggedInUser.displayName}!`,
      });
      // Redirect after successful login
      router.push('/dashboard/employee');
    } catch (error) {
      console.error("Error during Google sign-in: ", error);
      toast({
        variant: "destructive",
        title: "Sign-In Failed",
        description: "There was a problem signing in with Google. Please try again.",
      });
    } finally {
      // Loading state is handled by onAuthStateChanged
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      router.push('/login');
    } catch (error) {
      console.error("Error during sign out: ", error);
      toast({
        variant: "destructive",
        title: "Sign-Out Failed",
        description: "There was a problem signing out. Please try again.",
      });
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
