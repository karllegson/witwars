import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import RetroWindow from '@/components/RetroWindow';
import RetroButton from '@/components/RetroButton';
import { loadLeaderboard, saveLeaderboard, getLastVoteTime, setLastVoteTime } from '@/utils/storage';
import { Person } from '@/types/person';
import { getUserIp } from '@/utils/ipAddress';

export default function VoteScreen() {
  const [people, setPeople] = useState<Person[]>([]);
  const [newPersonName, setNewPersonName] = useState('');
  const [canVote, setCanVote] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  
  // Load data and check voting eligibility
  useEffect(() => {
    const loadData = async () => {
      try {
        const leaderboard = await loadLeaderboard();
        setPeople(leaderboard);
        
        // Check if user can vote today
        const lastVoteTime = await getLastVoteTime();
        if (lastVoteTime) {
          const now = new Date().getTime();
          const timeSinceLastVote = now - lastVoteTime;
          const oneDayInMs = 24 * 60 * 60 * 1000;
          
          if (timeSinceLastVote < oneDayInMs) {
            setCanVote(false);
            const timeLeft = oneDayInMs - timeSinceLastVote;
            const hours = Math.floor(timeLeft / (60 * 60 * 1000));
            const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
            setTimeRemaining(`${hours}h ${minutes}m`);
          } else {
            setCanVote(true);
            setTimeRemaining(null);
          }
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    
    loadData();
    // Refresh every minute
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAddPerson = async () => {
    if (!newPersonName.trim()) {
      Alert.alert("Error", "Please enter a name");
      return;
    }
    
    try {
      const existingIndex = people.findIndex(
        person => person.name.toLowerCase() === newPersonName.toLowerCase()
      );
      
      if (existingIndex >= 0) {
        Alert.alert("Error", "This person already exists in the list");
        return;
      }
      
      const newPerson: Person = {
        id: Date.now().toString(),
        name: newPersonName.trim(),
        votes: 0,
        bio: '',
        joke: '',
      };
      
      const updatedPeople = [...people, newPerson];
      await saveLeaderboard(updatedPeople);
      setPeople(updatedPeople);
      setNewPersonName('');
    } catch (error) {
      console.error("Failed to add person:", error);
      Alert.alert("Error", "Failed to add person");
    }
  };

  const handleVote = async (personId: string) => {
    if (!canVote) {
      Alert.alert("Cannot Vote", `You can vote again in ${timeRemaining}`);
      return;
    }
    
    try {
      const userIp = await getUserIp();
      
      const updatedPeople = people.map(person => 
        person.id === personId 
          ? { ...person, votes: person.votes + 1, lastVoterIp: userIp }
          : person
      );
      
      await saveLeaderboard(updatedPeople);
      setPeople(updatedPeople);
      await setLastVoteTime(new Date().getTime());
      setCanVote(false);
      
      // Calculate 24 hours from now
      const oneDayInMs = 24 * 60 * 60 * 1000;
      setTimeRemaining("23h 59m");
      
      Alert.alert("Vote Recorded", "Your vote has been counted! You can vote again tomorrow.");
    } catch (error) {
      console.error("Failed to record vote:", error);
      Alert.alert("Error", "Failed to record your vote");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="COMEDY KINGS" subtitle="CAST YOUR VOTE" />
      
      <RetroWindow title="VOTE.EXE">
        <ScrollView style={styles.content}>
          <View style={styles.addPersonContainer}>
            <Text style={styles.sectionTitle}>Add Someone New:</Text>
            <View style={styles.addPersonInputRow}>
              <TextInput
                style={styles.input}
                value={newPersonName}
                onChangeText={setNewPersonName}
                placeholder="Person's name"
                placeholderTextColor="#888888"
              />
              <RetroButton 
                title="ADD" 
                onPress={handleAddPerson} 
                style={styles.addButton} 
              />
            </View>
          </View>
          
          <View style={styles.votingSection}>
            <Text style={styles.sectionTitle}>Vote For Someone:</Text>
            
            {!canVote && (
              <View style={styles.timeRemainingContainer}>
                <Text style={styles.timeRemainingText}>
                  You can vote again in: {timeRemaining}
                </Text>
              </View>
            )}
            
            {people.length === 0 ? (
              <Text style={styles.emptyText}>No one to vote for yet! Add someone first.</Text>
            ) : (
              people.map(person => (
                <View key={person.id} style={styles.personVoteRow}>
                  <Text style={styles.personName}>{person.name}</Text>
                  <RetroButton
                    title="VOTE"
                    onPress={() => handleVote(person.id)}
                    disabled={!canVote}
                    style={canVote ? styles.voteButton : styles.disabledVoteButton}
                  />
                </View>
              ))
            )}
          </View>
        </ScrollView>
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
    padding: 16,
  },
  addPersonContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 14,
    color: '#ffcc00',
    marginBottom: 12,
  },
  addPersonInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#2a2a40',
    borderWidth: 2,
    borderColor: '#444466',
    paddingHorizontal: 12,
    fontFamily: 'VT323',
    fontSize: 20,
    color: '#ffffff',
    marginRight: 8,
  },
  addButton: {
    width: 80,
    height: 48,
  },
  votingSection: {
    marginBottom: 16,
  },
  timeRemainingContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ff6666',
  },
  timeRemainingText: {
    fontFamily: 'VT323',
    fontSize: 18,
    color: '#ff6666',
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: 'VT323',
    fontSize: 20,
    color: '#cccccc',
    textAlign: 'center',
    marginVertical: 24,
  },
  personVoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a40',
    marginBottom: 10,
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#444466',
  },
  personName: {
    fontFamily: 'VT323',
    fontSize: 20,
    color: '#ffffff',
    flex: 1,
  },
  voteButton: {
    width: 80,
  },
  disabledVoteButton: {
    width: 80,
    opacity: 0.5,
  },
});