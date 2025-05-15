import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';

export interface Post {
  id?: string;
  authorId: string;
  imageUrl?: string;
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
  if (post.imageUrl && post.imageUrl.trim() !== '') {
    postData.imageUrl = post.imageUrl;
  }
  const docRef = await addDoc(collection(db, 'posts'), postData);
  return docRef.id;
};

// Delete a post by ID
import { doc, deleteDoc } from 'firebase/firestore';
export const deletePost = async (postId: string) => {
  await deleteDoc(doc(db, 'posts', postId));
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
