import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { getAllUsersByVotes, UserProfile, sendFriendRequest, getFriends } from '../utils/friendService';
import Avatar from '../components/Avatar';
import { useAuth } from '../contexts/AuthContext';
import { ChevronDown, ChevronUp, UserPlus, Check } from 'lucide-react';

const Container = styled.div`
  padding: 32px 16px 80px 16px;
  min-height: 100vh;
  background: #1a1a1a;
  color: #fff;
`;

const Title = styled.h1`
  font-family: 'Press Start 2P', cursive;
  font-size: 2rem;
  color: #ffcc00;
  margin-bottom: 8px;
  text-align: center;
`;

const Subtitle = styled.div`
  font-family: 'VT323', monospace;
  font-size: 1.25rem;
  color: #fff;
  text-align: center;
  margin-bottom: 24px;
  opacity: 0.95;
`;

const RankingList = styled.div`
  max-width: 500px;
  margin: 0 auto;
`;

const RankRow = styled.div<{ highlight?: boolean }>`
  display: flex;
  flex-direction: column;
  background: ${({ highlight }) => (highlight ? '#2a2a2a' : '#232323')};
  border: 1px solid #444;
  padding: 16px;
  margin-bottom: 10px;
  border-radius: 6px;
  font-family: 'VT323', monospace;
  font-size: 22px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #666;
  }
`;

const Trophy = styled.span`
  font-size: 1.5em;
  margin-right: 12px;
`;

const RankRowHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const ExpandedContent = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #444;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const UserDetail = styled.div`
  display: flex;
  margin-bottom: 6px;
  justify-content: space-between;
  width: 100%;
`;

const DetailLabel = styled.span`
  color: #999;
  width: 80px;
  flex-shrink: 0;
`;

const DetailValue = styled.span`
  color: #fff;
  flex-grow: 1;
  text-align: right;
`;

const AddFriendButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: transparent;
  color: #ffcc00;
  border: 1px solid #ffcc00;
  font-family: 'Press Start 2P', cursive;
  font-size: 12px;
  padding: 8px 15px;
  margin-top: 12px;
  cursor: pointer;
  transition: all 0.1s ease;
  text-transform: uppercase;
  
  &:hover {
    background: #ffcc00;
    color: #000;
  }
  
  &:active {
    background: #cc9900;
    color: #000;
  }
  
  &:disabled {
    background: transparent;
    color: #666;
    border-color: #666;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export default function Rankings() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [friendRequestStatus, setFriendRequestStatus] = useState<Record<string, string>>({});
  const [requestLoading, setRequestLoading] = useState<Record<string, boolean>>({});
  const [friendList, setFriendList] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all users with at least 1 vote
        const allUsers = await getAllUsersByVotes(1);
        
        // Debug the user data we're getting
        console.log('Users fetched:', allUsers);
        allUsers.forEach((user, index) => {
          console.log(`User ${index + 1} - ${user.username}:`);
          console.log('- Profile picture:', user.profilePicture);
          console.log('- Data type:', typeof user.profilePicture);
        });
        
        setUsers(allUsers);
        
        // Fetch current user's friends if logged in
        if (currentUser) {
          const friends = await getFriends(currentUser.uid);
          const friendIds = friends.map(friend => friend.uid);
          setFriendList(friendIds);
          console.log('Friend IDs:', friendIds);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]); // Re-fetch when user changes

  const handleSendFriendRequest = async (toUser: UserProfile) => {
    if (!currentUser) return;
    
    try {
      setRequestLoading(prev => ({ ...prev, [toUser.uid]: true }));
      await sendFriendRequest(currentUser.uid, toUser.username);
      setFriendRequestStatus(prev => ({ 
        ...prev, 
        [toUser.uid]: 'Request sent!' 
      }));
    } catch (error: any) {
      setFriendRequestStatus(prev => ({ 
        ...prev, 
        [toUser.uid]: error.message || 'Failed to send request' 
      }));
    } finally {
      setRequestLoading(prev => ({ ...prev, [toUser.uid]: false }));
    }
  };

  const toggleExpandedUser = (userId: string) => {
    setExpandedUser(prev => prev === userId ? null : userId);
  };

  const getTrophy = (rank: number) => {
    if (rank === 0) return <Trophy>🥇</Trophy>;
    if (rank === 1) return <Trophy>🥈</Trophy>;
    if (rank === 2) return <Trophy>🥉</Trophy>;
    return null;
  };

  return (
    <Container>
      <Title>Global Rankings</Title>
      <Subtitle>Sorting legends from try-hards — one joke at a time.</Subtitle>
      {loading ? (
        <p>Loading leaderboard...</p>
      ) : (
        <RankingList>
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            users.map((user, idx) => (
              <RankRow 
                key={user.uid} 
                highlight={idx < 3} 
                onClick={() => toggleExpandedUser(user.uid)}
              >
                <RankRowHeader>
                  <UserInfo>
                    {getTrophy(idx)}
                    <span style={{ marginRight: 12 }}>#{idx + 1}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Avatar profilePicture={user.profilePicture} username={user.username} size={32} />
                      <span>{user.username}</span>
                    </div>
                  </UserInfo>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#ffcc00', fontWeight: 700 }}>{user.votes ?? 0} votes</span>
                    {expandedUser === user.uid ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </RankRowHeader>
                
                {expandedUser === user.uid && (
                  <ExpandedContent>
                    <UserDetail>
                      <DetailLabel>Bio:</DetailLabel>
                      <DetailValue>{user.bio || 'No bio available'}</DetailValue>
                    </UserDetail>
                    
                    <UserDetail>
                      <DetailLabel>Location:</DetailLabel>
                      <DetailValue>{user.location || 'Not specified'}</DetailValue>
                    </UserDetail>
                    
                    {currentUser && currentUser.uid !== user.uid && (
                      <div style={{ marginTop: 8 }}>
                        {friendList.includes(user.uid) ? (
                          <AddFriendButton disabled={true}>
                            <Check size={14} />
                            Already Friends
                          </AddFriendButton>
                        ) : (
                          <>
                            <AddFriendButton 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendFriendRequest(user);
                              }}
                              disabled={requestLoading[user.uid] || friendRequestStatus[user.uid] === 'Request sent!'}
                            >
                              <UserPlus size={14} />
                              {requestLoading[user.uid] ? 'Sending...' : 
                               friendRequestStatus[user.uid] === 'Request sent!' ? 'Request sent' : 'Add Friend'}
                            </AddFriendButton>
                            
                            {friendRequestStatus[user.uid] && friendRequestStatus[user.uid] !== 'Request sent!' && (
                              <div style={{ color: '#ff6b6b', fontSize: '14px', marginTop: '4px' }}>
                                {friendRequestStatus[user.uid]}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </ExpandedContent>
                )}
              </RankRow>
            ))
          )}
        </RankingList>
      )}
    </Container>
  );
} 