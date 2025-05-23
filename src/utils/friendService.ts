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

import { auth } from "../firebase";

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  friends: string[];
  friendRequests: string[];
  createdAt: string;
  votes?: number;
  profilePicture?: string; // URL to profile picture
  bio?: string;
  location?: string; // e.g., "City, State"
  lastUsernameChange?: number; // timestamp in ms
}

// Update username with 24h cooldown
export const setUsernameWithCooldown = async (userId: string, newUsername: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error('User not found');
  const user = userSnap.data() as UserProfile;
  const now = Date.now();
  if (user.lastUsernameChange && now - user.lastUsernameChange < 24 * 60 * 60 * 1000) {
    throw new Error('You can only change your username once every 24 hours.');
  }
  await updateDoc(userRef, {
    username: newUsername,
    lastUsernameChange: now
  });
};

// Update profile picture URL
export const setProfilePictureUrl = async (userId: string, url: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { profilePicture: url });
};

// Update profile picture options as a stringified JSON
export const setProfilePicture = async (userId: string, options: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { profilePicture: options });
};

// Update bio
export const setBio = async (userId: string, bio: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { bio });
};

// Update location
export const setLocation = async (userId: string, location: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { location });
};

// Get all users sorted by votes descending
// If minimumVotes parameter is provided, only users with at least that many votes are returned
export const getAllUsersByVotes = async (minimumVotes: number = 1): Promise<UserProfile[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef);
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return [];
    }
    
    const users = querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as UserProfile[];
    
    // Filter by minimum votes if required
    const filteredUsers = minimumVotes > 0 
      ? users.filter(user => (user.votes ?? 0) >= minimumVotes)
      : users;
      
    // Sort by votes descending, defaulting to 0
    filteredUsers.sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));
    return filteredUsers;
  } catch (error) {
    console.error('Error fetching ranked users:', error);
    return []; // Return empty array on error
  }
};

// Increment the votes field for a user
export const incrementVotes = async (userId: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    votes: (await getDoc(userRef)).data()?.votes ? (await getDoc(userRef)).data()?.votes + 1 : 1
  });
};

// Find a user by their username
export const findUserByUsername = async (username: string): Promise<UserProfile | null> => {
  try {
    // First try an exact case-sensitive match
    const usersRef = collection(db, 'users');
    const trimmed = username.trim();
    let q = query(usersRef, where('username', '==', trimmed));
    let querySnapshot = await getDocs(q);
    
    // If no results, try case-insensitive search by getting all users and filtering
    if (querySnapshot.empty) {
      console.log('No exact match found, trying case-insensitive search');
      q = query(usersRef);
      querySnapshot = await getDocs(q);
      
      // Manual case-insensitive filtering
      const matchingDocs = querySnapshot.docs.filter(doc => {
        const userData = doc.data();
        return userData.username && 
               userData.username.toLowerCase() === trimmed.toLowerCase();
      });
      
      if (matchingDocs.length === 0) {
        console.log('No user found with username:', trimmed);
        return null;
      }
      
      const userDoc = matchingDocs[0];
      return {
        uid: userDoc.id,
        ...userDoc.data()
      } as UserProfile;
    }
    
    // Return the exact match
    const userDoc = querySnapshot.docs[0];
    return {
      uid: userDoc.id,
      ...userDoc.data()
    } as UserProfile;
  } catch (error) {
    console.error('Error finding user by username:', error);
    return null;
  }
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
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");
  if (currentUser.uid !== currentUserId) throw new Error("User ID mismatch");
  
  try {
    // Get references to both user documents
    const currentUserRef = doc(db, 'users', currentUserId);
    const friendUserRef = doc(db, 'users', friendUid);
    
    // Remove the friend from the current user's friends list
    await updateDoc(currentUserRef, {
      friends: arrayRemove(friendUid)
    });
    
    // Remove the current user from the friend's friends list
    await updateDoc(friendUserRef, {
      friends: arrayRemove(currentUserId)
    });
    
    console.log('Friend removed successfully');
  } catch (error) {
    console.error('Error removing friend:', error);
    throw new Error("Failed to remove friend. Please try again.");
  }
};
