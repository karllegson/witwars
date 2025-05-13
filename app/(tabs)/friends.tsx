import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import RetroWindow from '@/components/RetroWindow';
import { loadLeaderboard } from '@/utils/storage';
import { Person } from '@/types/person';
import { useRouter } from 'expo-router';

export default function FriendsScreen() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await loadLeaderboard();
        setPeople(data);
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
    
    // Refresh every minute to check for updates
    const interval = setInterval(fetchLeaderboard, 60000);
    return () => clearInterval(interval);
  }, []);

  const navigateToProfile = (id: string) => {
    router.push(`/person/${id}`);
  };

  const renderItem = ({ item }: { item: Person }) => {
    return (
      <TouchableOpacity 
        style={styles.personCard}
        onPress={() => navigateToProfile(item.id)}
      >
        <View style={styles.personDetails}>
          <Text style={styles.personName}>{item.name}</Text>
          {item.joke ? (
            <Text style={styles.jokeText}>"{item.joke}"</Text>
          ) : (
            <Text style={styles.noJokeText}>No joke yet</Text>
          )}
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreValue}>{item.votes}</Text>
          <Text style={styles.scoreLabel}>VOTES</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="COMEDY KINGS" subtitle="YOUR HILARIOUS FRIENDS" />
      
      <RetroWindow title="FRIENDS.EXE">
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>LOADING...</Text>
          </View>
        ) : people.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No friends added yet!</Text>
            <Text style={styles.instructionText}>Head to the Vote tab to add people</Text>
          </View>
        ) : (
          <FlatList
            data={people}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}
      </RetroWindow>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    padding: 20,
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
    padding: 12,
  },
  personCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a40',
    marginBottom: 16,
    padding: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#444466',
  },
  personDetails: {
    flex: 1,
    marginRight: 12,
  },
  personName: {
    fontFamily: 'VT323',
    fontSize: 22,
    color: '#ffffff',
    marginBottom: 8,
  },
  jokeText: {
    fontFamily: 'VT323',
    fontSize: 16,
    color: '#cccccc',
    fontStyle: 'italic',
  },
  noJokeText: {
    fontFamily: 'VT323',
    fontSize: 16,
    color: '#888888',
    fontStyle: 'italic',
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 4,
    padding: 8,
    minWidth: 70,
  },
  scoreValue: {
    fontFamily: 'PressStart2P',
    fontSize: 16,
    color: '#ffcc00',
  },
  scoreLabel: {
    fontFamily: 'VT323',
    fontSize: 14,
    color: '#aaaaaa',
    marginTop: 4,
  },
});