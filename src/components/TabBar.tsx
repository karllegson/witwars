import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { Crown, MessageSquare, Vote, Users, UserRound } from 'lucide-react';

const TabBarContainer = styled.nav`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 60px;
  background: #222;
  border-top: 2px solid #444;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
`;

const TabLink = styled(NavLink)`
  color: #999;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'VT323', monospace;
  font-size: 14px;
  &.active {
    color: #ffcc00;
  }
`;

export default function TabBar() {
  return (
    <TabBarContainer>
      <TabLink to="/" end>
        <Crown size={24} />
        Rankings
      </TabLink>
      <TabLink to="/feed">
        <MessageSquare size={24} />
        Feed
      </TabLink>
      <TabLink to="/vote">
        <Vote size={24} />
        Vote
      </TabLink>
      <TabLink to="/friends">
        <Users size={24} />
        Friends
      </TabLink>
      <TabLink to="/profile">
        <UserRound size={24} />
        Profile
      </TabLink>
    </TabBarContainer>
  );
} 