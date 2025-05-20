import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { createAvatar } from '@dicebear/core';
import { pixelArt } from '@dicebear/collection';

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
  return `hsl(${hue}, 65%, 35%)`; // Lower lightness for darker colors
};

export default function Avatar({ profilePicture, username, userId, size = 40 }: AvatarProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const firstInitial = username ? username.charAt(0).toUpperCase() : '?';
  const bgColor = getColorFromUsername(username);
  
  // Process the profile picture data on component mount and when it changes
  useEffect(() => {
    let url: string | null = null;
    
    try {
      // Case 1: profilePicture is null or undefined
      if (!profilePicture) {
        url = null;
      }
      // Case 2: profilePicture is a URL string
      else if (typeof profilePicture === 'string') {
        // Check if it looks like a direct URL
        if (profilePicture.startsWith('http') || profilePicture.startsWith('data:')) {
          url = profilePicture;
        }
        // Check if it's a DiceBear JSON configuration string
        else if (profilePicture.startsWith('{')) {
          try {
            const parsed = JSON.parse(profilePicture);
            console.log('Parsed profile picture JSON:', parsed);
            
            // Generate DiceBear avatar URL from the configuration
            if (parsed && typeof parsed === 'object') {
              // Check if it has DiceBear avatar configuration properties
              if (parsed.skinColor || parsed.hair || parsed.eyes) {
                const avatar = createAvatar(pixelArt, {
                  seed: userId || username, // Use userId for consistency if available
                  backgroundColor: parsed.backgroundColor ? [parsed.backgroundColor] : undefined,
                  skinColor: parsed.skinColor ? [parsed.skinColor] : undefined,
                  hair: parsed.hair ? [parsed.hair as any] : undefined, // Use type assertion to fix type errors
                  hairColor: parsed.hairColor ? [parsed.hairColor] : undefined,
                  eyes: parsed.eyes ? [parsed.eyes] : undefined,
                  mouth: parsed.mouth ? [parsed.mouth] : undefined,
                  clothing: parsed.clothing ? [parsed.clothing] : undefined,
                  accessories: parsed.accessories && parsed.accessories !== 'none' ? [parsed.accessories as any] : []
                });
                
                // Get avatar as data URL
                url = avatar.toDataUri();
                console.log('Successfully generated DiceBear avatar for', username);
              } else {
                console.log('JSON does not contain avatar properties', parsed);
                // If it's not a DiceBear config, check for common URL properties
                url = parsed.url || parsed.src || parsed.imageUrl || parsed.path;
              }
            }
          } catch (e) {
            console.error('Failed to parse or generate avatar from config:', e);
            url = null;
          }
        }
        // Use as-is for any other string
        else {
          url = profilePicture;
        }
      }
      // Case 3: profilePicture is an object
      else if (typeof profilePicture === 'object' && profilePicture !== null) {
        // Try to extract URL or generate avatar
        if (profilePicture.skinColor || profilePicture.hair || profilePicture.eyes) {
          // It's a DiceBear config object
          const avatar = createAvatar(pixelArt, {
            seed: userId || username, // Use userId for consistency if available
            backgroundColor: profilePicture.backgroundColor ? [profilePicture.backgroundColor] : undefined,
            skinColor: profilePicture.skinColor ? [profilePicture.skinColor] : undefined,
            hair: profilePicture.hair ? [profilePicture.hair] : undefined,
            hairColor: profilePicture.hairColor ? [profilePicture.hairColor] : undefined,
            eyes: profilePicture.eyes ? [profilePicture.eyes] : undefined,
            mouth: profilePicture.mouth ? [profilePicture.mouth] : undefined,
            clothing: profilePicture.clothing ? [profilePicture.clothing] : undefined,
            accessories: profilePicture.accessories && profilePicture.accessories !== 'none' ? [profilePicture.accessories as any] : []
          });
          
          // Get avatar as data URL
          url = avatar.toDataUri();
        } else {
          // Try to use common URL properties
          url = profilePicture.url || profilePicture.src || profilePicture.imageUrl || profilePicture.path;
        }
      }
    } catch (error) {
      console.error('Error processing profile picture:', error);
      url = null;
    }
    
    setImageUrl(url);
    // Reset error state when URL changes
    setImageError(false);
  }, [profilePicture, username]);

  // Show initials when there's no valid image URL or if image fails to load
  const showInitials = !imageUrl || imageError;
  
  return (
    <AvatarContainer size={size} bgColor={bgColor}>
      {!showInitials ? (
        <AvatarImage 
          src={imageUrl!} 
          alt={username} 
          onError={() => setImageError(true)}
        />
      ) : (
        <AvatarInitial size={size}>{firstInitial}</AvatarInitial>
      )}
    </AvatarContainer>
  );
}
