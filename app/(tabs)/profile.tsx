import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import RetroWindow from '@/components/RetroWindow';
import RetroButton from '@/components/RetroButton';
import { loadProfile, saveProfile } from '@/utils/storage';
import { Person } from '@/types/person';
import { getUserIp } from '@/utils/ipAddress';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Person | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [joke, setJoke] = useState('');
  const [loading, setLoading] = useState(true);
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const profileData = await loadProfile();
        if (profileData) {
          setProfile(profileData);
          setName(profileData.name);
          setBio(profileData.bio || '');
          setJoke(profileData.joke || '');
        }
        
        const ip = await getUserIp();
        setIpAddress(ip);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    
    try {
      const profileData: Person = {
        id: profile?.id || Date.now().toString(),
        name: name.trim(),
        votes: profile?.votes || 0,
        bio: bio.trim(),
        joke: joke.trim(),
        ipAddress: ipAddress || undefined,
      };
      
      await saveProfile(profileData);
      setProfile(profileData);
      Alert.alert("Success", "Profile saved successfully");
    } catch (error) {
      console.error("Failed to save profile:", error);
      Alert.alert("Error", "Failed to save profile");
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="COMEDY KINGS" subtitle="YOUR PROFILE" />
        <RetroWindow title="PROFILE.EXE">
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>LOADING...</Text>
          </View>
        </RetroWindow>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Header title="COMEDY KINGS" subtitle="YOUR PROFILE" />
      
      <RetroWindow title="PROFILE.EXE">
        <ScrollView style={styles.content}>
          <View style={styles.formSection}>
            <Text style={styles.label}>YOUR NAME:</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#888888"
            />
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.label}>YOUR BIO:</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              placeholderTextColor="#888888"
              multiline
              numberOfLines={4}
            />
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.label}>YOUR BEST JOKE:</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={joke}
              onChangeText={setJoke}
              placeholder="Share your funniest joke"
              placeholderTextColor="#888888"
              multiline
              numberOfLines={4}
            />
          </View>
          
          {profile && (
            <View style={styles.statsSection}>
              <Text style={styles.statsTitle}>YOUR STATS:</Text>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>Current Votes:</Text>
                <Text style={styles.statsValue}>{profile.votes}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>IP Address:</Text>
                <Text style={styles.statsValue}>{ipAddress || 'Unknown'}</Text>
              </View>
            </View>
          )}
          
          <RetroButton
            title="SAVE PROFILE"
            onPress={handleSaveProfile}
            style={styles.saveButton}
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
  content: {
    padding: 16,
  },
  formSection: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#ffcc00',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2a2a40',
    borderWidth: 2,
    borderColor: '#444466',
    padding: 12,
    fontFamily: 'VT323',
    fontSize: 18,
    color: '#ffffff',
    borderRadius: 4,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  statsSection: {
    backgroundColor: '#2a2a40',
    borderWidth: 2,
    borderColor: '#444466',
    padding: 16,
    borderRadius: 4,
    marginBottom: 20,
  },
  statsTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 14,
    color: '#ffcc00',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statsLabel: {
    fontFamily: 'VT323',
    fontSize: 18,
    color: '#cccccc',
  },
  statsValue: {
    fontFamily: 'VT323',
    fontSize: 18,
    color: '#ffffff',
  },
  saveButton: {
    marginBottom: 32,
  },
});