const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

/**
 * Cloud Function that automatically runs when a user is deleted from Firebase Authentication
 * Cleans up all related user data:
 * - Deletes the user document
 * - Deletes all posts created by the user
 * - Updates posts where the user had liked them
 * - Removes the user from other users' friends lists
 * - Removes friend requests involving the user
 */
exports.onUserDeleted = functions.auth.user().onDelete(async (user) => {
  const db = admin.firestore();
  const batch = db.batch();
  const userId = user.uid;
  
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
            (request) => request.fromUserId !== userId && request.toUserId !== userId
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
