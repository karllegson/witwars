import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

interface RemoveFriendData {
  userA: string;
  userB: string;
}

// Set up CORS for the Cloud Function
export const removeFriend = functions.https.onCall((data: any, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
  }
  
  // Extract data from the request
  const userA = data.userA;
  const userB = data.userB;
  
  // Verify the caller is userA for security
  if (context.auth.uid !== userA) {
    throw new functions.https.HttpsError("permission-denied", "Not authorized to remove this friend");
  }
  
  // Perform the friend removal in Firestore
  return admin.firestore().runTransaction(async (transaction) => {
    // Remove userB from userA's friends list
    transaction.update(admin.firestore().doc(`users/${userA}`), {
      friends: admin.firestore.FieldValue.arrayRemove(userB)
    });
    
    // Remove userA from userB's friends list
    transaction.update(admin.firestore().doc(`users/${userB}`), {
      friends: admin.firestore.FieldValue.arrayRemove(userA)
    });
    
    return { success: true };
  }).catch(error => {
    console.error("Error removing friend:", error);
    throw new functions.https.HttpsError("internal", "Failed to remove friend");
  });
}
);