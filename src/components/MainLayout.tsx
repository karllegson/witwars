import React from 'react';
import { Outlet } from 'react-router-dom';
import TabBar from './TabBar'; // Assuming TabBar is in the same directory or adjust path
import styled from 'styled-components';

const AppContainer = styled.div`
  // Basic app container styles, can be expanded
  // The TabBar might have its own positioning (e.g., fixed at bottom)
`;

const ContentContainer = styled.div`
  // This will hold the page content, adjust padding if TabBar is fixed
  // For example, if TabBar is 60px high and fixed at the bottom:
  padding-bottom: 60px; 
`;

const MainLayout: React.FC = () => {
  return (
    <AppContainer>
      <ContentContainer>
        <Outlet /> {/* Protected page content will render here */}
      </ContentContainer>
      <TabBar />
    </AppContainer>
  );
};

export default MainLayout; 