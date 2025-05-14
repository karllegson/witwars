import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import RetroWindow from '../components/RetroWindow';
import { loadLeaderboard, getFriends, getFriendRequests, sendFriendRequest, acceptFriendRequest, loadProfile } from '../utils/storage';
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

const NoJokeText = styled.div`
  font-family: 'VT323', monospace;
  font-size: 16px;
  color: #888;
  font-style: italic;
`;

const ScoreContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #1a1a2e;
  border-radius: 4px;
  padding: 8px;
  min-width: 70px;
`;

const ScoreValue = styled.div`
  font-family: 'Press Start 2P', cursive;
  font-size: 16px;
  color: #ffcc00;
`;

const ScoreLabel = styled.div`
  font-family: 'VT323', monospace;
  font-size: 14px;
  color: #aaa;
  margin-top: 4px;
`;

const SectionTitle = styled.h2`
  font-family: 'VT323', monospace;
  font-size: 24px;
  color: #fff;
  margin-bottom: 16px;
`;

export default function Friends() {
  const [friends, setFriends] = useState<Person[]>([]);
  const [requests, setRequests] = useState<Person[]>([]);
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [profile, setProfile] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [f, r, all, p] = await Promise.all([
          getFriends(),
          getFriendRequests(),
          loadLeaderboard(),
          loadProfile(),
        ]);
        setFriends(f);
        setRequests(r);
        setAllPeople(all);
        setProfile(p);
      } catch (error) {
        console.error('Failed to load friends:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSendRequest = async (id: string) => {
    try {
      await sendFriendRequest(id);
      alert('Friend request sent!');
    } catch (e) {
      alert('Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (id: string) => {
    try {
      await acceptFriendRequest(id);
      alert('Friend request accepted!');
    } catch (e) {
      alert('Failed to accept friend request');
    }
  };

  const navigateToProfile = (id: string) => {
    navigate(`/person/${id}`);
  };

  // Users you can send requests to (not yourself, not already friends, not already sent, not already received)
  const canRequest = (person: Person) => {
    if (!profile) return false;
    if (person.id === profile.id) return false;
    if (profile.friends?.includes(person.id)) return false;
    if (profile.friendRequestsSent?.includes(person.id)) return false;
    if (profile.friendRequestsReceived?.includes(person.id)) return false;
    return true;
  };

  return (
    <Container>
      <Header title="COMEDY KINGS" subtitle="YOUR HILARIOUS FRIENDS" />
      <RetroWindow title="FRIENDS.EXE">
        {loading ? (
          <LoadingContainer>
            <LoadingText>LOADING...</LoadingText>
          </LoadingContainer>
        ) : (
          <ListContent>
            {/* Friend Requests */}
            {requests.length > 0 && (
              <>
                <SectionTitle>Friend Requests</SectionTitle>
                {requests.map((item) => (
                  <PersonCard key={item.id}>
                    <PersonDetails>
                      <PersonName>{item.name}</PersonName>
                      {item.joke ? (
                        <JokeText>"{item.joke}"</JokeText>
                      ) : (
                        <NoJokeText>No joke yet</NoJokeText>
                      )}
                    </PersonDetails>
                    <ScoreContainer>
                      <ScoreValue>{item.votes}</ScoreValue>
                      <ScoreLabel>VOTES</ScoreLabel>
                      <button onClick={() => handleAcceptRequest(item.id)} style={{marginTop:8}}>Accept</button>
                    </ScoreContainer>
                  </PersonCard>
                ))}
              </>
            )}
            {/* Friends List */}
            <SectionTitle>Friends</SectionTitle>
            {friends.length === 0 ? (
              <EmptyText>No friends added yet!</EmptyText>
            ) : (
              friends.map((item) => (
                <PersonCard key={item.id} onClick={() => navigateToProfile(item.id)}>
                  <PersonDetails>
                    <PersonName>{item.name}</PersonName>
                    {item.joke ? (
                      <JokeText>"{item.joke}"</JokeText>
                    ) : (
                      <NoJokeText>No joke yet</NoJokeText>
                    )}
                  </PersonDetails>
                  <ScoreContainer>
                    <ScoreValue>{item.votes}</ScoreValue>
                    <ScoreLabel>VOTES</ScoreLabel>
                  </ScoreContainer>
                </PersonCard>
              ))
            )}
            {/* Add Friends */}
            <SectionTitle>Add Friends</SectionTitle>
            {allPeople.filter(canRequest).length === 0 ? (
              <EmptyText>No one to add as a friend!</EmptyText>
            ) : (
              allPeople.filter(canRequest).map((item) => (
                <PersonCard key={item.id}>
                  <PersonDetails>
                    <PersonName>{item.name}</PersonName>
                    {item.joke ? (
                      <JokeText>"{item.joke}"</JokeText>
                    ) : (
                      <NoJokeText>No joke yet</NoJokeText>
                    )}
                  </PersonDetails>
                  <ScoreContainer>
                    <ScoreValue>{item.votes}</ScoreValue>
                    <ScoreLabel>VOTES</ScoreLabel>
                    <button onClick={() => handleSendRequest(item.id)} style={{marginTop:8}}>Add Friend</button>
                  </ScoreContainer>
                </PersonCard>
              ))
            )}
          </ListContent>
        )}
      </RetroWindow>
    </Container>
  );
} 