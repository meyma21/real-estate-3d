import { auth } from '../config/firebase';
import { httpsCallable } from 'firebase/functions';
import { getFunctions } from 'firebase/functions';

const functions = getFunctions();
const setAdminRole = httpsCallable(functions, 'setAdminRole');

export const makeUserAdmin = async (userId: string): Promise<void> => {
  try {
    await setAdminRole({ userId });
    console.log('Successfully set admin role for user:', userId);
  } catch (error) {
    console.error('Error setting admin role:', error);
    throw error;
  }
};

export const isUserAdmin = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) return false;
    
    const idTokenResult = await user.getIdTokenResult();
    return idTokenResult.claims.role === 'ADMIN';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}; 