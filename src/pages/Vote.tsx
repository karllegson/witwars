import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import RetroWindow from '../components/RetroWindow';
import AppContainer from '../components/AppContainer';
import RetroButton from '../components/RetroButton';
import { loadLeaderboard, saveLeaderboard, getLastVoteTime, setLastVoteTime } from '../utils/storage';
import { Person } from '../types/person';


const Content = styled.div`
  padding: 16px;
`;

const AddPersonContainer = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.div`
  font-family: 'Press Start 2P', cursive;
  font-size: 14px;
  color: #ffcc00;
  margin-bottom: 12px;
`;

const AddPersonInputRow = styled.div`
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  height: 48px;
  background: #232323;
  border: 2px solid #1a1a1a;
  padding: 0 12px;
  font-family: 'VT323', monospace;
  font-size: 20px;
  color: #fff;
  margin-right: 8px;
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
  const [people, setPeople] = useState<Person[]>([]);
  const [newPersonName, setNewPersonName] = useState('');
  const [canVote, setCanVote] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const leaderboard = await loadLeaderboard();
        setPeople(leaderboard);
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

  const handleAddPerson = async () => {
    if (!newPersonName.trim()) {
      alert('Please enter a name');
      return;
    }
    try {
      const existingIndex = people.findIndex(
        person => person.name.toLowerCase() === newPersonName.toLowerCase()
      );
      if (existingIndex >= 0) {
        alert('This person already exists in the list');
        return;
      }
      const newPerson: Person = {
        id: Date.now().toString(),
        name: newPersonName.trim(),
        votes: 0,
        bio: '',
        joke: '',
      };
      const updatedPeople = [...people, newPerson];
      await saveLeaderboard(updatedPeople);
      setPeople(updatedPeople);
      setNewPersonName('');
    } catch (error) {
      console.error('Failed to add person:', error);
      alert('Failed to add person');
    }
  };

  const handleVote = async (personId: string) => {
    if (!canVote) {
      alert(`You can vote again in ${timeRemaining}`);
      return;
    }
    try {
      const updatedPeople = people.map(person =>
        person.id === personId
          ? { ...person, votes: person.votes + 1 }
          : person
      );
      await saveLeaderboard(updatedPeople);
      setPeople(updatedPeople);
      await setLastVoteTime(new Date().getTime());
      setCanVote(false);
      setTimeRemaining('23h 59m');
      alert('Your vote has been counted! You can vote again tomorrow.');
    } catch (error) {
      console.error('Failed to record vote:', error);
      alert('Failed to record your vote');
    }
  };

  return (
    <AppContainer>
      <Header title="COMEDY KINGS" subtitle="CAST YOUR VOTE" />
      <RetroWindow title="VOTE.EXE">
        <Content>
          <AddPersonContainer>
            <SectionTitle>Add Someone New:</SectionTitle>
            <AddPersonInputRow>
              <Input
                value={newPersonName}
                onChange={e => setNewPersonName(e.target.value)}
                placeholder="Person's name"
              />
              <RetroButton
                title="ADD"
                onClick={handleAddPerson}
                style={{ width: 80, height: 48 }}
              />
            </AddPersonInputRow>
          </AddPersonContainer>
          <VotingSection>
            <SectionTitle>Vote For Someone:</SectionTitle>
            {!canVote && (
              <TimeRemainingContainer>
                <TimeRemainingText>
                  You can vote again in: {timeRemaining}
                </TimeRemainingText>
              </TimeRemainingContainer>
            )}
            {people.length === 0 ? (
              <EmptyText>No one to vote for yet! Add someone first.</EmptyText>
            ) : (
              people.map(person => (
                <PersonVoteRow key={person.id}>
                  <PersonName>{person.name}</PersonName>
                  <RetroButton
                    title="VOTE"
                    onClick={() => handleVote(person.id)}
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