"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAdminRole = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
exports.setAdminRole = functions.https.onCall(async (request) => {
    // Check if the request is authenticated
    if (!request.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    try {
        const { userId } = request.data;
        // Set custom claims for the user
        await admin.auth().setCustomUserClaims(userId, {
            role: 'admin'
        });
        return { message: 'Admin role set successfully' };
    }
    catch (error) {
        throw new functions.https.HttpsError('internal', 'Error setting admin role', error);
    }
});
//# sourceMappingURL=index.js.map