import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Header from '../components/Header';
import RetroWindow from '../components/RetroWindow';
import { useAuth } from '../contexts/AuthContext';
import { cleanupUserData } from '../utils/userCleanup';
import AppContainer from '../components/AppContainer';
import { Trash2 } from 'lucide-react';

const Container = styled.div`
  padding: 20px;
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const UserCard = styled.div`
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const Username = styled.span`
  font-family: 'VT323', monospace;
  font-size: 20px;
  color: #ffcc00;
  margin-bottom: 4px;
`;

const UserEmail = styled.span`
  font-family: 'VT323', monospace;
  font-size: 16px;
  color: #ccc;
`;

const DeleteButton = styled.button`
  background: transparent;
  color: #ff3333;
  border: 2px solid #ff3333;
  font-family: 'Press Start 2P', cursive;
  font-size: 10px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  
  &:hover {
    background: #ff3333;
    color: #000;
    transform: translate(1px, 1px);
  }
  
  &:active {
    transform: translate(2px, 2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Message = styled.div<{ isError?: boolean }>`
  background: ${props => props.isError ? 'rgba(255, 107, 107, 0.2)' : 'rgba(51, 255, 51, 0.2)'};
  border: 1px solid ${props => props.isError ? '#ff6b6b' : '#33ff33'};
  color: ${props => props.isError ? '#ff6b6b' : '#33ff33'};
  padding: 12px;
  margin: 10px 0;
  font-family: 'VT323', monospace;
  font-size: 18px;
  text-align: center;
`;

interface User {
  uid: string;
  username: string;
  email: string;
}

const Admin: React.FC = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string, isError: boolean } | null>(null);
  const [processingUser, setProcessingUser] = useState<string | null>(null);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const userList: User[] = [];
      
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        userList.push({
          uid: doc.id,
          username: userData.username || 'Unknown',
          email: userData.email || 'No email'
        });
      });
      
      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage({ text: 'Error loading users', isError: true });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteUser = async (user: User) => {
    if (!currentUser || !confirm(`Are you sure you want to delete ${user.username}? This cannot be undone.`)) {
      return;
    }
    
    setProcessingUser(user.uid);
    setMessage(null);
    
    try {
      // Step 1: Delete all user data in Firestore
      const result = await cleanupUserData(user.uid);
      
      if (result.success) {
        setMessage({ text: `Successfully deleted all data for user ${user.username}`, isError: false });
        
        // Step 2: Remove user from the list
        setUsers(prev => prev.filter(u => u.uid !== user.uid));
      } else {
        setMessage({ text: `Error: ${result.message}`, isError: true });
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setMessage({ text: `Error: ${error.message || 'Unknown error occurred'}`, isError: true });
    } finally {
      setProcessingUser(null);
    }
  };
  
  // Only klegson48@gmail.com can access this page
  if (!currentUser || currentUser.email !== 'klegson48@gmail.com') {
    return (
      <AppContainer>
        <Header title="Comedy Legend" subtitle="ADMIN CONSOLE" />
        <RetroWindow title="ACCESS.DENIED">
          <Container>
            <p>Access denied. Only authorized administrators can access this page.</p>
          </Container>
        </RetroWindow>
      </AppContainer>
    );
  }
  
  return (
    <AppContainer>
      <Header title="Comedy Legend" subtitle="ADMIN CONSOLE" />
      
      <RetroWindow title="USER.MANAGEMENT">
        <Container>
          <div style={{ 
            fontFamily: "'Press Start 2P', cursive", 
            fontSize: "24px", 
            color: "#ffcc00", 
            textAlign: "center", 
            marginBottom: "20px", 
            textShadow: "2px 2px 0px #000"
          }}>
            User Management
          </div>
          
          {message && (
            <Message isError={message.isError}>
              {message.text}
            </Message>
          )}
          
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <UserList>
              {users.length === 0 ? (
                <p>No users found</p>
              ) : (
                users.map((user) => (
                  <UserCard key={user.uid}>
                    <UserInfo>
                      <Username>{user.username}</Username>
                      <UserEmail>{user.email}</UserEmail>
                      <small>ID: {user.uid}</small>
                    </UserInfo>
                    
                    <DeleteButton 
                      onClick={() => handleDeleteUser(user)}
                      disabled={processingUser === user.uid}
                    >
                      <Trash2 size={16} />
                      {processingUser === user.uid ? 'Deleting...' : 'Delete User & Data'}
                    </DeleteButton>
                  </UserCard>
                ))
              )}
            </UserList>
          )}
        </Container>
      </RetroWindow>
    </AppContainer>
  );
};

export default Admin;
