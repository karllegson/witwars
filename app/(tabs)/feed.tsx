import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Heart, Share2, Image as ImageIcon } from 'lucide-react-native';
import Header from '@/components/Header';
import RetroWindow from '@/components/RetroWindow';
import RetroButton from '@/components/RetroButton';
import { loadPosts, savePost, likePost } from '@/utils/storage';
import { Post } from '@/types/post';

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedData();
    const interval = setInterval(loadFeedData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadFeedData = async () => {
    try {
      const feedPosts = await loadPosts();
      setPosts(feedPosts);
    } catch (error) {
      console.error("Failed to load feed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      try {
        const newPost: Post = {
          id: Date.now().toString(),
          imageUrl: result.assets[0].uri,
          authorId: 'current-user', // Replace with actual user ID
          timestamp: new Date().toISOString(),
          likes: 0,
          likedBy: [],
        };

        await savePost(newPost);
        setPosts(prev => [newPost, ...prev]);
      } catch (error) {
        Alert.alert("Error", "Failed to save post");
      }
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const updatedPosts = await likePost(postId);
      setPosts(updatedPosts);
    } catch (error) {
      Alert.alert("Error", "Failed to like post");
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.postImage}
        resizeMode="cover"
      />
      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(item.id)}>
          <Heart
            size={24}
            color={item.likedBy.includes('current-user') ? '#ff6b6b' : '#ffffff'}
            fill={item.likedBy.includes('current-user') ? '#ff6b6b' : 'none'}
          />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Share2 size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="WITWAR" subtitle="MEME BATTLEGROUND" />
      
      <RetroWindow title="FEED.EXE">
        <View style={styles.content}>
          <RetroButton
            title="POST MEME"
            onPress={handlePickImage}
            style={styles.postButton}
          />
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>LOADING...</Text>
            </View>
          ) : posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No memes yet!</Text>
              <Text style={styles.instructionText}>Be the first to post!</Text>
            </View>
          ) : (
            <FlatList
              data={posts}
              renderItem={renderPost}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </RetroWindow>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  postButton: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'VT323',
    fontSize: 24,
    color: '#33ff33',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'PressStart2P',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  instructionText: {
    fontFamily: 'VT323',
    fontSize: 20,
    color: '#cccccc',
    textAlign: 'center',
  },
  listContent: {
    gap: 16,
  },
  postCard: {
    backgroundColor: '#2a2a40',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#444466',
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#1a1a2e',
  },
  postActions: {
    flexDirection: 'row',
    padding: 12,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontFamily: 'VT323',
    fontSize: 18,
    color: '#ffffff',
  },
});