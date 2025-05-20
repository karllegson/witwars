import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import RetroWindow from '../components/RetroWindow';
import Avatar from '../components/Avatar';
import AppContainer from '../components/AppContainer';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile, getFriends, getFriendRequests, sendFriendRequest, acceptFriendRequest, removeFriend } from '../utils/friendService';


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

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const EmptyText = styled.div`
  font-family: 'Press Start 2P', cursive;
  font-size: 14px;
  color: #fff;
  text-align: center;
  margin-bottom: 16px;
`;

const InstructionText = styled.div`
  font-family: 'VT323', monospace;
  font-size: 20px;
  color: #ccc;
  text-align: center;
`;

const ListContent = styled.div`
  padding: 12px;
`;

const PersonCard = styled.div`
  display: flex;
  justify-content: space-between;
  background: #232323;
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 4px;
  border: 2px solid #333;
  cursor: pointer;
  transition: background 0.1s;
  &:hover {
    background: #2a2a2a;
  }
`;

const PersonDetails = styled.div`
  flex: 1;
  margin-right: 12px;
`;

const PersonName = styled.div`
  font-family: 'VT323', monospace;
  font-size: 22px;
  color: #fff;
  margin-bottom: 8px;
`;

const JokeText = styled.div`
  font-family: 'VT323', monospace;
  font-size: 16px;
  color: #ccc;
  font-style: italic;
`;



const SectionTitle = styled.h2`
  font-family: 'VT323', monospace;
  font-size: 24px;
  color: #fff;
  margin-bottom: 16px;
`;

const AddFriendInput = styled.input`
  background: #232323;
  border: 2px solid #333;
  padding: 12px;
  font-family: 'VT323', monospace;
  font-size: 18px;
  color: #fff;
  border-radius: 4px;
  width: 100%;
  margin-bottom: 16px;
`;

const ActionButton = styled.button`
  background: #232323;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  color: #fff;
  font-family: 'VT323', monospace;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2a2a2a;
  }

  &:disabled {
    background: #232323;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.div`
  color: #ff4444;
  font-family: 'VT323', monospace;
  font-size: 16px;
  margin-top: 8px;
`;

const Friends: React.FC = () => {
  const { currentUser } = useAuth();
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<UserProfile[]>([]);
  const [newFriendUsername, setNewFriendUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        navigate('/');
        return;
      }

      setLoading(true);
      try {
        const [f, r] = await Promise.all([
          getFriends(currentUser.uid),
          getFriendRequests(currentUser.uid)
        ]);
        setFriends(f);
        setRequests(r);
      } catch (error) {
        console.error('Failed to load friends:', error);
        setError('Failed to load friends');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser, navigate]);

  const handleAddFriend = async () => {
    if (!currentUser) return;
    setError('');
    try {
      await sendFriendRequest(currentUser.uid, newFriendUsername);
      setNewFriendUsername('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (fromUserId: string) => {
    if (!currentUser) return;
    setError('');
    try {
      await acceptFriendRequest(currentUser.uid, fromUserId);
      // Refresh the lists
      const [newFriends, newRequests] = await Promise.all([
        getFriends(currentUser.uid),
        getFriendRequests(currentUser.uid)
      ]);
      setFriends(newFriends);
      setRequests(newRequests);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to accept friend request');
    }
  };

  if (!currentUser) {
    navigate('/');
    return null;
  }

  if (loading) {
    return (
      <AppContainer>
        <Header title="Comedy Legend" subtitle="FRIENDS" />
        <RetroWindow title="FRIENDS.EXE">
          <LoadingContainer>
            <LoadingText>Loading...</LoadingText>
          </LoadingContainer>
        </RetroWindow>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Header title="Comedy Legend" subtitle="FRIENDS" />
      <RetroWindow title="FRIENDS.EXE">
        <ListContent>
          <SectionTitle>ADD FRIEND</SectionTitle>
          <AddFriendInput
            type="text"
            placeholder="Enter username to add friend"
            value={newFriendUsername}
            onChange={(e) => setNewFriendUsername(e.target.value)}
          />
          <ActionButton
            onClick={handleAddFriend}
            disabled={!newFriendUsername.trim()}
          >
            Send Friend Request
          </ActionButton>
          {error && <ErrorText>{error}</ErrorText>}

          {requests.length > 0 && (
            <>
              <SectionTitle style={{ marginTop: '32px' }}>FRIEND REQUESTS</SectionTitle>
              {requests.map((request) => (
                <PersonCard key={request.uid}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar profilePicture={request.profilePicture} username={request.username} size={40} />
                    <PersonDetails>
                      <PersonName>{request.username}</PersonName>
                      <JokeText>{request.email}</JokeText>
                    </PersonDetails>
                  </div>
                  <ActionButton onClick={() => handleAcceptRequest(request.uid)}>
                    Accept
                  </ActionButton>
                </PersonCard>
              ))}
            </>
          )}

          <SectionTitle style={{ marginTop: '32px' }}>YOUR FRIENDS</SectionTitle>
          {friends.length === 0 ? (
            <EmptyContainer>
              <EmptyText>No friends yet</EmptyText>
              <InstructionText>Add friends using their username above!</InstructionText>
            </EmptyContainer>
          ) : (
            friends.map((friend) => (
              <PersonCard key={friend.uid}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Avatar profilePicture={friend.profilePicture} username={friend.username} size={40} />
                  <PersonDetails>
                    <PersonName>{friend.username}</PersonName>
                    <JokeText>{friend.email}</JokeText>
                  </PersonDetails>
                </div>
                <ActionButton
                  style={{ background: '#ff3333', color: '#fff', marginLeft: 8 }}
                  onClick={async () => {
                    if (!currentUser) return;
                    setError("");
                    try {
                      await removeFriend(currentUser.uid, friend.uid);
                      // Refresh the friends list
                      const newFriends = await getFriends(currentUser.uid);
                      setFriends(newFriends);
                    } catch (error) {
                      setError(error instanceof Error ? error.message : 'Failed to remove friend');
                    }
                  }}
                >
                  Remove
                </ActionButton>
              </PersonCard>
            ))
          )}
        </ListContent>
      </RetroWindow>
    </AppContainer>
  );
};

export default Friends;