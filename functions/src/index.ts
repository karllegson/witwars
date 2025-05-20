import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * Cloud Function that triggers when a user is deleted from Firebase Authentication
 * and automatically deletes all associated user data from Firestore
 */
export const onUserDeleted = functions.auth.user().onDelete(async (user) => {
  const db = admin.firestore();
  const userId = user.uid;
  const batch = db.batch();
  
  try {
    console.log(`User ${userId} deleted, cleaning up associated data...`);
    
    // 1. Delete all posts created by this user
    const postsSnapshot = await db.collection('posts')
      .where('authorId', '==', userId)
      .get();
    
    postsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    console.log(`Found ${postsSnapshot.size} posts to delete`);
    
    // 2. Remove user from other users' friend lists and friend requests
    const usersSnapshot = await db.collection('users').get();
    
    usersSnapshot.forEach(doc => {
      if (doc.id !== userId) {
        const userData = doc.data();
        let needsUpdate = false;
        
        // Check if user is in friends list
        if (userData.friends && Array.isArray(userData.friends) && userData.friends.includes(userId)) {
          batch.update(doc.ref, {
            friends: admin.firestore.FieldValue.arrayRemove(userId)
          });
          needsUpdate = true;
        }
        
        // Check if user is in friend requests
        if (userData.friendRequests && Array.isArray(userData.friendRequests)) {
          const updatedRequests = userData.friendRequests.filter(
            (request: any) => request.fromUserId !== userId && request.toUserId !== userId
          );
          
          if (updatedRequests.length !== userData.friendRequests.length) {
            batch.update(doc.ref, { friendRequests: updatedRequests });
            needsUpdate = true;
          }
        }
        
        if (needsUpdate) {
          console.log(`Updating user ${doc.id} to remove references to deleted user`);
        }
      }
    });
    
    // 3. Remove likes from posts where this user liked them
    const likedPostsSnapshot = await db.collection('posts')
      .where('likedBy', 'array-contains', userId)
      .get();
    
    likedPostsSnapshot.forEach(doc => {
      batch.update(doc.ref, {
        likedBy: admin.firestore.FieldValue.arrayRemove(userId),
        likes: admin.firestore.FieldValue.increment(-1)
      });
    });
    console.log(`Found ${likedPostsSnapshot.size} liked posts to update`);
    
    // 4. Delete the user document itself
    batch.delete(db.doc(`users/${userId}`));
    
    // Commit all the batch operations
    await batch.commit();
    console.log(`Successfully cleaned up all data for user ${userId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error cleaning up user data:', error);
    return { success: false, error: error };
  }
});

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