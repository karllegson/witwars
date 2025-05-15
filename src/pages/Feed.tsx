import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Heart, Share2, Image as ImageIcon } from 'lucide-react';
import Header from '../components/Header';
import RetroWindow from '../components/RetroWindow';
import AppContainer from '../components/AppContainer';
import RetroButton from '../components/RetroButton';
import { useAuth } from '../contexts/AuthContext';
import { getFriends } from '../utils/friendService';
import { createPost, getPostsByAuthors, Post, deletePost } from '../utils/postService';


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

const PostImage = styled.img`
  width: 100%;
  height: 300px;
  object-fit: cover;
  background: #1a1a2e;
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

const HiddenInput = styled.input`
  display: none;
`;

export default function Feed() {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<string[]>([]);
  const [postText, setPostText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
      const friendProfiles = await getFriends(currentUser.uid);
      const friendUids = friendProfiles.map(f => f.uid);
      setFriends(friendUids);
      const allowedUids = [currentUser.uid, ...friendUids];
      const feedPosts = await getPostsByAuthors(allowedUids);
      setPosts(feedPosts);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePost = async () => {
    if (!currentUser) return;
    if (!postText && !selectedImage) return; // Prevent empty posts
    const newPost = {
      authorId: currentUser.uid,
      text: postText,
      imageUrl: selectedImage || undefined,
      likes: 0,
      likedBy: [],
    };
    await createPost(newPost);
    setPostText('');
    setSelectedImage(null);
    await loadFeedData();
  };

  const handleDelete = async (postId: string) => {
    await deletePost(postId);
    await loadFeedData();
  };


  // Like functionality not implemented for Firestore version yet
  const handleLike = async (postId: string) => {
    alert('Like feature coming soon!');
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
              placeholder="Write something witty..."
              style={{ width: '100%', minHeight: 60, fontFamily: 'VT323, monospace', fontSize: 18, padding: 8, borderRadius: 6 }}
            />
            {selectedImage && (
              <div style={{ marginBottom: 8 }}>
                <img src={selectedImage} alt="Selected" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 6 }} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <RetroButton title="Add Image" onClick={handlePickImage} />
              <RetroButton title="Post" onClick={handlePost} />
            </div>
            <HiddenInput
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
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
                {item.text && (
                  <div style={{ padding: 12, fontFamily: 'VT323, monospace', fontSize: 20, color: '#fff' }}>{item.text}</div>
                )}
                {item.imageUrl && item.imageUrl !== '' && (
                  <PostImage src={item.imageUrl} alt="Post" />
                )}
                <PostActions>
                  <ActionButton onClick={() => handleLike(item.id!)}>
                    <Heart
                      size={24}
                      color={'#ffffff'}
                      fill={'none'}
                    />
                    <ActionText>{item.likes}</ActionText>
                  </ActionButton>
                  <ActionButton>
                    <Share2 size={24} color="#ffffff" />
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