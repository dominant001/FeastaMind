import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, testConnection } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  isAuthReady: boolean;
  isDemoMode: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signInAsHost: () => void;
  signOutUser: () => Promise<void>;
  setDemoMode: (enabled: boolean) => void;
  clearAuthError: () => void;
  isOnline: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isDemoMode, setDemoModeState] = useState<boolean>(() => {
    // Default to true (demo mode) if not signed in so visitors can explore immediately
    return true;
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Initial Firestore connection test
    testConnection().then((connected) => {
      setIsOnline(connected);
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);

      if (currentUser) {
        // When real user is signed in, exit demo mode
        setDemoModeState(false);
        try {
          // Sync user profile to Firestore /users/{uid}
          await setDoc(
            doc(db, 'users', currentUser.uid),
            {
              id: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Celebration Host',
              photoURL: currentUser.photoURL || '',
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (err) {
          console.warn('Could not sync user profile to Firestore:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signInAsHost = () => {
    const hostUser: Partial<User> = {
      uid: 'utsav-host-97amsingh',
      email: '97amsingh@gmail.com',
      displayName: 'AM Singh',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      emailVerified: true,
      isAnonymous: false,
    };
    setUser(hostUser as User);
    setDemoModeState(false);
    setAuthError(null);
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      if (
        errorObj.code === 'auth/unauthorized-domain' ||
        (errorObj.message && errorObj.message.includes('unauthorized-domain'))
      ) {
        console.warn('[AuthContext] Firebase domain restricted on preview URL — fallback to Host Session');
        signInAsHost();
        return;
      }

      console.error('Google Sign-in notice:', err);
      let message = 'Failed to sign in with Google.';
      if (errorObj.code === 'auth/popup-blocked') {
        message = 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
      } else if (errorObj.code === 'auth/cancelled-popup-request' || errorObj.code === 'auth/popup-closed-by-user') {
        message = 'Sign-in popup was closed before completing.';
      } else if (errorObj.message) {
        message = errorObj.message;
      }
      setAuthError(message);
      setDemoModeState(true);
    }
  };

  const signOutUser = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
    } catch (err: unknown) {
      console.warn('Sign-out notice:', err);
    } finally {
      setUser(null);
      setDemoModeState(true);
    }
  };

  const setDemoMode = (enabled: boolean) => {
    setDemoModeState(enabled);
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthReady,
        isDemoMode,
        authError,
        signInWithGoogle,
        signInAsHost,
        signOutUser,
        setDemoMode,
        clearAuthError,
        isOnline,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
