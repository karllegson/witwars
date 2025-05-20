import { db } from '../firebase';
import { 
  collection, 
  doc, 
  query, 
  where, 
  getDocs, 
  writeBatch, 
  arrayRemove,
  increment
} from 'firebase/firestore';

/**
 * Utility function to clean up all data related to a user
 * This can be called from an admin component after deletion from Firebase Auth
 * 
 * @param userId The ID of the user to clean up data for
 * @returns Promise that resolves when cleanup is complete
 */
export const cleanupUserData = async (userId: string): Promise<{success: boolean, message: string}> => {
  // Create separate batches for different operations
  const deleteBatch = writeBatch(db);
  const updateBatch = writeBatch(db);
  
  try {
    console.log(`Cleaning up data for user ${userId}...`);
    
    // 1. Delete all posts created by this user
    const postsRef = collection(db, 'posts');
    const postsQuery = query(postsRef, where('authorId', '==', userId));
    const postsSnapshot = await getDocs(postsQuery);
    
    postsSnapshot.forEach(document => {
      deleteBatch.delete(document.ref);
    });
    console.log(`Found ${postsSnapshot.size} posts to delete`);
    
    // 2. Remove user from other users' friend lists and friend requests
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    usersSnapshot.forEach(document => {
      if (document.id !== userId) {
        const userData = document.data();
        let needsUpdate = false;
        
        // Check if user is in friends list
        if (userData.friends && Array.isArray(userData.friends) && userData.friends.includes(userId)) {
          updateBatch.update(document.ref, {
            friends: arrayRemove(userId)
          });
          needsUpdate = true;
        }
        
        // Check if user is in friend requests
        if (userData.friendRequests && Array.isArray(userData.friendRequests)) {
          const updatedRequests = userData.friendRequests.filter(
            (request: any) => request.fromUserId !== userId && request.toUserId !== userId
          );
          
          if (updatedRequests.length !== userData.friendRequests.length) {
            updateBatch.update(document.ref, { friendRequests: updatedRequests });
            needsUpdate = true;
          }
        }
        
        if (needsUpdate) {
          console.log(`Updating user ${document.id} to remove references to deleted user`);
        }
      }
    });
    
    // 3. Remove likes from posts where this user liked them
    const likedPostsRef = collection(db, 'posts');
    const likedPostsQuery = query(likedPostsRef, where('likedBy', 'array-contains', userId));
    const likedPostsSnapshot = await getDocs(likedPostsQuery);
    
    likedPostsSnapshot.forEach(document => {
      updateBatch.update(document.ref, {
        likedBy: arrayRemove(userId),
        likes: increment(-1)
      });
    });
    console.log(`Found ${likedPostsSnapshot.size} liked posts to update`);
    
    // 4. Delete the user document itself
    deleteBatch.delete(doc(db, 'users', userId));
    
    // Commit all the batch operations - first run updates, then deletes
    await updateBatch.commit();
    await deleteBatch.commit();
    console.log(`Successfully cleaned up all data for user ${userId}`);
    
    return { success: true, message: `Successfully deleted user ${userId} and all associated data` };
  } catch (error) {
    console.error('Error cleaning up user data:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
};

/**
 * Add this function to admin interface or hook it into your authentication flow
 * Example code to use in a component:
 *
 * // After deleting a user from Firebase Auth
 * import { cleanupUserData } from '../utils/userCleanup';
 * 
 * // Then call:
 * await cleanupUserData(deletedUserId);
 */
