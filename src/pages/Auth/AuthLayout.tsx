import React, { useState, useEffect } from 'react';

import AppContainer from '../../components/AppContainer';
import { useNavigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

const AuthLayout: React.FC = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const checkUsernameExists = async (username: string) => {
    const userDoc = await getDoc(doc(db, 'users', username));
    return userDoc.exists();
  };

  const registerUser = async () => {
    try {
      const usernameExists = await checkUsernameExists(username);
      if (usernameExists) {
        setError("Username is already taken. Please choose another.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        username: username
      });

      console.log("User registered successfully:", user);
      navigate('/');
    } catch (error: any) {
      console.error("Error registering user:", error.message);
      setError("Registration failed: " + error.message);
    }
  };

  return (
    <AppContainer>
      <h2>Register</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={registerUser}>Register</button>

      <Outlet />
    </AppContainer>
  );
};

export default AuthLayout; 