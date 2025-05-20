import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Get the user ID of the top-ranked user based on votes
 */
export const getTopRankedUserId = async (): Promise<string | null> => {
  try {
    const q = query(
      collection(db, 'users'),
      orderBy('votes', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.log('No users found in ranking query');
      return null;
    }
    
    // Log ranking information for debugging
    querySnapshot.docs.forEach((doc, index) => {
      if (index < 3) { // Only log top 3 for brevity
        console.log(`Rank #${index + 1}: User ID ${doc.id}, Username: ${doc.data().username}, Votes: ${doc.data().votes}`);
      }
    });
    
    // Return the ID of the user with the most votes
    const topUserId = querySnapshot.docs[0].id;
    console.log('Top ranked user ID:', topUserId);
    return topUserId;
  } catch (error) {
    console.error('Error getting top ranked user:', error);
    return null;
  }
};

/**
 * Check if a user is the top ranked user
 */
export const isTopRankedUser = async (userId: string): Promise<boolean> => {
  try {
    const topRankedId = await getTopRankedUserId();
    return topRankedId === userId;
  } catch (error) {
    console.error('Error checking if user is top ranked:', error);
    return false;
  }
};
