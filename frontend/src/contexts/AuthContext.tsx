import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthService, SignUpData, SignInData } from '../services/auth.service';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// User type definition (matches shared/types/user.ts)
export interface User {
  userId: string;
  email: string;
  displayName: string;
  role: 'attorney' | 'paralegal';
  createdAt: Date | string;
  lastLoginAt: Date | string;
}

interface AuthContextType {
  // User state
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  error: string | null;

  // Auth methods
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;

  // Helper methods
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch user profile from Firestore
   */
  const fetchUserProfile = async (firebaseUser: FirebaseUser) => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserProfile({
          userId: firebaseUser.uid,
          email: data.email || firebaseUser.email || '',
          displayName: data.displayName || firebaseUser.displayName || '',
          role: data.role || 'paralegal',
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
        });
      } else {
        // User document doesn't exist yet (might be creating)
        // Set a temporary profile from Firebase Auth data
        setUserProfile({
          userId: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          role: 'paralegal', // Default role
          createdAt: new Date(),
          lastLoginAt: new Date(),
        });
      }
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile');
    }
  };

  /**
   * Refresh user profile from Firestore
   */
  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user);
    }
  };

  /**
   * Subscribe to auth state changes
   */
  useEffect(() => {
    setLoading(true);
    const unsubscribe = AuthService.onAuthStateChanged(
      async (firebaseUser) => {
        setUser(firebaseUser);
        setError(null);

        if (firebaseUser) {
          // Fetch user profile from Firestore
          await fetchUserProfile(firebaseUser);
        } else {
          setUserProfile(null);
        }

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /**
   * Sign up handler
   */
  const signUp = async (data: SignUpData) => {
    try {
      setError(null);
      setLoading(true);
      await AuthService.signUp(data);
      // Auth state change will be handled by onAuthStateChanged
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in handler
   */
  const signIn = async (data: SignInData) => {
    try {
      setError(null);
      setLoading(true);
      await AuthService.signIn(data);
      // Auth state change will be handled by onAuthStateChanged
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Google sign in handler
   */
  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      await AuthService.signInWithGoogle();
      // Auth state change will be handled by onAuthStateChanged
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out handler
   */
  const signOut = async () => {
    try {
      setError(null);
      setLoading(true);
      await AuthService.signOut();
      setUser(null);
      setUserProfile(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

