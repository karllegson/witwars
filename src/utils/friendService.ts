import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  friends: string[];
  friendRequests: string[];
  createdAt: string;
}

// Find a user by their username
export const findUserByUsername = async (username: string): Promise<UserProfile | null> => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const userDoc = querySnapshot.docs[0];
  return {
    uid: userDoc.id,
    ...userDoc.data()
  } as UserProfile;
};

// Send a friend request
export const sendFriendRequest = async (fromUserId: string, toUsername: string): Promise<void> => {
  const toUser = await findUserByUsername(toUsername);
  if (!toUser) {
    throw new Error('User not found');
  }
  
  if (toUser.uid === fromUserId) {
    throw new Error('You cannot send a friend request to yourself');
  }

  const toUserRef = doc(db, 'users', toUser.uid);
  await updateDoc(toUserRef, {
    friendRequests: arrayUnion(fromUserId)
  });
};

// Accept a friend request
export const acceptFriendRequest = async (currentUserId: string, fromUserId: string): Promise<void> => {
  // Get both user references
  const currentUserRef = doc(db, 'users', currentUserId);
  const fromUserRef = doc(db, 'users', fromUserId);
  
  // Get current user's document
  const currentUserDoc = await getDoc(currentUserRef);
  if (!currentUserDoc.exists()) {
    throw new Error('Current user not found');
  }
  
  // Get the requesting user's document
  const fromUserDoc = await getDoc(fromUserRef);
  if (!fromUserDoc.exists()) {
    throw new Error('Requesting user not found');
  }

  // Update both users' documents
  await Promise.all([
    // Update current user's document
    updateDoc(currentUserRef, {
      friends: arrayUnion(fromUserId),
      friendRequests: arrayRemove(fromUserId)
    }),
    // Update the other user's document
    updateDoc(fromUserRef, {
      friends: arrayUnion(currentUserId)
    })
  ]);
};

// Get all friend requests for a user
export const getFriendRequests = async (userId: string): Promise<UserProfile[]> => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }
  
  const userData = userDoc.data() as UserProfile;
  const friendRequests = userData.friendRequests || [];
  
  if (friendRequests.length === 0) {
    return [];
  }

  // Batch get all friend request users
  const q = query(collection(db, 'users'), where('__name__', 'in', friendRequests));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
  })) as UserProfile[];
};

// Get all friends for a user
export const getFriends = async (userId: string): Promise<UserProfile[]> => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }
  
  const userData = userDoc.data() as UserProfile;
  const friends = userData.friends || [];
  
  if (friends.length === 0) {
    return [];
  }

  // Batch get all friend users
  const q = query(collection(db, 'users'), where('__name__', 'in', friends));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
  })) as UserProfile[];
};
