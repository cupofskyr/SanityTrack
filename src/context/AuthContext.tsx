
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, updateProfile, FacebookAuthProvider } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: (role: 'Business Owner' | 'Health Official') => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signUpWithEmailAndPassword: (email: string, password: string, fullName: string, role: 'Business Owner' | 'Health Official') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

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

  const handleSuccessfulAuth = async (user: User, role: 'Business Owner' | 'Health Official' | 'Manager' | 'Employee', isNewUser: boolean) => {
    sessionStorage.setItem('userRole', role);
    if (isNewUser) {
        sessionStorage.setItem('isNewUser', 'true');
        // Do not automatically show the policy modal here, let the layout handle it
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

    // Always clear the policy acceptance on a new sign-in/sign-up
    sessionStorage.removeItem('leifur-ai-policy-accepted');

    if (role === 'Business Owner') {
        router.push('/dashboard/owner');
    } else if (role === 'Health Department') {
        router.push('/dashboard/health-department');
    } else if (role === 'Manager') {
        router.push('/dashboard/manager');
    } else {
        router.push('/dashboard/employee');
    }
  };

  const signInWithGoogle = async (role: 'Business Owner' | 'Health Official') => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            role: role,
            createdAt: new Date(),
        });
        await handleSuccessfulAuth(user, role, true);
      } else {
        // Existing user, use the role from their document, not the one passed in.
        const existingUserRole = userDoc.data().role;
        await handleSuccessfulAuth(user, existingUserRole, false);
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
        if (!fullName.trim()) throw new Error("Full name is required.");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullName });
        const user = userCredential.user;

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
      router.push('/');
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
