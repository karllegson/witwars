import { NavLink, useLocation } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { Crown, MessageSquare, Vote as VoteIcon, Users, UserRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

interface TabItemProps {
  disabled?: boolean;
}

const commonTabStyles = css<TabItemProps>`
  color: ${(props) => (props.disabled ? '#666' : '#999')};
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'VT323', monospace;
  font-size: 14px;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};

  svg {
    margin-bottom: 2px;
  }
`;

const TabLink = styled(NavLink)<TabItemProps>`
  ${commonTabStyles}
  &.active {
    color: ${(props) => (props.disabled ? '#666' : '#ffcc00')};
  }
`;

const DisabledTab = styled.div<TabItemProps>`
  ${commonTabStyles}
`;

const TabItem: React.FC<{
  to: string;
  icon: React.ElementType;
  label: string;
  isProtected?: boolean;
  end?: boolean;
}> = ({ to, icon: Icon, label, isProtected = false, end }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  const isDisabled = isProtected && !currentUser;

  if (loading && isProtected) {
    return (
      <DisabledTab disabled={true}>
        <Icon size={24} />
        {label}
      </DisabledTab>
    );
  }

  if (isDisabled) {
    return (
      <DisabledTab disabled={true} title="Login required">
        <Icon size={24} />
        {label}
      </DisabledTab>
    );
  }

  return (
    <TabLink to={to} end={end} className={location.pathname === to ? 'active' : ''}>
      <Icon size={24} />
      {label}
    </TabLink>
  );
};

export default function TabBar() {
  return (
    <TabBarContainer>
      <TabItem to="/" icon={Crown} label="Rankings" end />
      <TabItem to="/feed" icon={MessageSquare} label="Feed" isProtected />
      <TabItem to="/vote" icon={VoteIcon} label="Vote" isProtected />
      <TabItem to="/friends" icon={Users} label="Friends" isProtected />
      <TabItem to="/profile" icon={UserRound} label="Profile" />
    </TabBarContainer>
  );
} 