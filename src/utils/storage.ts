import { Post } from '../types/post';
import { Person } from '../types/person';

const POSTS_KEY = 'witwar_posts';
const LEADERBOARD_KEY = 'witwar_leaderboard';
const LAST_VOTE_TIME_KEY = 'witwar_last_vote_time';

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