import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import styled from 'styled-components';
import Header from '../../components/Header';
import RetroWindow from '../../components/RetroWindow';
import AppContainer from '../../components/AppContainer';
import RetroButton from '../../components/RetroButton';
import { UserPlus } from 'lucide-react';

const Content = styled.div`
  padding: 24px;
  width: 100%;
`;

const SectionTitle = styled.div`
  font-family: 'Press Start 2P', cursive;
  font-size: 14px;
  color: #ffcc00;
  margin-bottom: 12px;
  text-align: center;
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-family: 'VT323', monospace;
  font-size: 20px;
  color: #ffcc00;
`;

const Input = styled.input`
  background: #2a2a2a;
  padding: 12px;
  border: 1px solid #444;
  font-family: 'VT323', monospace;
  font-size: 20px;
  color: #33ff33;
  outline: none;
  transition: border 0.2s;
  
  &:focus {
    border-color: #ffcc00;
  }
`;

const Button = styled.button`
  background: #333;
  color: #ffcc00;
  border: 1px solid #ffcc00;
  font-family: 'Press Start 2P', cursive;
  font-size: 14px;
  padding: 12px;
  margin-top: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  text-transform: uppercase;
  
  &:hover {
    background: #ffcc00;
    color: #000;
  }
  
  &:disabled {
    background: #333;
    color: #666;
    border-color: #666;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #ff6b6b;
  font-family: 'VT323', monospace;
  font-size: 18px;
  text-align: center;
  padding: 8px;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
`;

const StyledLink = styled(Link)`
  margin-top: 20px;
  font-family: 'VT323', monospace;
  font-size: 18px;
  color: #33ff33;
  text-align: center;
  display: block;
  text-decoration: none;
  
  &:hover {
    color: #ffcc00;
  }
`;

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document with username
      await setDoc(doc(db, 'users', user.uid), {
        username: username,
        email: email,
        friends: [],
        friendRequests: [],
        createdAt: new Date().toISOString()
      });

      navigate('/');
    } catch (err: any) {
      setError(err.message);
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContainer>
      <Header title="Comedy Legend" subtitle="NEW USER CREATION" />
      
      <RetroWindow title="REGISTER.EXE">
        <Content>
          <FormContainer>
            <SectionTitle>CREATE NEW ACCOUNT</SectionTitle>
            <Form onSubmit={handleSubmit}>
              <InputGroup>
                <Label htmlFor="username">USERNAME:</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </InputGroup>
              
              <InputGroup>
                <Label htmlFor="email">EMAIL:</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </InputGroup>
              
              <InputGroup>
                <Label htmlFor="password">PASSWORD:</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </InputGroup>
              
              <InputGroup>
                <Label htmlFor="confirmPassword">CONFIRM PASSWORD:</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </InputGroup>
              
              {error && <ErrorMessage>{error}</ErrorMessage>}
              
              <Button type="submit" disabled={loading}>
                <UserPlus size={16} />
                {loading ? 'CREATING...' : 'REGISTER'}
              </Button>
              
              <StyledLink to="/login">ALREADY HAVE AN ACCOUNT? LOGIN</StyledLink>
            </Form>
          </FormContainer>
        </Content>
      </RetroWindow>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <RetroButton
          title="← BACK TO HOME"
          onClick={() => navigate('/')}
        />
      </div>
    </AppContainer>
  );
};

export default Register; 