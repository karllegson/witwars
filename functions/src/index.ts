import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * Cloud Function to remove a friend connection between two users
 */
export const removeFriend = functions.https.onCall(async (data: any, context: any) => {
  // Ensure the user is authenticated
  if (!context || !context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated", 
      "User must be logged in"
    );
  }

  try {
    // Get the user IDs from the request data
    const { userA, userB } = data;
    if (typeof userA !== 'string' || typeof userB !== 'string') {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing or invalid user IDs"
      );
    }
    
    // Validate the data
    if (!userA || !userB || typeof userA !== 'string' || typeof userB !== 'string') {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing or invalid user IDs"
      );
    }

    // Verify the caller is userA for security
    if (context.auth.uid !== userA) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Not authorized to remove this friend"
      );
    }

    // Perform the friend removal in Firestore
    const db = admin.firestore();
    await db.runTransaction(async (transaction) => {
      // Remove userB from userA's friends list
      transaction.update(db.doc(`users/${userA}`), {
        friends: admin.firestore.FieldValue.arrayRemove(userB),
      });

      // Remove userA from userB's friends list
      transaction.update(db.doc(`users/${userB}`), {
        friends: admin.firestore.FieldValue.arrayRemove(userA),
      });
    });

    return {success: true};
  } catch (error) {
    console.error("Error removing friend:", error);
    throw new functions.https.HttpsError(
      "internal", 
      "Failed to remove friend"
    );
  }
});