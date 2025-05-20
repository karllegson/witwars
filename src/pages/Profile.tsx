import React, { useState, useEffect } from 'react';
import { createAvatar } from '@dicebear/core';
import { pixelArt } from '@dicebear/collection';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { setUsernameWithCooldown, setProfilePicture, setBio, setLocation, UserProfile } from '../utils/friendService';

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
  margin-right: 12px;
`;

const StatsValue = styled.div`
  font-family: 'VT323', monospace;
  font-size: 18px;
  color: #fff;
`;

const BgColor = styled.div`
  font-family: 'VT323', monospace;
  font-size: 18px;
  color: #fff;
`;

const SpinnerAnimation = styled.div`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  &.avatar-spinner {
    animation: spin 1s linear infinite;
  }
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

// Avatar customization options type
type SkinColor =
  | 'ffdbac'
  | 'f5cfa0'
  | 'eac393'
  | 'e0b687'
  | 'cb9e6e'
  | 'b68655'
  | 'a26d3d'
  | '8d5524';
type HairStyle =
  | 'short24' | 'short23' | 'short22' | 'short21' | 'short20' | 'short19' | 'short18' | 'short17' | 'short16' | 'short15' | 'short14' | 'short13' | 'short12' | 'short11' | 'short10' | 'short09' | 'short08' | 'short07' | 'short06' | 'short05' | 'short04' | 'short03' | 'short02' | 'short01'
  | 'long21' | 'long20' | 'long19' | 'long18' | 'long17' | 'long16' | 'long15' | 'long14' | 'long13' | 'long12' | 'long11' | 'long10' | 'long09' | 'long08' | 'long07' | 'long06' | 'long05' | 'long04' | 'long03' | 'long02' | 'long01';
type HairColor =
  | 'cab188'
  | '603a14'
  | '83623b'
  | 'a78961'
  | '611c17'
  | '603015'
  | '612616'
  | '28150a'
  | '009bbd'
  | 'bd1700'
  | '91cb15'
  | '000000';
type EyeStyle =
  | 'variant12'
  | 'variant11'
  | 'variant10'
  | 'variant09'
  | 'variant08'
  | 'variant07'
  | 'variant06'
  | 'variant05'
  | 'variant04'
  | 'variant03'
  | 'variant02'
  | 'variant01';
type MouthExpression =
  | 'sad10' | 'sad09' | 'sad08' | 'sad07' | 'sad06' | 'sad05' | 'sad04' | 'sad03' | 'sad02' | 'sad01'
  | 'happy13' | 'happy12' | 'happy11' | 'happy10' | 'happy09' | 'happy08' | 'happy07' | 'happy06' | 'happy05' | 'happy04' | 'happy03' | 'happy02' | 'happy01';
type Clothing =
  | 'variant23' | 'variant22' | 'variant21' | 'variant20' | 'variant19' | 'variant18' | 'variant17' | 'variant16' | 'variant15' | 'variant14' | 'variant13' | 'variant12' | 'variant11' | 'variant10' | 'variant09' | 'variant08' | 'variant07' | 'variant06' | 'variant05' | 'variant04' | 'variant03' | 'variant02' | 'variant01';
type Accessory = 'variant04' | 'variant03' | 'variant02' | 'variant01' | 'none';
type BgColor = 'b6e3f4' | 'c0aede' | 'd1d4f9' | 'ffd5dc' | 'fffadd' | 'ffdfbf' | 'transparent';

export interface AvatarOptions {
  skinColor: SkinColor;
  hair: HairStyle;
  hairColor: HairColor;
  eyes: EyeStyle;
  mouth: MouthExpression;
  clothing: Clothing;
  accessories: Accessory;
  backgroundColor: BgColor;
}

