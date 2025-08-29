import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';

// Function to set admin role for a user
export const makeUserAdmin = async (userId: string) => {
  try {
    const functions = getFunctions();
    const setAdminRole = httpsCallable(functions, 'setAdminRole');
    
    const result = await setAdminRole({ userId });
    console.log('Admin role set successfully:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error setting admin role:', error);
    throw error;
  }
};

// Function to check if current user is admin
export const isUserAdmin = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      return false;
    }

    // Get the ID token to check custom claims
    const idTokenResult = await user.getIdTokenResult();
    return idTokenResult.claims.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}; 