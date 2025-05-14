import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import TabBar from './components/TabBar';
import Rankings from './pages/Rankings';
import Feed from './pages/Feed';
import Vote from './pages/Vote';
import Friends from './pages/Friends';
import Profile from './pages/Profile';

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
        <Route path="/feed" element={<Feed />} />
        <Route path="/vote" element={<Vote />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <TabBar />
    </>
  );
}

export default App; 