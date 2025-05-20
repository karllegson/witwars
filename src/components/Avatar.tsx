import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { createAvatar } from '@dicebear/core';
import { pixelArt } from '@dicebear/collection';
import { getTopRankedUserId } from '../utils/rankingUtils';

interface AvatarProps {
  profilePicture?: string | any;  // Accept any type to handle all cases
  username: string;
  size?: number;
  userId?: string; // Add userId for stable avatar generation
}

const AvatarContainer = styled.div<{ size: number; bgColor: string }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  background: ${props => props.bgColor};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #444;
  flex-shrink: 0;
  position: relative;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarInitial = styled.div<{ size: number }>`
  font-family: 'VT323', monospace;
  font-size: ${props => Math.floor(props.size * 0.6)}px;
  color: #fff;
  text-transform: uppercase;
  font-weight: bold;
`;

// Crown is now implemented directly in the component return

// Generate a consistent color based on username
const getColorFromUsername = (username: string): string => {
  if (!username) return '#333';
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert to hex color - use darker colors for better contrast with white text
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 35%)`;
};

export default function Avatar({ profilePicture, username, userId, size = 40 }: AvatarProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isTopRanked, setIsTopRanked] = useState(false);
  const firstInitial = username ? username.charAt(0).toUpperCase() : '?';
  const bgColor = getColorFromUsername(username);
  
  // Check if this user is the top-ranked user
  useEffect(() => {
    if (userId) {
      const checkTopRanked = async () => {
        try {
          const topUserId = await getTopRankedUserId();
          console.log('Avatar component - comparing UIDs:', {
            thisUserId: userId,
            topUserId: topUserId,
            isMatch: userId === topUserId
          });
          setIsTopRanked(userId === topUserId);
        } catch (error) {
          console.error('Error checking top ranked user:', error);
          setIsTopRanked(false);
        }
      };
      checkTopRanked();
    }
  }, [userId]);

  // Process the profile picture data on component mount and when it changes
  useEffect(() => {
    const generateAvatar = async () => {
      try {
        // If profilePicture is a direct data URL, use it as is
        if (typeof profilePicture === 'string' && profilePicture.startsWith('data:')) {
          setImageUrl(profilePicture);
          return;
        }
        
        // Default avatar settings
        let parsed: any = {
          backgroundColor: 'b6e3f4',
          skinColor: 'f5cfa0',
          hair: 'short01',
          hairColor: '000000',
          eyes: 'variant09',
          mouth: 'happy01',
          clothing: 'variant01'
        };
        
        // Parse profilePicture if it's a JSON string
        if (typeof profilePicture === 'string' && !profilePicture.startsWith('data:')) {
          try {
            parsed = JSON.parse(profilePicture);
          } catch (e) {
            console.warn('Failed to parse profilePicture string:', e);
          }
        } 
        // Use profilePicture directly if it's an object
        else if (profilePicture && typeof profilePicture === 'object') {
          parsed = profilePicture;
        }

        // Generate the avatar
        const avatar = createAvatar(pixelArt, {
          seed: userId || username, // Use userId for consistency if available
          backgroundColor: parsed.backgroundColor ? [parsed.backgroundColor] : undefined,
          skinColor: parsed.skinColor ? [parsed.skinColor] : undefined,
          hair: parsed.hair ? [parsed.hair as any] : undefined,
          hairColor: parsed.hairColor ? [parsed.hairColor] : undefined,
          eyes: parsed.eyes ? [parsed.eyes] : undefined,
          mouth: parsed.mouth ? [parsed.mouth] : undefined,
          clothing: parsed.clothing ? [parsed.clothing] : undefined,
          // Add crown accessory for #1 ranked user
          accessories: ['variant03' as any] // Force crown to appear while debugging
        });
        
        // Set the avatar data URL
        setImageUrl(avatar.toDataUri());
      } catch (error) {
        console.error('Error generating avatar:', error);
        setImageUrl(null);
      }
    };

    generateAvatar();
  }, [profilePicture, username, userId, isTopRanked]);

  // Determine if we should show initials instead of an image
  const showInitials = !imageUrl || imageError;

  return (
    <div style={{ position: 'relative' }}>
      {/* Crown for #1 ranked user - positioned outside the avatar container */}
      {isTopRanked && (
        <div
          style={{
            position: 'absolute',
            top: size < 40 ? '-9px' : '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: size < 40 ? '24px' : '30px',
            height: size < 40 ? '20px' : '24px',
            zIndex: 10
          }}
        >
          <img
            src="/crown-new.svg"
            alt="Crown"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      )}
      <AvatarContainer size={size} bgColor={showInitials ? bgColor : '#transparent'}>
        {showInitials ? (
          <AvatarInitial size={size}>{firstInitial}</AvatarInitial>
        ) : (
          <AvatarImage 
            src={imageUrl!} 
            alt={username} 
            onError={() => setImageError(true)}
          />
        )}
      </AvatarContainer>
    </div>
  );
}
