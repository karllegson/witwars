import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import RetroWindow from '../components/RetroWindow';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile, getFriends, getFriendRequests, sendFriendRequest, acceptFriendRequest } from '../utils/friendService';

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

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const EmptyText = styled.div`
  font-family: 'Press Start 2P', cursive;
  font-size: 16px;
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
  background: #2a2a40;
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 4px;
  border: 2px solid #444466;
  cursor: pointer;
  transition: background 0.1s;
  &:hover {
    background: #35355a;
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
  background: #2a2a40;
  border: 2px solid #444466;
  padding: 12px;
  font-family: 'VT323', monospace;
  font-size: 18px;
  color: #fff;
  border-radius: 4px;
  width: 100%;
  margin-bottom: 16px;
`;

const ActionButton = styled.button`
  background: #4a4a6a;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  color: #fff;
  font-family: 'VT323', monospace;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #5a5a7a;
  }

  &:disabled {
    background: #3a3a4a;
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
      <Container>
        <Header title="COMEDY KINGS" subtitle="FRIENDS" />
        <RetroWindow title="FRIENDS.EXE">
          <LoadingContainer>
            <LoadingText>Loading...</LoadingText>
          </LoadingContainer>
        </RetroWindow>
      </Container>
    );
  }

  return (
    <Container>
      <Header title="COMEDY KINGS" subtitle="FRIENDS" />
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

          <SectionTitle style={{ marginTop: '32px' }}>FRIEND REQUESTS</SectionTitle>
          {requests.length === 0 ? (
            <EmptyContainer>
              <EmptyText>No pending friend requests</EmptyText>
            </EmptyContainer>
          ) : (
            requests.map((request) => (
              <PersonCard key={request.uid}>
                <PersonDetails>
                  <PersonName>{request.username}</PersonName>
                  <JokeText>{request.email}</JokeText>
                </PersonDetails>
                <ActionButton onClick={() => handleAcceptRequest(request.uid)}>
                  Accept
                </ActionButton>
              </PersonCard>
            ))
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
                <PersonDetails>
                  <PersonName>{friend.username}</PersonName>
                  <JokeText>{friend.email}</JokeText>
                </PersonDetails>
              </PersonCard>
            ))
          )}
        </ListContent>
      </RetroWindow>
    </Container>
  );
};

export default Friends;