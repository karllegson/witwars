import styled from 'styled-components';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const HeaderContainer = styled.div`
  padding: 16px;
  text-align: center;
  margin-bottom: 8px;
`;

const Title = styled.h1`
  font-family: 'Press Start 2P', cursive;
  font-size: 20px;
  color: #ffcc00;
  margin-bottom: 8px;
  text-shadow: 2px 2px 3px rgba(0,0,0,0.75);
`;

const Subtitle = styled.h2`
  font-family: 'VT323', monospace;
  font-size: 18px;
  color: #fff;
  margin: 0;
`;

export default function Header({ title = 'WITWARS', subtitle = 'MEME BATTLEGROUNDS' }: HeaderProps) {
  return (
    <HeaderContainer>
      <Title>{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
    </HeaderContainer>
  );
} 