import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import RetroWindow from '@/components/RetroWindow';
import { loadLeaderboard } from '@/utils/storage';
import { Person } from '@/types/person';

export default function LeaderboardScreen() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  
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

  const renderItem = ({ item, index }: { item: Person; index: number }) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
    
    return (
      <View style={styles.itemContainer}>
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>{index + 1}</Text>
          <Text style={styles.medalText}>{medal}</Text>
        </View>
        <View style={styles.personInfo}>
          <Text style={styles.nameText}>{item.name}</Text>
          <Text style={styles.voteText}>{item.votes} votes</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="COMEDY KINGS" subtitle="THE FUNNIEST PEOPLE RANKING" />
      
      <RetroWindow title="LEADERBOARD.EXE">
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>LOADING...</Text>
          </View>
        ) : people.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No entries yet!</Text>
            <Text style={styles.instructionText}>Head to the Vote tab to add people</Text>
          </View>
        ) : (
          <FlatList
            data={people.sort((a, b) => b.votes - a.votes)}
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
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#2a2a40',
    marginBottom: 10,
    padding: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#444466',
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 50,
  },
  rankText: {
    fontFamily: 'PressStart2P',
    fontSize: 16,
    color: '#ffcc00',
    marginRight: 5,
  },
  medalText: {
    fontSize: 18,
  },
  personInfo: {
    flex: 1,
  },
  nameText: {
    fontFamily: 'VT323',
    fontSize: 22,
    color: '#ffffff',
    marginBottom: 4,
  },
  voteText: {
    fontFamily: 'VT323',
    fontSize: 18,
    color: '#cccccc',
  },
});