// Avatar category icons for the customizer bar
const CATEGORY_ICONS: { key: string; icon: JSX.Element; label: string }[] = [
  {
    key: 'skinColor',
    icon: (
      // Modern hand/palette for skin
      <svg width="24" height="24" viewBox="0 0 24 24"><path d="M6 14c0-2 2-6 6-6s6 4 6 6c0 2-2 4-6 4s-6-2-6-4z" fill="#e2bc8a" stroke="#222" strokeWidth="1.5"/><ellipse cx="12" cy="17" rx="2" ry="1" fill="#fff" opacity=".2"/></svg>
    ),
    label: 'Skin',
  },
  {
    key: 'hair',
    icon: (
      // Modern hair strand for hair
      <svg width="24" height="24" viewBox="0 0 24 24"><path d="M7 17c2-7 8-7 10 0" stroke="#6a4e2a" strokeWidth="2" fill="none"/><path d="M10 10c1-2 4-2 5 0" stroke="#b58143" strokeWidth="1.5" fill="none"/></svg>
    ),
    label: 'Hair',
  },
  {
    key: 'hairColor',
    icon: (
      // Modern paint bucket for hair color
      <svg width="24" height="24" viewBox="0 0 24 24"><rect x="6" y="8" width="8" height="6" rx="2" fill="#1976d2" stroke="#222" strokeWidth="1.2"/><rect x="8" y="14" width="6" height="3" rx="1.5" fill="#f4d19b" stroke="#222" strokeWidth="1.2"/><ellipse cx="12" cy="20" rx="2" ry="1" fill="#e2bc8a" stroke="#222" strokeWidth="1.2"/></svg>
    ),
    label: 'Hair Color',
  },
  {
    key: 'eyes',
    icon: (
      // Modern eye for eyes
      <svg width="24" height="24" viewBox="0 0 24 24"><ellipse cx="12" cy="14" rx="7" ry="4" fill="#fff" stroke="#222" strokeWidth="1.5"/><circle cx="12" cy="14" r="2" fill="#222"/></svg>
    ),
    label: 'Eyes',
  },
  {
    key: 'mouth',
    icon: (
      // Modern lips/smile for mouth
      <svg width="24" height="24" viewBox="0 0 24 24"><path d="M7 15c2 2 6 2 10 0" stroke="#e57373" strokeWidth="1.5" fill="none"/><ellipse cx="12" cy="17" rx="4" ry="1.5" fill="#e57373"/></svg>
    ),
    label: 'Mouth',
  },
  {
    key: 'clothing',
    icon: (
      // Modern t-shirt for clothing
      <svg width="24" height="24" viewBox="0 0 24 24"><rect x="8" y="8" width="8" height="10" rx="2" fill="#90caf9" stroke="#222" strokeWidth="1.5"/><rect x="6" y="6" width="4" height="4" rx="1" fill="#90caf9" stroke="#222" strokeWidth="1.5"/><rect x="14" y="6" width="4" height="4" rx="1" fill="#90caf9" stroke="#222" strokeWidth="1.5"/></svg>
    ),
    label: 'Clothes',
  },
  {
    key: 'accessories',
    icon: (
      // Modern glasses/star for accessories
      <svg width="24" height="24" viewBox="0 0 24 24"><circle cx="9" cy="15" r="2" fill="#ffd600" stroke="#222" strokeWidth="1.2"/><circle cx="15" cy="15" r="2" fill="#ffd600" stroke="#222" strokeWidth="1.2"/><rect x="11" y="15" width="2" height="1" fill="#222"/><polygon points="12,6 13,10 17,10 14,13 15,17 12,15 9,17 10,13 7,10 11,10" fill="#ffd600" stroke="#222" strokeWidth="1.2" opacity=".7"/></svg>
    ),
    label: 'Accessory',
  },
  {
    key: 'backgroundColor',
    icon: (
      // Modern landscape for background
      <svg width="24" height="24" viewBox="0 0 24 24"><rect x="2" y="16" width="20" height="6" fill="#a5d6a7"/><polygon points="4,16 8,10 12,16" fill="#388e3c"/><circle cx="18" cy="10" r="2" fill="#ffd600"/></svg>
    ),
    label: 'Background',
  },
];

