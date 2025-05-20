import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Heart } from 'lucide-react';
import Header from '../components/Header';
import RetroWindow from '../components/RetroWindow';
import Avatar from '../components/Avatar';
import AppContainer from '../components/AppContainer';
import RetroButton from '../components/RetroButton';
import { useAuth } from '../contexts/AuthContext';
import { getFriends } from '../utils/friendService';
import { createPost, getPostsByAuthors, Post, deletePost, toggleLike } from '../utils/postService';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const Content = styled.div`
  padding: 16px;
`;

const PostCard = styled.div`
  background: #2a2a2a;
  border-radius: 8px;
  border: 2px solid #333;
  overflow: hidden;
  margin-bottom: 16px;
`;

const PostActions = styled.div`
  display: flex;
  flex-direction: row;
  padding: 12px;
  gap: 16px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-family: 'VT323', monospace;
  font-size: 18px;
`;

const ActionText = styled.span`
  font-family: 'VT323', monospace;
  font-size: 18px;
  color: #fff;
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-family: 'VT323', monospace;
  font-size: 24px;
  color: #33ff33;
`;

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
`;

const EmptyText = styled.div`
  font-family: 'Press Start 2P', cursive;
  font-size: 16px;
  color: #fff;
  text-align: center;
  margin-bottom: 16px;
`;

const InstructionText = styled.div`
  font-family: 'VT323', monospace;
  font-size: 20px;
  color: #ccc;
  text-align: center;
`;

// Image upload functionality has been removed

// Extended Post type with author information
interface PostWithAuthor extends Post {
  author?: {
    username: string;
    profilePicture?: string;
  }
}

export default function Feed() {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [postText, setPostText] = useState('');

  useEffect(() => {
    loadFeedData();
    const interval = setInterval(loadFeedData, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [currentUser]);

  const loadFeedData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // Get friends first
      const friendProfiles = await getFriends(currentUser.uid);
      const friendUids = friendProfiles.map(f => f.uid);
      const allowedUids = [currentUser.uid, ...friendUids];

      // Get feed posts
      const feedPosts = await getPostsByAuthors(allowedUids);

      // Create a map of author IDs to user profiles for quick lookup
      const authorMap = new Map();
      friendProfiles.forEach(profile => authorMap.set(profile.uid, profile));

      // Add current user to the map if not already there
      if (!authorMap.has(currentUser.uid)) {
        // Fetch current user's profile
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = { uid: currentUser.uid, ...userDoc.data() };
          authorMap.set(currentUser.uid, userData);
        }
      }

      // Add author information to each post
      const postsWithAuthor = feedPosts.map(post => {
        const author = authorMap.get(post.authorId);
        return {
          ...post,
          author: author ? {
            username: author.username,
            profilePicture: author.profilePicture
          } : undefined
        };
      });

      setPosts(postsWithAuthor);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!currentUser) return;
    if (!postText) return; // Prevent empty posts
    const newPost = {
      authorId: currentUser.uid,
      text: postText,
      likes: 0,
      likedBy: [],
    };
    await createPost(newPost);
    setPostText('');
    await loadFeedData();
  };

  const handleDelete = async (postId: string) => {
    await deletePost(postId);
    await loadFeedData();
  };


  // Toggle like functionality
  const handleLike = async (postId: string) => {
    if (!currentUser) return;
    
    try {
      // Call toggleLike function and update the post in the local state
      const updatedPost = await toggleLike(postId, currentUser.uid);
      
      // Update posts array with the updated post
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            // Preserve author information when updating post
            return {
              ...post,
              likes: updatedPost.likes,
              likedBy: updatedPost.likedBy || []
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  return (
    <AppContainer>
      <Header title="WITWARS" subtitle="Battleground" />
      <RetroWindow title="FEED.EXE">
        <Content>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            <textarea
              value={postText}
              onChange={e => setPostText(e.target.value)}
              placeholder="Write something..."
              style={{ width: '100%', minHeight: 60, fontFamily: 'VT323, monospace', fontSize: 18, padding: 8, borderRadius: 6 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <RetroButton title="Post" onClick={handlePost} />
            </div>
          </div>
          {loading ? (
            <Loading>LOADING...</Loading>
          ) : posts.length === 0 ? (
            <Empty>
              <EmptyText>No posts yet!</EmptyText>
              <InstructionText>Be the first to post!</InstructionText>
            </Empty>
          ) : (
            posts.map((item) => (
              <PostCard key={item.id}>
                <div style={{ display: 'flex', padding: 12, gap: 12, alignItems: 'flex-start' }}>
                  <Avatar profilePicture={item.author?.profilePicture} username={item.author?.username || 'Unknown'} size={42} />
                  <div>
                    <div style={{ fontFamily: 'VT323, monospace', fontSize: 16, color: '#ffcc00', marginBottom: 4 }}>
                      {item.author?.username || 'Unknown User'}
                    </div>
                    <div style={{ fontFamily: 'VT323, monospace', fontSize: 20, color: '#fff' }}>{item.text}</div>
                  </div>
                </div>
                <PostActions>
                  <ActionButton onClick={() => handleLike(item.id!)}>
                    <Heart
                      size={24}
                      color={'#ffffff'}
                      fill={currentUser && Array.isArray(item.likedBy) && item.likedBy.includes(currentUser.uid) ? '#ff6b6b' : 'none'}
                    />
                    <ActionText>{item.likes}</ActionText>
                  </ActionButton>
                  {currentUser && item.authorId === currentUser.uid && (
                    <ActionButton onClick={() => handleDelete(item.id!)}>
                      <span style={{ color: '#ff4d4d' }}>Delete</span>
                    </ActionButton>
                  )}
                </PostActions>
              </PostCard>
            ))
          )}
        </Content>
      </RetroWindow>
    </AppContainer>
  );
} 