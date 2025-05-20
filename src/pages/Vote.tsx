import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import RetroWindow from '../components/RetroWindow';
import AppContainer from '../components/AppContainer';
import RetroButton from '../components/RetroButton';
import { getLastVoteTime, setLastVoteTime } from '../utils/storage';
import { UserProfile, getFriends, incrementVotes } from '../utils/friendService';
import { useAuth } from '../contexts/AuthContext';


const Content = styled.div`
  padding: 16px;
`;

const SectionTitle = styled.div`
  font-family: 'Press Start 2P', cursive;
  font-size: 14px;
  color: #ffcc00;
  margin-bottom: 12px;
`;

const VotingSection = styled.div`
  margin-bottom: 16px;
`;

const TimeRemainingContainer = styled.div`
  background: rgba(255, 0, 0, 0.2);
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  border: 1px solid #ff6666;
`;

const TimeRemainingText = styled.div`
  font-family: 'VT323', monospace;
  font-size: 18px;
  color: #ff6666;
  text-align: center;
`;

const EmptyText = styled.div`
  font-family: 'VT323', monospace;
  font-size: 20px;
  color: #ccc;
  text-align: center;
  margin: 24px 0;
`;

const PersonVoteRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #232323;
  margin-bottom: 10px;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #1a1a1a;
`;

const PersonName = styled.div`
  font-family: 'VT323', monospace;
  font-size: 20px;
  color: #fff;
`;

export default function Vote() {
  const { currentUser } = useAuth();
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [canVote, setCanVote] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!currentUser) return;
        // Fetch friends from Firestore
        const friendsList = await getFriends(currentUser.uid);
        console.log('Loaded Firestore friends for voting:', friendsList);
        setFriends(friendsList);
        const lastVoteTime = await getLastVoteTime();
        if (lastVoteTime) {
          const now = new Date().getTime();
          const timeSinceLastVote = now - lastVoteTime;
          const oneDayInMs = 24 * 60 * 60 * 1000;
          if (timeSinceLastVote < oneDayInMs) {
            setCanVote(false);
            const timeLeft = oneDayInMs - timeSinceLastVote;
            const hours = Math.floor(timeLeft / (60 * 60 * 1000));
            const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
            setTimeRemaining(`${hours}h ${minutes}m`);
          } else {
            setCanVote(true);
            setTimeRemaining(null);
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Removed handleAddPerson, as adding new people is not allowed.

  const handleVote = async (friendId: string) => {
    if (!canVote) {
      alert(`You can vote again in ${timeRemaining}`);
      return;
    }
    try {
      await incrementVotes(friendId);
      await setLastVoteTime(new Date().getTime());
      setCanVote(false);
      setTimeRemaining('23h 59m');
      alert('Your vote has been counted! You can vote again tomorrow.');
      // Optionally, refresh friends list to show updated vote count
      if (currentUser) {
        const friendsList = await getFriends(currentUser.uid);
        setFriends(friendsList);
      }
    } catch (error) {
      console.error('Failed to record vote:', error);
      alert('Failed to record your vote');
    }
  };

  return (
    <AppContainer>
      <Header title="Comedy Legend" subtitle="CAST YOUR VOTE" />
      <RetroWindow title="VOTE.EXE">
        <Content>

          <VotingSection>
            <SectionTitle>Vote For Someone:</SectionTitle>
            {!canVote && (
              <TimeRemainingContainer>
                <TimeRemainingText>
                  You can vote again in: {timeRemaining}
                </TimeRemainingText>
              </TimeRemainingContainer>
            )}
            {friends.length === 0 ? (
              <EmptyText>No friends to vote for yet!</EmptyText>
            ) : (
              friends.map(friend => (
                <PersonVoteRow key={friend.uid}>
                  <PersonName>{friend.username} <span style={{ color: '#ffcc00', marginLeft: 12 }}>({friend.votes ?? 0} {(friend.votes ?? 0) === 1 ? 'vote' : 'votes'})</span></PersonName>
                  <RetroButton
                    title="VOTE"
                    onClick={() => handleVote(friend.uid)}
                    disabled={!canVote}
                    style={canVote ? { width: 80, height: 48 } : { width: 80, height: 48, opacity: 0.7 }}
                  />
                </PersonVoteRow>
              ))
            )}
          </VotingSection>
        </Content>
      </RetroWindow>
    </AppContainer>
  );
} 