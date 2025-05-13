export interface Post {
  id: string;
  imageUrl: string;
  authorId: string;
  timestamp: string;
  likes: number;
  likedBy: string[];
} 