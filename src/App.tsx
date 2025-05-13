import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import TabBar from './components/TabBar';
import Rankings from './pages/Rankings';

// Import your components here
// import Rankings from './pages/Rankings';
// import Feed from './pages/Feed';
// import Vote from './pages/Vote';
// import Friends from './pages/Friends';
// import Profile from './pages/Profile';

const Placeholder = styled.div`
  padding: 32px 16px 80px 16px;
  min-height: 100vh;
  background: #1a1a1a;
  color: #fff;
`;

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Rankings />} />
        <Route path="/feed" element={<Placeholder>Feed coming soon...</Placeholder>} />
        <Route path="/vote" element={<Placeholder>Vote coming soon...</Placeholder>} />
        <Route path="/friends" element={<Placeholder>Friends coming soon...</Placeholder>} />
        <Route path="/profile" element={<Placeholder>Profile coming soon...</Placeholder>} />
      </Routes>
      <TabBar />
    </>
  );
}

export default App; 