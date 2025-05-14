import { Post } from '../types/post';
import { Person } from '../types/person';

const POSTS_KEY = 'witwar_posts';
const LEADERBOARD_KEY = 'witwar_leaderboard';
const LAST_VOTE_TIME_KEY = 'witwar_last_vote_time';
const PROFILE_KEY = 'witwar_profile';

export const loadPosts = async (): Promise<Post[]> => {
  const data = localStorage.getItem(POSTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const savePost = async (post: Post): Promise<void> => {
  const posts = await loadPosts();
  posts.unshift(post);
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
};

export const likePost = async (postId: string): Promise<Post[]> => {
  const posts = await loadPosts();
  const postIndex = posts.findIndex(p => p.id === postId);
  if (postIndex === -1) throw new Error('Post not found');
  const post = posts[postIndex];
  const userId = 'current-user'; // Replace with actual user ID
  if (post.likedBy.includes(userId)) {
    post.likes--;
    post.likedBy = post.likedBy.filter(id => id !== userId);
  } else {
    post.likes++;
    post.likedBy.push(userId);
  }
  posts[postIndex] = post;
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  return posts;
};

export const loadLeaderboard = async (): Promise<Person[]> => {
  const data = localStorage.getItem(LEADERBOARD_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveLeaderboard = async (people: Person[]): Promise<void> => {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(people));
};

export const getLastVoteTime = async (): Promise<number | null> => {
  const data = localStorage.getItem(LAST_VOTE_TIME_KEY);
  return data ? parseInt(data, 10) : null;
};

export const setLastVoteTime = async (time: number): Promise<void> => {
  localStorage.setItem(LAST_VOTE_TIME_KEY, time.toString());
};

export const loadProfile = async (): Promise<Person | null> => {
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveProfile = async (profile: Person): Promise<void> => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

// FRIEND MANAGEMENT
export const sendFriendRequest = async (toUserId: string): Promise<void> => {
  const profile = await loadProfile();
  if (!profile) throw new Error('No profile found');
  const leaderboard = await loadLeaderboard();
  const toUser = leaderboard.find(p => p.id === toUserId);
  if (!toUser) throw new Error('User not found');
  // Add to sent requests
  profile.friendRequestsSent = profile.friendRequestsSent || [];
  if (!profile.friendRequestsSent.includes(toUserId)) {
    profile.friendRequestsSent.push(toUserId);
  }
  await saveProfile(profile);
  // Add to received requests for the other user
  toUser.friendRequestsReceived = toUser.friendRequestsReceived || [];
  if (!toUser.friendRequestsReceived.includes(profile.id)) {
    toUser.friendRequestsReceived.push(profile.id);
  }
  await saveLeaderboard(leaderboard);
};

export const acceptFriendRequest = async (fromUserId: string): Promise<void> => {
  const profile = await loadProfile();
  if (!profile) throw new Error('No profile found');
  const leaderboard = await loadLeaderboard();
  const fromUser = leaderboard.find(p => p.id === fromUserId);
  if (!fromUser) throw new Error('User not found');
  // Remove from received requests
  profile.friendRequestsReceived = (profile.friendRequestsReceived || []).filter(id => id !== fromUserId);
  // Add to friends
  profile.friends = profile.friends || [];
  if (!profile.friends.includes(fromUserId)) {
    profile.friends.push(fromUserId);
  }
  await saveProfile(profile);
  // Remove from sent requests for the other user
  fromUser.friendRequestsSent = (fromUser.friendRequestsSent || []).filter(id => id !== profile.id);
  // Add to friends for the other user
  fromUser.friends = fromUser.friends || [];
  if (!fromUser.friends.includes(profile.id)) {
    fromUser.friends.push(profile.id);
  }
  await saveLeaderboard(leaderboard);
};

export const getFriends = async (): Promise<Person[]> => {
  const profile = await loadProfile();
  if (!profile || !profile.friends) return [];
  const leaderboard = await loadLeaderboard();
  return leaderboard.filter(p => profile.friends!.includes(p.id));
};

export const getFriendRequests = async (): Promise<Person[]> => {
  const profile = await loadProfile();
  if (!profile || !profile.friendRequestsReceived) return [];
  const leaderboard = await loadLeaderboard();
  return leaderboard.filter(p => profile.friendRequestsReceived!.includes(p.id));
}; 