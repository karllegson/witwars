import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import Header from '../components/Header';
import RetroWindow from '../components/RetroWindow';
import RetroButton from '../components/RetroButton';

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
  color: #fff;
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

const UserInfo = styled.div`
  font-family: 'VT323', monospace;
  font-size: 18px;
  color: #ccc;
  margin-bottom: 20px;
`;

const ProfilePage: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

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
      <Container>
        <Header title="COMEDY KINGS" subtitle="YOUR PROFILE" />
        <RetroWindow title="PROFILE.EXE">
          <Content>
            <p>Loading authentication status...</p>
          </Content>
        </RetroWindow>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container>
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
      </Container>
    );
  }

  return (
    <Container>
      <Header title="COMEDY KINGS" subtitle={`WELCOME, ${currentUser.displayName || currentUser.email}!`}/>
      <RetroWindow title={`${currentUser.email}.USR`}>
        <Content>
          <UserInfo>Email: {currentUser.email}</UserInfo>
          <UserInfo>UID: {currentUser.uid}</UserInfo>
          <p>Profile editing and stats from Firestore coming soon!</p>
          <RetroButton title="LOGOUT" onClick={handleLogout} style={{ marginTop: 20 }}/>
        </Content>
      </RetroWindow>
    </Container>
  );
};

export default ProfilePage; 