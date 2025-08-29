import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  makeAdmin: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const auth = getAuth();
  const functions = getFunctions();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Check if user is admin by looking up their role in Firestore
        try {
          console.log('Firebase Auth user:', user.email, user.uid);
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('Firestore user data:', userData);
            setIsAdmin(userData.role === 'ROLE_ADMIN');
          } else {
            // Try to find user by email in Firestore
            console.log('User not found by UID, trying to find by email...');
            // For now, let's check if the email matches our admin user
            if (user.email === 'admin@example.com') {
              console.log('Found admin user by email');
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          setIsAdmin(false);
        }
      } else {
        // TEMPORARY: For testing, allow admin access without login
        // Remove this in production
        console.log('No Firebase Auth user, checking for temporary admin access...');
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('admin') === 'true') {
          console.log('Temporary admin access granted via URL parameter');
          setIsAdmin(true);
      } else {
        setIsAdmin(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const makeAdmin = async (userId: string) => {
    try {
      const setAdminRole = httpsCallable(functions, 'setAdminRole');
      await setAdminRole({ userId });
      // Refresh the user's token to get updated claims
      if (user) {
        await user.getIdToken(true);
      }
    } catch (error) {
      console.error('Error making user admin:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAdmin,
    signIn,
    signOut,
    makeAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};