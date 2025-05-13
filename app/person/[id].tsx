import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import Header from '@/components/Header';
import RetroWindow from '@/components/RetroWindow';
import RetroButton from '@/components/RetroButton';
import { getPersonById } from '@/utils/storage';
import { Person } from '@/types/person';

export default function PersonProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadPerson = async () => {
      if (!id) return;
      
      try {
        const personData = await getPersonById(id);
        setPerson(personData);
      } catch (error) {
        console.error("Failed to load person:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPerson();
  }, [id]);
  
  const handleBack = () => {
    router.back();
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="COMEDY KINGS" subtitle="FRIEND PROFILE" />
        <RetroWindow title="FRIEND.EXE">
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>LOADING...</Text>
          </View>
        </RetroWindow>
      </SafeAreaView>
    );
  }
  
  if (!person) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="COMEDY KINGS" subtitle="FRIEND PROFILE" />
        <RetroWindow title="ERROR.EXE">
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Person not found</Text>
            <RetroButton title="BACK" onPress={handleBack} style={styles.backButton} />
          </View>
        </RetroWindow>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Header title="COMEDY KINGS" subtitle="FRIEND PROFILE" />
      
      <RetroWindow title={`${person.name.toUpperCase()}.EXE`}>
        <ScrollView style={styles.content}>
          <View style={styles.profileHeader}>
            <Text style={styles.nameText}>{person.name}</Text>
            <View style={styles.votesBadge}>
              <Text style={styles.votesText}>{person.votes} VOTES</Text>
            </View>
          </View>
          
          {person.bio ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>BIO:</Text>
              <Text style={styles.bioText}>{person.bio}</Text>
            </View>
          ) : null}
          
          {person.joke ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>BEST JOKE:</Text>
              <View style={styles.jokeContainer}>
                <Text style={styles.jokeText}>"{person.joke}"</Text>
              </View>
            </View>
          ) : null}
          
          <RetroButton
            title="BACK TO FRIENDS"
            onPress={handleBack}
            style={styles.backButton}
          />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontFamily: 'PressStart2P',
    fontSize: 16,
    color: '#ff6666',
    marginBottom: 24,
  },
  content: {
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    padding: 12,
    backgroundColor: '#2a2a40',
    borderWidth: 2,
    borderColor: '#444466',
    borderRadius: 4,
  },
  nameText: {
    fontFamily: 'PressStart2P',
    fontSize: 16,
    color: '#ffffff',
  },
  votesBadge: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ffcc00',
  },
  votesText: {
    fontFamily: 'VT323',
    fontSize: 18,
    color: '#ffcc00',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 14,
    color: '#ffcc00',
    marginBottom: 12,
  },
  bioText: {
    fontFamily: 'VT323',
    fontSize: 18,
    color: '#ffffff',
    lineHeight: 24,
    backgroundColor: '#2a2a40',
    padding: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#444466',
  },
  jokeContainer: {
    backgroundColor: '#2a2a40',
    padding: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#444466',
  },
  jokeText: {
    fontFamily: 'VT323',
    fontSize: 18,
    color: '#ffffff',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  backButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});