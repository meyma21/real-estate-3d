import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

interface SetAdminRoleData {
  userId: string;
}

export const setAdminRole = functions.https.onCall(async (request) => {
  // Check if the request is authenticated
  if (!request.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  try {
    const { userId } = request.data as SetAdminRoleData;
    
    // Set custom claims for the user
    await admin.auth().setCustomUserClaims(userId, {
      role: 'admin'
    });

    return { message: 'Admin role set successfully' };
  } catch (error) {
    throw new functions.https.HttpsError(
      'internal',
      'Error setting admin role',
      error
    );
  }
}); 