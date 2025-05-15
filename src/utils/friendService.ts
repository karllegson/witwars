import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "../firebase";

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
  const normalized = username.trim().toLowerCase();
  const q = query(usersRef, where('username', '==', normalized));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const userDoc = querySnapshot.docs[0];
  return {
    uid: userDoc.id,
    ...userDoc.data()
  } as UserProfile;
};

// Send a friend request
export const sendFriendRequest = async (fromUserId: string, toUsername: string): Promise<void> => {
  const normalizedUsername = toUsername.trim().toLowerCase();
  const toUser = await findUserByUsername(normalizedUsername);
  if (!toUser) throw new Error('User not found');
  if (toUser.uid === fromUserId) throw new Error('You cannot send a friend request to yourself');

  // Get both user docs
  const [fromUserDocSnap, toUserDocSnap] = await Promise.all([
    getDoc(doc(db, 'users', fromUserId)),
    getDoc(doc(db, 'users', toUser.uid)),
  ]);
  if (!fromUserDocSnap.exists() || !toUserDocSnap.exists()) throw new Error('User document missing');
  const fromUser = fromUserDocSnap.data() as UserProfile;
  const toUserData = toUserDocSnap.data() as UserProfile;

  // Already friends?
  if ((fromUser.friends || []).includes(toUser.uid)) throw new Error('You are already friends with this user');
  // Already requested?
  if ((toUserData.friendRequests || []).includes(fromUserId)) throw new Error('Friend request already sent');
  // Already received a request from them?
  if ((fromUser.friendRequests || []).includes(toUser.uid)) throw new Error('This user has already sent you a friend request; check your requests!');

  // All clear, send request
  await updateDoc(doc(db, 'users', toUser.uid), {
    friendRequests: arrayUnion(fromUserId)
  });
};

// Remove a friend directly using Firestore (no Cloud Function)
export const removeFriendTwoSided = async (friendUid: string): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");
  
  try {
    // Get references to both user documents
    const currentUserRef = doc(db, 'users', currentUser.uid);
    const friendUserRef = doc(db, 'users', friendUid);
    
    // Remove the friend from the current user's friends list
    await updateDoc(currentUserRef, {
      friends: arrayRemove(friendUid)
    });
    
    // Remove the current user from the friend's friends list
    await updateDoc(friendUserRef, {
      friends: arrayRemove(currentUser.uid)
    });
    
    console.log('Friend removed successfully');
  } catch (error) {
    console.error('Error removing friend:', error);
    throw new Error("Failed to remove friend. Please try again.");
  }
};

// Accept a friend request
export const acceptFriendRequest = async (currentUserId: string, fromUserId: string): Promise<void> => {
  const currentUserRef = doc(db, 'users', currentUserId);
  const fromUserRef = doc(db, 'users', fromUserId);
  const currentUserDoc = await getDoc(currentUserRef);
  if (!currentUserDoc.exists()) throw new Error('User not found');
  const currentUserData = currentUserDoc.data() as UserProfile;
  await updateDoc(currentUserRef, {
    friendRequests: (currentUserData.friendRequests || []).filter((id: string) => id !== fromUserId),
    friends: arrayUnion(fromUserId),
  });
  await updateDoc(fromUserRef, {
    friends: arrayUnion(currentUserId),
  });
};

// Decline a friend request
export const declineFriendRequest = async (currentUserId: string, fromUserId: string): Promise<void> => {
  const currentUserRef = doc(db, 'users', currentUserId);
  const currentUserDoc = await getDoc(currentUserRef);
  if (!currentUserDoc.exists()) throw new Error('User not found');
  const currentUserData = currentUserDoc.data() as UserProfile;
  await updateDoc(currentUserRef, {
    friendRequests: (currentUserData.friendRequests || []).filter((id: string) => id !== fromUserId),
  });
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

// Wrapper function that matches the parameter signature used in Friends.tsx
export const removeFriend = async (currentUserId: string, friendUid: string): Promise<void> => {
  // We only need the friendUid for the Cloud Function call
  // currentUserId is verified inside the removeFriendTwoSided function
  return removeFriendTwoSided(friendUid);
};
