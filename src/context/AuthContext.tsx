'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User as AuthUser, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { getFirestore, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

// This interface merges Firebase Auth User with our custom Firestore data
export interface AppUser extends AuthUser {
  role?: 'employee' | 'manager' | 'owner' | 'Health Department' | null;
  locationId?: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: (role: 'Business Owner' | 'Health Official') => Promise<void>;
  signUpWithEmailAndPassword: (email: string, password: string, fullName: string, role: 'Business Owner' | 'Health Official') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        // User is signed in, now get their custom data from Firestore
        const userDocRef = doc(db, 'users', authUser.uid);
        const unsubDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const firestoreData = docSnap.data();
            // Combine authUser with Firestore data
            const appUser: AppUser = {
              ...authUser,
              role: firestoreData.role,
              locationId: firestoreData.locationId,
            };
            setUser(appUser);
            sessionStorage.setItem('userRole', firestoreData.role);
          } else {
             // This case might happen briefly after user creation before the trigger runs
            setUser(authUser as AppUser); // Store basic auth user for now
          }
          setLoading(false);
        });
        return () => unsubDoc();
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSuccessfulAuth = async (user: AuthUser, role: 'Business Owner' | 'Health Department' | 'Manager' | 'Employee', isNewUser: boolean) => {
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

    // Always clear the policy acceptance on a new sign-in/sign-up
    sessionStorage.removeItem('leifur-ai-policy-accepted');

    if (role === 'Business Owner' || role === 'owner') {
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

      const determinedRole = userDoc.exists() ? userDoc.data().role : (role === 'Health Official' ? 'Health Department' : 'owner');

      if (!userDoc.exists()) {
        // The onUserCreate trigger will handle seeding the DB, but we do it here too for immediate UI consistency
        await setDoc(userDocRef, {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            role: determinedRole,
            createdAt: new Date(),
        });
        await handleSuccessfulAuth(user, determinedRole, true);
      } else {
        await handleSuccessfulAuth(user, determinedRole, false);
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

  const signUpWithEmailAndPassword = async (email: string, password: string, fullName: string, role: 'Business Owner' | 'Health Official') => {
    setLoading(true);
    try {
        if (!fullName.trim()) throw new Error("Full name is required.");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullName });
        const user = userCredential.user;
        const userRole = role === 'Health Official' ? 'Health Department' : 'owner';

        // The onUserCreate trigger handles this, but we can do it here to speed up UI
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            displayName: fullName,
            email: user.email,
            role: userRole,
            createdAt: new Date(),
        });

        await handleSuccessfulAuth(user, userRole, true);
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