const ProfilePage: React.FC = () => {
  // Category selection for avatar UI
  const [selectedCategory, setSelectedCategory] = useState<string>('skinColor');
  const [editingProfile, setEditingProfile] = useState(false);
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>('');
  const [bio, setBioState] = useState<string>('');
  const [location, setLocationState] = useState<string>('');
  const [votes, setVotes] = useState<number>(0);
  const [lastUsernameChange, setLastUsernameChange] = useState<number | null>(null);
  const [loadingSave, setLoadingSave] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [editMode, setEditMode] = useState(false);

  // Basic avatar customization categories
  // DiceBear pixel-art valid options (v9.x)
  // DiceBear pixel-art options (official)
  const SKIN_COLORS: SkinColor[] = [
  'ffdbac', 'f5cfa0', 'e0b687', 'cb9e6e', 'a26d3d', '8d5524'
];
const HAIR_STYLES: HairStyle[] = [
  'short24', 'short12', 'short01', 'long21', 'long10', 'long01', 'short18', 'long16',
  'short20', 'short22', 'short06', 'short08', 'long05', 'long07', 'long15', 'long18'
];
const HAIR_COLORS: HairColor[] = [
  'cab188', '603a14', '009bbd', 'a78961', '83623b', 
  '612616', '28150a', '91cb15', 'bd1700', '611c17', '000000'
];
const EYE_STYLES: EyeStyle[] = [
  'variant12', 'variant09', 'variant07', 'variant03', 'variant01'
];
const MOUTH_EXPRESSIONS: MouthExpression[] = [
  'sad01', 'happy13', 'happy01', 'sad08', 'happy09', 'happy07'
];
const CLOTHING: Clothing[] = [
  'variant23', 'variant17', 'variant12', 'variant09', 'variant01'
];
const ACCESSORIES: (Accessory | 'none')[] = [
  'none', 'variant04', 'variant03', 'variant02', 'variant01'
];
const BG_COLORS: BgColor[] = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'fffadd', 'ffdfbf', 'transparent'];

  const initialAvatarOptions: AvatarOptions = {
  skinColor: SKIN_COLORS[0],
  hair: HAIR_STYLES[0],
  hairColor: HAIR_COLORS[0],
  eyes: EYE_STYLES[0],
  mouth: MOUTH_EXPRESSIONS[0],
  clothing: CLOTHING[0],
  accessories: 'none',
  backgroundColor: BG_COLORS[0],
};
  const [profilePictureOptions, setProfilePictureOptions] = useState<AvatarOptions>(initialAvatarOptions);
  const [profileDataLoaded, setProfileDataLoaded] = useState<boolean>(false);

  // Define base attributes for trait previews directly
  const BASE_PREVIEW_SEED = 'traitPreview';
  const BASE_PREVIEW_SKIN_COLOR: SkinColor = SKIN_COLORS[1]; // A neutral skin tone
  const BASE_PREVIEW_EYES: EyeStyle = EYE_STYLES[EYE_STYLES.length - 1]; // A simple eye style
  const BASE_PREVIEW_MOUTH: MouthExpression = MOUTH_EXPRESSIONS[MOUTH_EXPRESSIONS.length - 1]; // A simple mouth style
  const BASE_PREVIEW_BG_COLOR: BgColor = 'transparent'; // Transparent background for previews
  // No default hair, clothing, accessories, hairColor for base previews unless specified

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          setUsername(data.username);
          setBioState(data.bio || '');
          setLocationState(data.location || '');
          // Set votes count - default to 0 if not set
          setVotes(data.votes || 0);
          // Load saved avatar options with robust handling for accessories
          try {
            const loadedOptionsString = data.profilePicture;
            if (loadedOptionsString) {
              const parsedOptions = JSON.parse(loadedOptionsString) as Partial<AvatarOptions>;
              setProfilePictureOptions({
                ...initialAvatarOptions,
                ...parsedOptions,
                accessories: parsedOptions.accessories || 'none',
              });
            } else {
              setProfilePictureOptions(initialAvatarOptions); // No saved options, use initial
            }
          } catch (error) {
            console.error("Error parsing profilePicture options:", error);
            setProfilePictureOptions(initialAvatarOptions); // Fallback on error
          }
          // Mark profile data as loaded
          setProfileDataLoaded(true);
        }
      }
    };
    fetchUserData();
  }, [currentUser]); // initialAvatarOptions is stable, no need to add to deps array unless it changes

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout.");
    }
  };

  const handleSave = async () => {
    console.log("handleSave: Initiated");
    if (!currentUser) {
      console.error("handleSave: No current user. Aborting save.");
      setFeedback("Error: Not logged in. Cannot save.");
      setLoadingSave(false); // Ensure loading state is reset
      return;
    }
    console.log(`handleSave: User ID: ${currentUser.uid}`);
    console.log("handleSave: Current profilePictureOptions to be saved:", JSON.stringify(profilePictureOptions, null, 2));

    setLoadingSave(true);
    setFeedback(''); // Clear previous feedback

    try {
      // Sanitize the options to ensure only valid AvatarOptions fields are saved
      const {
        skinColor,
        hair,
        hairColor,
        eyes,
        mouth,
        clothing,
        accessories,
        backgroundColor
      } = profilePictureOptions;

      const optionsToSave: AvatarOptions = {
        skinColor,
        hair,
        hairColor,
        eyes,
        mouth,
        clothing,
        accessories,
        backgroundColor
      };

      console.log("handleSave: Attempting to call setProfilePicture with sanitized options:", JSON.stringify(optionsToSave, null, 2));
      // Store the optionsToSave directly rather than stringifying it
      // This creates a consistent format that other components can use
      const profilePicData = JSON.stringify(optionsToSave);
      await setProfilePicture(currentUser.uid, profilePicData);
      console.log("handleSave: setProfilePicture call completed with data:", profilePicData);

      // The `editMode` check is only for bio/location, avatar options are saved above regardless.
      if (editMode) {
        console.log("handleSave: editMode is true. Attempting to save bio and location...");
        await setBio(currentUser.uid, bio);
        await setLocation(currentUser.uid, location);
        console.log("handleSave: Bio and location save calls completed.");
      } else {
        console.log("handleSave: editMode is false. Skipping bio/location save for this operation.");
      }

      setFeedback('Profile updated successfully!');
      console.log("handleSave: UI feedback set to 'Profile updated successfully!'");

    } catch (e: any) {
      console.error("handleSave: Error during save operation:", e);
      setFeedback(e.message || 'Failed to update profile. Check console for details.');
    } finally {
      setLoadingSave(false);
      console.log("handleSave: setLoadingSave(false) executed. Save process finished.");
    }
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

  if (authLoading) {
    return (
      <AppContainer>
        <Header title="Comedy Legend" subtitle="YOUR PROFILE" />
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
        <Header title="Comedy Legend" subtitle="JOIN THE STAGE" />
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
      <Header title="Comedy Legend" subtitle={`WELCOME, ${username || currentUser.email}!`}/>
      <RetroWindow title={`PROFILE.EXE`}>
        <Content>
          {/* Profile Picture & Customizer Container */}
          <div style={{ width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto 16px auto', padding: '8px 0' }}>
            {/* Avatar SVG Preview (always shown) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 10 }}>
              {!profileDataLoaded ? (
                // Loading spinner while profile data is loading
                <div 
                  style={{ 
                    width: 110, 
                    height: 110, 
                    borderRadius: '50%', 
                    border: '3px solid #ffcc00', 
                    marginBottom: 14, 
                    background: '#111', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center'
                  }}
                >
                  <SpinnerAnimation className="avatar-spinner" style={{
                    width: 40,
                    height: 40,
                    border: '4px solid rgba(255, 204, 0, 0.3)',
                    borderTop: '4px solid #ffcc00',
                    borderRadius: '50%'
                  }} />
                </div>
              ) : (
                // Once profile data is loaded, show the actual avatar
                (() => {
                  try {
                    const svg = createAvatar(pixelArt, {
                      seed: currentUser?.uid || 'user', // Use UID for consistent avatar generation
                      backgroundColor: [profilePictureOptions.backgroundColor],
                      skinColor: [profilePictureOptions.skinColor],
                      hair: [profilePictureOptions.hair],
                      hairColor: [profilePictureOptions.hairColor],
                      eyes: [profilePictureOptions.eyes],
                      mouth: [profilePictureOptions.mouth],
                      clothing: [profilePictureOptions.clothing],
                      accessories: profilePictureOptions.accessories === 'none' ? [] : [profilePictureOptions.accessories],
                    }).toString();
                    return (
                      <div
                        style={{ width: 110, height: 110, borderRadius: '50%', border: '3px solid #ffcc00', marginBottom: 14, background: '#111', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        dangerouslySetInnerHTML={{ __html: svg }}
                      />
                    );
                  } catch (e) {
                    console.error("Avatar creation error:", e);
                    return <div style={{ color: 'red', width: 110, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid red', borderRadius: '50%' }}>Avatar Error</div>;
                  }
                })()
              )}
            </div>

            {/* Edit Avatar Button (only shows if not editingProfile) */}
            {!editingProfile && !editMode && (
              <RetroButton title="Edit Avatar" onClick={() => setEditingProfile(true)} style={{ marginBottom: 10 }} />
            )}

            {/* Avatar Customization UI (only shows if editingProfile is true) */}
            {editingProfile && (
              <>
                {/* Category Icons Bar */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
                  {CATEGORY_ICONS.map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      style={{
                        background: selectedCategory === cat.key ? '#ffcc00' : '#333',
                        border: selectedCategory === cat.key ? '2px solid #fff' : '2px solid #555',
                        borderRadius: 8,
                        padding: '5px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: 70
                      }}
                      title={cat.label}
                    >
                      <div style={{ width: 24, height: 24 }}>{cat.icon}</div>
                      <span style={{ fontSize: 10, color: selectedCategory === cat.key ? '#111' : '#ccc', marginTop: 3 }}>{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Category Heading */}
                <div style={{ fontFamily: 'Press Start 2P', fontSize: 14, color: '#ffcc00', textAlign: 'center', marginBottom: 10 }}>
                  {CATEGORY_ICONS.find(c => c.key === selectedCategory)?.label || 'Select Category'}
                </div>

                {/* Trait Selector Options (horizontal, wrapped) */}
                <div style={{ display: 'flex', flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 10, width: '100%' }}>
                  {selectedCategory === 'skinColor' && SKIN_COLORS.map(s => (
                    <button key={s} onClick={() => setProfilePictureOptions(o => ({ ...o, skinColor: s }))}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        border: profilePictureOptions.skinColor === s ? '3px solid #ffcc00' : '2px solid #444',
                        background: `#${s}`,
                        cursor: 'pointer',
                        margin: 2
                      }}
                      title={s}
                    />
                  ))}
                  {selectedCategory === 'hair' && HAIR_STYLES.map(h_style => {
                    try {
                      const previewSvg = createAvatar(pixelArt, {
                        seed: BASE_PREVIEW_SEED,
                        skinColor: [BASE_PREVIEW_SKIN_COLOR],
                        eyes: [BASE_PREVIEW_EYES],
                        mouth: [BASE_PREVIEW_MOUTH],
                        backgroundColor: [BASE_PREVIEW_BG_COLOR],
                        hair: [h_style],
                      }).toString();
                      return (
                        <button key={h_style} onClick={() => setProfilePictureOptions(o => ({ ...o, hair: h_style }))}
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 8,
                            border: profilePictureOptions.hair === h_style ? '3px solid #ffcc00' : '2px solid #444',
                            background: '#232323',
                            padding: 2,
                            cursor: 'pointer',
                            margin: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title={h_style}
                        >
                          <div dangerouslySetInnerHTML={{ __html: previewSvg }} style={{ width: 30, height: 30, transform: 'scale(1.5)' }} />
                        </button>
                      );
                    } catch (e) {
                      console.error('Hair preview error:', e);
                      return <div style={{ width: 38, height: 38, border: '1px dashed red', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Err</div>;
                    }
                  })}
                  {selectedCategory === 'hairColor' && HAIR_COLORS.map(hc => (
                    <button key={hc} onClick={() => setProfilePictureOptions(o => ({ ...o, hairColor: hc }))}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        border: profilePictureOptions.hairColor === hc ? '3px solid #ffcc00' : '2px solid #444',
                        background: `#${hc}`,
                        cursor: 'pointer',
                        margin: 2
                      }}
                      title={hc}
                    />
                  ))}
                  {selectedCategory === 'eyes' && EYE_STYLES.map(e_style => {
                    try {
                      const previewSvg = createAvatar(pixelArt, {
                        seed: BASE_PREVIEW_SEED,
                        skinColor: [BASE_PREVIEW_SKIN_COLOR],
                        mouth: [BASE_PREVIEW_MOUTH],
                        backgroundColor: [BASE_PREVIEW_BG_COLOR],
                        eyes: [e_style],
                      }).toString();
                      return (
                        <button key={e_style} onClick={() => setProfilePictureOptions(o => ({ ...o, eyes: e_style }))}
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 8,
                            border: profilePictureOptions.eyes === e_style ? '3px solid #ffcc00' : '2px solid #444',
                            background: '#232323',
                            padding: 2,
                            cursor: 'pointer',
                            margin: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title={e_style}
                        >
                          <div dangerouslySetInnerHTML={{ __html: previewSvg }} style={{ width: 30, height: 30, transform: 'scale(1.5)' }} />
                        </button>
                      );
                    } catch (e) {
                      console.error('Eyes preview error:', e);
                      return <div style={{ width: 38, height: 38, border: '1px dashed red', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Err</div>;
                    }
                  })}
                  {selectedCategory === 'mouth' && MOUTH_EXPRESSIONS.map(m_style => {
                    try {
                      const previewSvg = createAvatar(pixelArt, {
                        seed: BASE_PREVIEW_SEED,
                        skinColor: [BASE_PREVIEW_SKIN_COLOR],
                        eyes: [BASE_PREVIEW_EYES],
                        backgroundColor: [BASE_PREVIEW_BG_COLOR],
                        mouth: [m_style],
                      }).toString();
                      return (
                        <button key={m_style} onClick={() => setProfilePictureOptions(o => ({ ...o, mouth: m_style }))}
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 8,
                            border: profilePictureOptions.mouth === m_style ? '3px solid #ffcc00' : '2px solid #444',
                            background: '#232323',
                            padding: 2,
                            cursor: 'pointer',
                            margin: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title={m_style}
                        >
                          <div dangerouslySetInnerHTML={{ __html: previewSvg }} style={{ width: 30, height: 30, transform: 'scale(1.5)' }} />
                        </button>
                      );
                    } catch (e) {
                      console.error('Mouth preview error:', e);
                      return <div style={{ width: 38, height: 38, border: '1px dashed red', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Err</div>;
                    }
                  })}
                  {selectedCategory === 'clothing' && CLOTHING.map(cl_style => {
                    try {
                      const previewSvg = createAvatar(pixelArt, {
                        seed: BASE_PREVIEW_SEED,
                        skinColor: [BASE_PREVIEW_SKIN_COLOR],
                        eyes: [BASE_PREVIEW_EYES],
                        mouth: [BASE_PREVIEW_MOUTH],
                        backgroundColor: [BASE_PREVIEW_BG_COLOR],
                        clothing: [cl_style],
                      }).toString();
                      return (
                        <button key={cl_style} onClick={() => setProfilePictureOptions(o => ({ ...o, clothing: cl_style }))}
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 8,
                            border: profilePictureOptions.clothing === cl_style ? '3px solid #ffcc00' : '2px solid #444',
                            background: '#232323',
                            padding: 2,
                            cursor: 'pointer',
                            margin: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title={cl_style}
                        >
                          <div dangerouslySetInnerHTML={{ __html: previewSvg }} style={{ width: 30, height: 30, transform: 'scale(1.5)' }} />
                        </button>
                      );
                    } catch (e) {
                      console.error('Clothing preview error:', e);
                      return <div style={{ width: 38, height: 38, border: '1px dashed red', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Err</div>;
                    }
                  })}
                  {selectedCategory === 'accessories' && ACCESSORIES.map(accessory => {
                    try {
                      // For 'none', show a simple icon
                      if (accessory === 'none') {
                        return (
                          <button 
                            key="no-accessory" 
                            onClick={() => setProfilePictureOptions(o => ({ ...o, accessories: 'none' }))} 
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 8,
                              border: profilePictureOptions.accessories === 'none' ? '3px solid #ffcc00' : '2px solid #444',
                              background: '#232323',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 20,
                              color: '#ccc',
                              cursor: 'pointer',
                              margin: 2
                            }}
                          >
                            ❌
                          </button>
                        );
                      }
                      
                      // For normal accessories, show preview
                      const previewSvg = createAvatar(pixelArt, {
                        seed: BASE_PREVIEW_SEED,
                        skinColor: [BASE_PREVIEW_SKIN_COLOR],
                        eyes: [BASE_PREVIEW_EYES],
                        mouth: [BASE_PREVIEW_MOUTH],
                        backgroundColor: [BASE_PREVIEW_BG_COLOR],
                        accessories: [accessory],
                      }).toString();
                      
                      return (
                        <button 
                          key={accessory} 
                          onClick={() => setProfilePictureOptions(o => ({ ...o, accessories: accessory }))} 
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 8,
                            border: profilePictureOptions.accessories === accessory ? '3px solid #ffcc00' : '2px solid #444',
                            background: '#232323',
                            padding: 2,
                            cursor: 'pointer',
                            margin: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title={accessory}
                        >
                          <div dangerouslySetInnerHTML={{ __html: previewSvg }} style={{ width: 30, height: 30, transform: 'scale(1.5)' }} />
                        </button>
                      );
                    } catch (e) {
                      console.error('Accessory preview error:', e);
                      return <div style={{ width: 38, height: 38, border: '1px dashed red', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Err</div>;
                    }
                  })}
                  {selectedCategory === 'backgroundColor' && BG_COLORS.map(c => (
                    <button key={c} onClick={() => setProfilePictureOptions(o => ({ ...o, backgroundColor: c }))}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        border: profilePictureOptions.backgroundColor === c ? '3px solid #ffcc00' : '2px solid #444',
                        background: c === 'transparent' ? 'repeating-linear-gradient(45deg, #bbb 0 10px, #fff 10px 20px)' : `#${c}`,
                        cursor: 'pointer',
                        margin: 2
                      }}
                      title={c}
                    />
                  ))}
                </div>
                <RetroButton
                  title={loadingSave ? "Saving..." : "Done Editing Avatar"}
                  onClick={() => {
                    if (loadingSave) return; // Prevent action if already saving
                    handleSave().finally(() => {
                      setEditingProfile(false); // Close editor after save attempt (success or fail)
                    });
                  }}
                  disabled={loadingSave}
                  style={{ marginTop: 10 }}
                />
              </>
            )}
          </div> {/* End of Profile Picture & Customizer Container */}

          {/* Username Edit Section - Correctly placed after avatar customizer */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            {editMode && !editingProfile ? (
              <>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  maxLength={16}
                  style={{
                    fontFamily: 'VT323',
                    fontSize: 24,
                    padding: 8,
                    borderRadius: 4,
                    border: '1px solid #333',
                    marginRight: 8,
                    background: '#222',
                    color: '#fff',
                    width: 180
                  }}
                  disabled={!canEditUsername || loadingSave}
                />
                <RetroButton
                  title="Update"
                  onClick={handleUsernameChange}
                  style={{ marginLeft: 8, fontSize: 20, padding: '8px 18px' }}
                  disabled={!canEditUsername || loadingSave}
                />
              </>
            ) : (
              !editingProfile && <UsernameDisplay>{username}</UsernameDisplay>
            )}
          </div>

          {/* Editable Bio & Location (only if editMode and not editingProfile) */}
          {editMode && !editingProfile && (
            <StatsSection>
              <StatsTitle>PROFILE SETTINGS</StatsTitle>
              <StatsRow>
                <StatsLabel>Bio:</StatsLabel>
                <StatsValue style={{ width: 220 }}>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <textarea
                      value={bio}
                      onChange={e => setBioState(e.target.value)}
                      rows={2}
                      maxLength={80}
                      style={{
                        width: '100%',
                        fontFamily: 'inherit',
                        fontSize: 16,
                        background: '#2b2b2b',
                        color: '#eee',
                        border: '1px solid #444',
                        resize: 'none',
                        paddingBottom: '16px'
                      }}
                    />
                    <div style={{ position: 'absolute', bottom: '0', right: '5px', fontSize: '12px', color: '#999' }}>
                      {bio ? bio.length : 0}/80
                    </div>
                  </div>
                </StatsValue>
              </StatsRow>
              <StatsRow>
                <StatsLabel>Location:</StatsLabel>
                <StatsValue>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocationState(e.target.value)}
                    maxLength={32}
                    style={{
                      fontSize: 16,
                      width: 120,
                      background: '#2b2b2b',
                      color: '#eee',
                      border: '1px solid #444'
                    }}
                  />
                </StatsValue>
              </StatsRow>

            </StatsSection>
          )}
          {feedback && <div style={{ color: feedback.startsWith('Failed') || feedback.startsWith('Error') ? '#ff6b6b' : '#33ff33', marginTop: 8, textAlign: 'center', fontFamily: 'VT323', fontSize: 16 }}>{feedback}</div>}

          {/* Account Info (Always visible if not editing full profile) */}
          {!editMode && !editingProfile && (
            <StatsSection>
              <StatsTitle>ACCOUNT INFO</StatsTitle>
              <StatsRow>
                <StatsLabel>Bio:</StatsLabel>
                <StatsValue style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bio || <span style={{ color: '#888' }}>No bio set</span>}</StatsValue>
              </StatsRow>
              <StatsRow>
                <StatsLabel>Location:</StatsLabel>
                <StatsValue>{location || <span style={{ color: '#888' }}>No location set</span>}</StatsValue>
              </StatsRow>
              <StatsRow>
                <StatsLabel>Email:</StatsLabel>
                <StatsValue>{currentUser?.email}</StatsValue>
              </StatsRow>
            </StatsSection>
          )}

          {/* Stats (Always visible if not editing full profile) */}
          {!editMode && !editingProfile && (
            <StatsSection>
              <StatsTitle>STATS</StatsTitle>
              <StatsRow>
                <StatsLabel>Member Since:</StatsLabel>
                <StatsValue>{new Date(currentUser.metadata.creationTime || Date.now()).toLocaleDateString()}</StatsValue>
              </StatsRow>
              <StatsRow>
                <StatsLabel>Votes:</StatsLabel>
                <StatsValue>{votes}</StatsValue>
              </StatsRow>
              {/* Add more stats here if needed */}
            </StatsSection>
          )}

          {/* Main Control Buttons (Edit/Save Full Profile & Logout) */}
          {!editingProfile && ( // Hide these if customizing avatar
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: 24 }}>
              <RetroButton
                title={editMode ? 'Save' : 'Edit Profile'}
                onClick={() => { 
                  if (editMode) {
                    // If in edit mode and clicking save, trigger the save functionality
                    handleSave();
                  }
                  // Toggle edit mode either way
                  setEditMode(e => !e); 
                  setFeedback(''); // Clear feedback when toggling edit mode
                }}
              />
              <RetroButton title="LOGOUT" onClick={handleLogout} />
            </div>
          )}
          

        </Content>
      </RetroWindow>
      
      {/* Small Report a Problem button outside the RetroWindow */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, marginBottom: 24 }}>
        <button 
          onClick={() => alert('Problem report submitted!')}
          style={{ 
            fontSize: '12px', 
            color: '#999', 
            background: 'transparent', 
            border: '1px solid #444',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'VT323, monospace'
          }}
        >
          Report a Problem
        </button>
      </div>
    </AppContainer>
  );
};

export default ProfilePage;