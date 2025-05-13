import styled from 'styled-components';

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
  margin-bottom: 24px;
`;

export default function Rankings() {
  return (
    <Container>
      <Title>Rankings</Title>
      <p>Leaderboard coming soon...</p>
    </Container>
  );
} 