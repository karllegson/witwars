import AsyncStorage from '@react-native-async-storage/async-storage';
import { Person } from '@/types/person';
import { Post } from '@/types/post';

// Storage keys
const LEADERBOARD_KEY = '@witwar_leaderboard';
const PROFILE_KEY = '@witwar_profile';
const LAST_VOTE_TIME_KEY = '@witwar_last_vote_time';
const POSTS_KEY = '@witwar_posts';
const FRIENDS_KEY = '@witwar_friends';

// Load leaderboard data
export const loadLeaderboard = async (): Promise<Person[]> => {
  try {
    const data = await AsyncStorage.getItem(LEADERBOARD_KEY);
    if (!data) return [];
    
    const allPeople = JSON.parse(data);
    const friends = await loadFriends();
    
    // Filter leaderboard to only show friends
    return allPeople.filter((person: Person) => 
      friends.includes(person.id)
    );
  } catch (error) {
    console.error('Failed to load leaderboard', error);
    return [];
  }
};

// Save leaderboard data
export const saveLeaderboard = async (people: Person[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(LEADERBOARD_KEY, JSON.stringify(people));
  } catch (error) {
    console.error('Failed to save leaderboard', error);
    throw error;
  }
};

// Load posts
export const loadPosts = async (): Promise<Post[]> => {
  try {
    const data = await AsyncStorage.getItem(POSTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load posts', error);
    return [];
  }
};

// Save post
export const savePost = async (post: Post): Promise<void> => {
  try {
    const posts = await loadPosts();
    posts.unshift(post);
    await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  } catch (error) {
    console.error('Failed to save post', error);
    throw error;
  }
};

// Like post
export const likePost = async (postId: string): Promise<Post[]> => {
  try {
    const posts = await loadPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) throw new Error('Post not found');
    
    const post = posts[postIndex];
    const userId = 'current-user'; // Replace with actual user ID
    
    if (post.likedBy.includes(userId)) {
      // Unlike
      post.likes--;
      post.likedBy = post.likedBy.filter(id => id !== userId);
    } else {
      // Like
      post.likes++;
      post.likedBy.push(userId);
      
      // Update author's vote count in leaderboard
      const leaderboard = await loadLeaderboard();
      const authorIndex = leaderboard.findIndex(p => p.id === post.authorId);
      if (authorIndex !== -1) {
        leaderboard[authorIndex].votes++;
        await saveLeaderboard(leaderboard);
      }
    }
    
    posts[postIndex] = post;
    await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    return posts;
  } catch (error) {
    console.error('Failed to like post', error);
    throw error;
  }
};

// Load friends list
export const loadFriends = async (): Promise<string[]> => {
  try {
    const data = await AsyncStorage.getItem(FRIENDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load friends', error);
    return [];
  }
};

// Add friend
export const addFriend = async (friendId: string): Promise<void> => {
  try {
    const friends = await loadFriends();
    if (!friends.includes(friendId)) {
      friends.push(friendId);
      await AsyncStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
    }
  } catch (error) {
    console.error('Failed to add friend', error);
    throw error;
  }
};

// Remove friend
export const removeFriend = async (friendId: string): Promise<void> => {
  try {
    const friends = await loadFriends();
    const updatedFriends = friends.filter(id => id !== friendId);
    await AsyncStorage.setItem(FRIENDS_KEY, JSON.stringify(updatedFriends));
  } catch (error) {
    console.error('Failed to remove friend', error);
    throw error;
  }
};

// Get a person by their ID
export const getPersonById = async (id: string): Promise<Person | null> => {
  try {
    const people = await loadLeaderboard();
    return people.find(person => person.id === id) || null;
  } catch (error) {
    console.error('Failed to get person by ID', error);
    return null;
  }
};

// Load user profile
export const loadProfile = async (): Promise<Person | null> => {
  try {
    const data = await AsyncStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load profile', error);
    return null;
  }
};

// Save user profile
export const saveProfile = async (profile: Person): Promise<void> => {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    
    // Also update this person in the leaderboard if they exist
    const leaderboard = await loadLeaderboard();
    const personIndex = leaderboard.findIndex(p => p.id === profile.id);
    
    if (personIndex >= 0) {
      leaderboard[personIndex] = {
        ...leaderboard[personIndex],
        name: profile.name,
        bio: profile.bio,
        joke: profile.joke,
      };
    } else {
      leaderboard.push(profile);
    }
    
    await saveLeaderboard(leaderboard);
  } catch (error) {
    console.error('Failed to save profile', error);
    throw error;
  }
};

// Get last vote time
export const getLastVoteTime = async (): Promise<number | null> => {
  try {
    const data = await AsyncStorage.getItem(LAST_VOTE_TIME_KEY);
    return data ? parseInt(data, 10) : null;
  } catch (error) {
    console.error('Failed to get last vote time', error);
    return null;
  }
};

// Set last vote time
export const setLastVoteTime = async (time: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(LAST_VOTE_TIME_KEY, time.toString());
  } catch (error) {
    console.error('Failed to set last vote time', error);
    throw error;
  }
};