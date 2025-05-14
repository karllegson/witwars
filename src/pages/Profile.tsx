import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import RetroWindow from '../components/RetroWindow';
import RetroButton from '../components/RetroButton';
import { loadProfile, saveProfile } from '../utils/storage';
import { Person } from '../types/person';

const Container = styled.div`
  min-height: 100vh;
  background: #1a1a2e;
  padding-bottom: 80px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const LoadingText = styled.div`
  font-family: 'VT323', monospace;
  font-size: 24px;
  color: #33ff33;
`;

const Content = styled.div`
  padding: 16px;
`;

const FormSection = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.div`
  font-family: 'Press Start 2P', cursive;
  font-size: 12px;
  color: #ffcc00;
  margin-bottom: 8px;
`;

const Input = styled.input`
  background: #2a2a40;
  border: 2px solid #444466;
  padding: 12px;
  font-family: 'VT323', monospace;
  font-size: 18px;
  color: #fff;
  border-radius: 4px;
  width: 100%;
`;

const TextArea = styled.textarea`
  background: #2a2a40;
  border: 2px solid #444466;
  padding: 12px;
  font-family: 'VT323', monospace;
  font-size: 18px;
  color: #fff;
  border-radius: 4px;
  width: 100%;
  height: 100px;
  resize: none;
`;

const StatsSection = styled.div`
  background: #2a2a40;
  border: 2px solid #444466;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
`;

const StatsTitle = styled.div`
  font-family: 'Press Start 2P', cursive;
  font-size: 14px;
  color: #ffcc00;
  margin-bottom: 12px;
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const StatsLabel = styled.div`
  font-family: 'VT323', monospace;
  font-size: 18px;
  color: #ccc;
`;

const StatsValue = styled.div`
  font-family: 'VT323', monospace;
  font-size: 18px;
  color: #fff;
`;

export default function Profile() {
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
        // IP address is not implemented for web, so leave as null
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      alert('Name cannot be empty');
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
      alert('Profile saved successfully');
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile');
    }
  };

  if (loading) {
    return (
      <Container>
        <Header title="COMEDY KINGS" subtitle="YOUR PROFILE" />
        <RetroWindow title="PROFILE.EXE">
          <LoadingContainer>
            <LoadingText>LOADING...</LoadingText>
          </LoadingContainer>
        </RetroWindow>
      </Container>
    );
  }

  return (
    <Container>
      <Header title="COMEDY KINGS" subtitle="YOUR PROFILE" />
      <RetroWindow title="PROFILE.EXE">
        <Content>
          <FormSection>
            <Label>YOUR NAME:</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </FormSection>
          <FormSection>
            <Label>YOUR BIO:</Label>
            <TextArea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell us about yourself"
            />
          </FormSection>
          <FormSection>
            <Label>YOUR BEST JOKE:</Label>
            <TextArea
              value={joke}
              onChange={e => setJoke(e.target.value)}
              placeholder="Share your funniest joke"
            />
          </FormSection>
          {profile && (
            <StatsSection>
              <StatsTitle>YOUR STATS:</StatsTitle>
              <StatsRow>
                <StatsLabel>Current Votes:</StatsLabel>
                <StatsValue>{profile.votes}</StatsValue>
              </StatsRow>
              <StatsRow>
                <StatsLabel>IP Address:</StatsLabel>
                <StatsValue>{ipAddress || 'Unknown'}</StatsValue>
              </StatsRow>
            </StatsSection>
          )}
          <RetroButton
            title="SAVE PROFILE"
            onClick={handleSaveProfile}
            style={{ marginBottom: 32 }}
          />
        </Content>
      </RetroWindow>
    </Container>
  );
} 