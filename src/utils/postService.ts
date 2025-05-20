import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  getDoc,
  Timestamp, 
  orderBy,
  doc, 
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

export interface Post {
  id?: string;
  authorId: string;
  text?: string;
  timestamp: string;
  likes: number;
  likedBy: string[];
}

// Create a new post
export const createPost = async (post: Omit<Post, 'id' | 'timestamp'>) => {
  // Only include fields if they are defined and non-empty
  const postData: any = {
    authorId: post.authorId,
    timestamp: Timestamp.now().toDate().toISOString(),
    likes: 0,
    likedBy: [],
  };
  if (post.text && post.text.trim() !== '') {
    postData.text = post.text;
  }
  const docRef = await addDoc(collection(db, 'posts'), postData);
  return docRef.id;
};

// Delete a post by ID
export const deletePost = async (postId: string) => {
  await deleteDoc(doc(db, 'posts', postId));
};

// Toggle like on a post
export const toggleLike = async (postId: string, userId: string): Promise<Post> => {
  // Get the post
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  
  if (!postSnap.exists()) {
    throw new Error('Post not found');
  }
  
  const postData = postSnap.data();
  // Ensure all fields exist with proper defaults
  const post = { 
    id: postId, 
    authorId: postData.authorId,
    text: postData.text,
    timestamp: postData.timestamp,
    likes: postData.likes || 0,
    likedBy: postData.likedBy || []
  } as Post;
  
  // Check if user already liked this post
  const alreadyLiked = post.likedBy.includes(userId);
  
  if (alreadyLiked) {
    // Unlike: Remove user from likedBy array and decrease likes count
    await updateDoc(postRef, {
      likedBy: arrayRemove(userId),
      likes: post.likes > 0 ? post.likes - 1 : 0 // Prevent negative likes
    });
    post.likedBy = post.likedBy.filter(id => id !== userId);
    post.likes = post.likes > 0 ? post.likes - 1 : 0;
  } else {
    // Like: Add user to likedBy array and increase likes count
    await updateDoc(postRef, {
      likedBy: arrayUnion(userId),
      likes: (post.likes || 0) + 1
    });
    post.likedBy = [...post.likedBy, userId];
    post.likes = (post.likes || 0) + 1;
  }
  
  return post;
};

// Fetch posts by a list of user UIDs
export const getPostsByAuthors = async (authorIds: string[]): Promise<Post[]> => {
  if (authorIds.length === 0) return [];
  // Firestore 'in' queries support up to 10 elements per query
  const chunks = [];
  for (let i = 0; i < authorIds.length; i += 10) {
    chunks.push(authorIds.slice(i, i + 10));
  }
  let posts: Post[] = [];
  for (const chunk of chunks) {
    const q = query(
      collection(db, 'posts'),
      where('authorId', 'in', chunk),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    posts = posts.concat(
      querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post))
    );
  }
  // Sort all posts by timestamp (desc)
  posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return posts;
};
