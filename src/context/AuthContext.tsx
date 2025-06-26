
// FILE: src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, updateProfile, FacebookAuthProvider } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Define the shape of the context data
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: (role: 'Business Owner' | 'Health Official') => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signUpWithEmailAndPassword: (email: string, password: string, fullName: string, role: 'Business Owner' | 'Health Official') => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Create the provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSuccessfulAuth = async (user: User, role: 'Business Owner' | 'Health Official', isNewUser: boolean) => {
    sessionStorage.setItem('userRole', role);
    if (isNewUser) {
        sessionStorage.setItem('isNewUser', 'true');
        toast({
            title: "Account Created!",
            description: "Welcome! Let's get you set up.",
        });
    } else {
        toast({
            title: "Sign-In Successful",
            description: `Welcome back, ${user.displayName}!`,
        });
    }

    // Redirect to the correct dashboard, which will handle the onboarding modal if needed
    if (role === 'Business Owner') {
        router.push('/dashboard/owner');
    } else {
        router.push('/dashboard/health-department');
    }
  };

  const signInWithGoogle = async (role: 'Business Owner' | 'Health Official') => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user is new
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        // New user, create their doc
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            role: role,
            createdAt: new Date(),
        });
        await handleSuccessfulAuth(user, role, true);
      } else {
        // Existing user
        await handleSuccessfulAuth(user, userDoc.data().role, false);
      }
    } catch (error: any) {
      console.error("Error during Google sign-in: ", error);
      toast({
        variant: "destructive",
        title: "Sign-In Failed",
        description: error.message || "There was a problem signing in with Google.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const signInWithFacebook = async () => {
    toast({
        variant: "default",
        title: "Feature Not Implemented",
        description: "Facebook Sign-In requires developer setup and is currently a placeholder.",
    });
  }

  const signUpWithEmailAndPassword = async (email: string, password: string, fullName: string, role: 'Business Owner' | 'Health Official') => {
    setLoading(true);
    try {
        if (!fullName.trim()) {
            throw new Error("Full name is required.");
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullName });
        const user = userCredential.user;

        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            displayName: fullName,
            email: user.email,
            role: role,
            createdAt: new Date(),
        });

        await handleSuccessfulAuth(user, role, true);
    } catch (error: any) {
        console.error("Error during Email/Password sign-up: ", error);
        toast({
            variant: "destructive",
            title: "Sign-Up Failed",
            description: error.message || "Could not create your account.",
        });
    } finally {
        setLoading(false);
    }
  };


  const logout = async () => {
    try {
      await signOut(auth);
      sessionStorage.clear();
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
    signInWithFacebook,
    signUpWithEmailAndPassword,
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

    