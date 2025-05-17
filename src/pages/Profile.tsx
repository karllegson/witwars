import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { setUsernameWithCooldown, setProfilePicture, setBio, setLocation, UserProfile } from '../utils/friendService';

// DiceBear pixel-art-neutral avatar options (only valid parameters)
const SKIN_COLORS = ['ffdbac','f5cfa0','eac393','e0b687','cb9e6e','b68655','a26d3d','8d5524'];
const EYES_TYPES = [
  'variant01','variant02','variant03','variant04','variant05','variant06','variant07','variant08','variant09','variant10','variant11','variant12']
const MOUTH_TYPES = [
  'happy01','happy02','happy03','happy04','happy05','happy06','happy07','happy08','happy09','happy10','happy11','happy12','happy13',
  'sad01','sad02','sad03','sad04','sad05','sad06','sad07','sad08','sad09','sad10']


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
  // Profile avatar customization state
  const [profilePictureOptions, setProfilePictureOptions] = useState({
    skinColor: SKIN_COLORS[0],
    eyes: EYES_TYPES[0],
    mouth: MOUTH_TYPES[0],
  });
  const [bio, setBioState] = useState<string>('');
  const [location, setLocationState] = useState<string>('');
  const [lastUsernameChange, setLastUsernameChange] = useState<number | null>(null);
  const [loadingSave, setLoadingSave] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          setUsername(data.username);
          // If profilePicture is a stringified options object, parse it. Otherwise, fallback to defaults.
          let options = null;
          try {
            options = data.profilePicture ? JSON.parse(data.profilePicture) : null;
          } catch { options = null; }
          setProfilePictureOptions(options && options.skinColor ? options : {
            skinColor: SKIN_COLORS[0],
            hair: HAIR_TYPES[0],
            hairColor: HAIR_COLORS[0],
            eyes: EYES_TYPES[0],
            mouth: MOUTH_TYPES[0],
          });
          setBioState(data.bio || '');
          setLocationState(data.location || '');
          setLastUsernameChange(data.lastUsernameChange || null);
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

  const handleSave = async () => {
    if (!currentUser) return;
    setLoadingSave(true);
    setFeedback('');
    try {
      if (editMode) {
        // Save avatar options as a stringified object
        await setProfilePicture(currentUser.uid, JSON.stringify(profilePictureOptions)); // No profilePicture variable used
        await setBio(currentUser.uid, bio);
        await setLocation(currentUser.uid, location);
        setFeedback('Profile updated!');
      }
    } catch (e: any) {
      setFeedback(e.message || 'Failed to update profile');
    }
    setLoadingSave(false);
  };


  const handleUsernameChange = async () => {
    if (!currentUser) return;
    setLoadingSave(true);
    setFeedback('');
    try {
      await setUsernameWithCooldown(currentUser.uid, username);
      setFeedback('Username updated!');
      setLastUsernameChange(Date.now());
    } catch (e: any) {
      setFeedback(e.message || 'Failed to update username');
    }
    setLoadingSave(false);
  };

  const canEditUsername = !lastUsernameChange || (Date.now() - lastUsernameChange > 24 * 60 * 60 * 1000);

  return (
    <AppContainer>
      <Header title="COMEDY KINGS" subtitle={`WELCOME, ${username || currentUser.email}!`}/>
      <RetroWindow title={`PROFILE.EXE`}>
        <Content>
          {/* Profile Picture */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
            <img
              src={`https://api.dicebear.com/7.x/pixel-art-neutral/svg?seed=${encodeURIComponent(username)}&skinColor=${profilePictureOptions.skinColor}&eyes=${profilePictureOptions.eyes}&mouth=${profilePictureOptions.mouth}`}
              alt="profile"
              style={{ width: 100, height: 100, borderRadius: '50%', border: '3px solid #ffcc00', marginBottom: 12, background: '#111' }}
            />
            {editMode && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 24, alignItems: 'center' }}>
                {/* Skin Color */}
                <div style={{ marginBottom: 12, width: '100%', maxWidth: 400 }}>
                  <div style={{ color: '#ffcc00', fontFamily: 'VT323', fontSize: 18, marginBottom: 8 }}>Skin Color</div>
                  <div style={{ display: 'flex', gap: 18, justifyContent: 'center' }}>
                    {SKIN_COLORS.map(c => (
                      <div
                        key={c}
                        onClick={() => setProfilePictureOptions(o => ({ ...o, skinColor: c }))}
                        style={{
                          width: 32, height: 32, borderRadius: '50%', background: `#${c}`,
                          border: profilePictureOptions.skinColor === c ? '4px solid #ffcc00' : '2px solid #333',
                          cursor: 'pointer', marginRight: 0
                        }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
                {/* Eyes */}
                <div style={{ marginBottom: 12, width: '100%', maxWidth: 600 }}>
                  <div style={{ color: '#ffcc00', fontFamily: 'VT323', fontSize: 18, marginBottom: 8 }}>Eyes</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                    {EYES_TYPES.map(e => (
                      <div
                        key={e}
                        onClick={() => setProfilePictureOptions(o => ({ ...o, eyes: e }))}
                        style={{
                          padding: '6px 18px',
                          borderRadius: 8,
                          background: profilePictureOptions.eyes === e ? '#ffcc00' : '#232323',
                          color: profilePictureOptions.eyes === e ? '#232323' : '#ffcc00',
                          border: '2px solid #333',
                          cursor: 'pointer',
                          fontFamily: 'VT323', fontSize: 18, marginRight: 0, marginBottom: 6
                        }}
                        title={e}
                      >{e}</div>
                    ))}
                  </div>
                </div>
                {/* Mouth */}
                <div style={{ marginBottom: 12, width: '100%', maxWidth: 700 }}>
                  <div style={{ color: '#ffcc00', fontFamily: 'VT323', fontSize: 18, marginBottom: 8 }}>Mouth</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                    {MOUTH_TYPES.map(m => (
                      <div
                        key={m}
                        onClick={() => setProfilePictureOptions(o => ({ ...o, mouth: m }))}
                        style={{
                          padding: '6px 18px',
                          borderRadius: 8,
                          background: profilePictureOptions.mouth === m ? '#ffcc00' : '#232323',
                          color: profilePictureOptions.mouth === m ? '#232323' : '#ffcc00',
                          border: '2px solid #333',
                          cursor: 'pointer',
                          fontFamily: 'VT323', fontSize: 18, marginRight: 0, marginBottom: 6
                        }}
                        title={m}
                      >{m}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Username Edit */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            {editMode ? (
              <>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  maxLength={18}
                  style={{ fontSize: 20, padding: 4, borderRadius: 4, width: 180, textAlign: 'center' }}
                  disabled={!canEditUsername || loadingSave}
                />
                <RetroButton
                  title="Save Username"
                  onClick={handleUsernameChange}
                  disabled={!canEditUsername || loadingSave}
                  style={{ marginLeft: 8 }}
                />
                {!canEditUsername && (
                  <div style={{ color: '#ff6666', fontSize: 14, marginTop: 4 }}>
                    You can only change your username once every 24 hours.
                  </div>
                )}
              </>
            ) : (
              <UsernameDisplay>@{username}</UsernameDisplay>
            )}
          </div>

          {/* Editable Bio & Location */}
          <StatsSection>
            <StatsTitle>PROFILE SETTINGS</StatsTitle>
            <StatsRow>
              <StatsLabel>Bio:</StatsLabel>
              <StatsValue style={{ width: 220 }}>
                {editMode ? (
                  <textarea
                    value={bio}
                    onChange={e => setBioState(e.target.value)}
                    rows={2}
                    maxLength={80}
                    style={{ width: '100%', fontFamily: 'inherit', fontSize: 16 }}
                  />
                ) : (
                  bio || <span style={{ color: '#888' }}>No bio set</span>
                )}
              </StatsValue>
            </StatsRow>
            <StatsRow>
              <StatsLabel>Location:</StatsLabel>
              <StatsValue>
                {editMode ? (
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocationState(e.target.value)}
                    maxLength={32}
                    style={{ fontSize: 16, width: 120 }}
                  />
                ) : (
                  location || <span style={{ color: '#888' }}>No location set</span>
                )}
              </StatsValue>
            </StatsRow>
            {editMode && (
              <div style={{ marginTop: 8 }}>
                <RetroButton title={loadingSave ? 'Saving...' : 'Save Profile'} onClick={handleSave} disabled={loadingSave} />
              </div>
            )}
            {feedback && <div style={{ color: '#33ff33', marginTop: 8 }}>{feedback}</div>}
          </StatsSection>

          {/* Account Info */}
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

          {/* Stats */}
          <StatsSection>
            <StatsTitle>STATS</StatsTitle>
            <StatsRow>
              <StatsLabel>Member Since:</StatsLabel>
              <StatsValue>{new Date(currentUser.metadata.creationTime || '').toLocaleDateString()}</StatsValue>
            </StatsRow>
          </StatsSection>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <RetroButton title={editMode ? 'Cancel' : 'Edit Profile'} onClick={() => setEditMode(e => !e)} />
            <RetroButton title="LOGOUT" onClick={handleLogout} />
          </div>
        </Content>
      </RetroWindow>
    </AppContainer>
  );

  // Fallback: if nothing rendered, show debug info
  return (
    <div style={{ color: 'red', padding: 32, fontFamily: 'monospace' }}>
      <h2>ProfilePage: Unexpected empty render</h2>
      <div>authLoading: {String(authLoading)}</div>
      <div>currentUser: {currentUser ? JSON.stringify(currentUser) : 'null'}</div>
    </div>
  );
};

export default ProfilePage; 