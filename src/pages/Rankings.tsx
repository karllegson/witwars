import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { getAllUsersByVotes, UserProfile } from '../utils/friendService';
import Avatar from '../components/Avatar';

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
  align-items: center;
  justify-content: space-between;
  background: ${({ highlight }) => (highlight ? '#2a2a2a' : '#232323')};
  border: 1px solid #444;
  padding: 16px;
  margin-bottom: 10px;
  border-radius: 6px;
  font-family: 'VT323', monospace;
  font-size: 22px;
`;

const Trophy = styled.span`
  font-size: 1.5em;
  margin-right: 12px;
`;

export default function Rankings() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
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
      } catch (error) {
        console.error('Error fetching ranked users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []); // Only fetch on initial render

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
              <RankRow key={user.uid} highlight={idx < 3}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {getTrophy(idx)}
                  <span style={{ marginRight: 12 }}>#{idx + 1}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar profilePicture={user.profilePicture} username={user.username} size={32} />
                    <span>{user.username}</span>
                  </div>
                </div>
                <span style={{ color: '#ffcc00', fontWeight: 700 }}>{user.votes ?? 0} votes</span>
              </RankRow>
            ))
          )}
        </RankingList>
      )}
    </Container>
  );
} 