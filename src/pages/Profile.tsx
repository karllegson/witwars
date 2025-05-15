import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Header from '../components/Header';
import RetroWindow from '../components/RetroWindow';
import AppContainer from '../components/AppContainer';
import RetroButton from '../components/RetroButton';


const Content = styled.div`
  padding: 16px;
  color: #fff;
`;

const StatsSection = styled.div`
  background: #232323;
  border: 2px solid #333;
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

const AuthPromptContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  font-family: 'VT323', monospace;
`;

const AuthPromptText = styled.p`
  font-size: 20px;
  color: #ffcc00;
  margin-bottom: 20px;
`;

const AuthButtonContainer = styled.div`
  display: flex;
  gap: 20px;
`;



const UsernameDisplay = styled.div`
  font-family: 'Press Start 2P', cursive;
  font-size: 24px;
  color: #33ff33;
  text-align: center;
  margin: 20px 0;
  padding: 16px;
  background: #232323;
  border: 2px solid #333;
  border-radius: 4px;
`;

const ProfilePage: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout.");
    }
  };

  if (authLoading) {
    return (
      <AppContainer>
        <Header title="COMEDY KINGS" subtitle="YOUR PROFILE" />
        <RetroWindow title="PROFILE.EXE">
          <Content>
            <p>Loading authentication status...</p>
          </Content>
        </RetroWindow>
      </AppContainer>
    );
  }

  if (!currentUser) {
    return (
      <AppContainer>
        <Header title="COMEDY KINGS" subtitle="JOIN THE STAGE" />
        <RetroWindow title="ACCESS.DENIED">
          <AuthPromptContainer>
            <AuthPromptText>You need to be logged in to view your profile.</AuthPromptText>
            <AuthButtonContainer>
              <RetroButton title="LOGIN" onClick={() => navigate('/login')} />
              <RetroButton title="REGISTER" onClick={() => navigate('/register')} />
            </AuthButtonContainer>
          </AuthPromptContainer>
        </RetroWindow>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Header title="COMEDY KINGS" subtitle={`WELCOME, ${username || currentUser.email}!`}/>
      <RetroWindow title={`PROFILE.EXE`}>
        <Content>
          <UsernameDisplay>@{username}</UsernameDisplay>
          
          <StatsSection>
            <StatsTitle>ACCOUNT INFO</StatsTitle>
            <StatsRow>
              <StatsLabel>Username:</StatsLabel>
              <StatsValue>@{username}</StatsValue>
            </StatsRow>
            <StatsRow>
              <StatsLabel>Email:</StatsLabel>
              <StatsValue>{currentUser?.email}</StatsValue>
            </StatsRow>
            <StatsRow>
              <StatsLabel>Account ID:</StatsLabel>
              <StatsValue style={{ fontSize: '14px' }}>{currentUser.uid}</StatsValue>
            </StatsRow>
          </StatsSection>

          <StatsSection>
            <StatsTitle>STATS</StatsTitle>
            <StatsRow>
              <StatsLabel>Member Since:</StatsLabel>
              <StatsValue>{new Date(currentUser.metadata.creationTime || '').toLocaleDateString()}</StatsValue>
            </StatsRow>
          </StatsSection>

          <RetroButton title="LOGOUT" onClick={handleLogout} style={{ marginTop: 20 }}/>
        </Content>
      </RetroWindow>
    </AppContainer>
  );
};

export default ProfilePage; 