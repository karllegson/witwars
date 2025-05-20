import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import styled from 'styled-components';
import Header from '../../components/Header';
import RetroWindow from '../../components/RetroWindow';
import { Joystick } from 'lucide-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #1a1a1a;
`;

const Content = styled.div`
  padding: 24px;
  width: 100%;
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
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

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Navigate to home page or dashboard after login
    } catch (err: any) {
      setError(err.message);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header title="Comedy Legend" subtitle="ACCESS TERMINAL" />
      
      <RetroWindow title="LOGIN.EXE">
        <Content>
          <FormContainer>
            <Form onSubmit={handleSubmit}>
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
              
              {error && <ErrorMessage>{error}</ErrorMessage>}
              
              <Button type="submit" disabled={loading}>
                <Joystick size={16} style={{ marginRight: '8px' }} />
                {loading ? 'ACCESSING...' : 'LOGIN'}
              </Button>
              
              <StyledLink to="/register">NEW USER? REGISTER HERE</StyledLink>
            </Form>
          </FormContainer>
        </Content>
      </RetroWindow>
    </Container>
  );
};

export default Login; 