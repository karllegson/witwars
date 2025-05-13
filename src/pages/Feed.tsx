import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Heart, Share2, Image as ImageIcon } from 'lucide-react';
import Header from '../components/Header';
import RetroWindow from '../components/RetroWindow';
import RetroButton from '../components/RetroButton';
import { loadPosts, savePost, likePost } from '../utils/storage';
import { Post } from '../types/post';

const Container = styled.div`
  min-height: 100vh;
  background: #1a1a2e;
  padding-bottom: 80px;
`;

const Content = styled.div`
  padding: 16px;
`;

const PostCard = styled.div`
  background: #2a2a40;
  border-radius: 8px;
  border: 2px solid #444466;
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFeedData();
    const interval = setInterval(loadFeedData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadFeedData = async () => {
    try {
      const feedPosts = await loadPosts();
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
    reader.onload = async (event) => {
      const imageUrl = event.target?.result as string;
      const newPost: Post = {
        id: Date.now().toString(),
        imageUrl,
        authorId: 'current-user',
        timestamp: new Date().toISOString(),
        likes: 0,
        likedBy: [],
      };
      await savePost(newPost);
      setPosts(prev => [newPost, ...prev]);
    };
    reader.readAsDataURL(file);
  };

  const handleLike = async (postId: string) => {
    try {
      const updatedPosts = await likePost(postId);
      setPosts(updatedPosts);
    } catch (error) {
      alert('Failed to like post');
    }
  };

  return (
    <Container>
      <Header title="WITWAR" subtitle="MEME BATTLEGROUND" />
      <RetroWindow title="FEED.EXE">
        <Content>
          <RetroButton
            title="POST MEME"
            onClick={handlePickImage}
            style={{ marginBottom: 16 }}
          />
          <HiddenInput
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          {loading ? (
            <Loading>LOADING...</Loading>
          ) : posts.length === 0 ? (
            <Empty>
              <EmptyText>No memes yet!</EmptyText>
              <InstructionText>Be the first to post!</InstructionText>
            </Empty>
          ) : (
            posts.map((item) => (
              <PostCard key={item.id}>
                <PostImage src={item.imageUrl} alt="Meme" />
                <PostActions>
                  <ActionButton onClick={() => handleLike(item.id)}>
                    <Heart
                      size={24}
                      color={item.likedBy.includes('current-user') ? '#ff6b6b' : '#ffffff'}
                      fill={item.likedBy.includes('current-user') ? '#ff6b6b' : 'none'}
                    />
                    <ActionText>{item.likes}</ActionText>
                  </ActionButton>
                  <ActionButton>
                    <Share2 size={24} color="#ffffff" />
                  </ActionButton>
                </PostActions>
              </PostCard>
            ))
          )}
        </Content>
      </RetroWindow>
    </Container>
  );
} 