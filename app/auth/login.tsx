import { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import Header from '@/components/Header';
import RetroWindow from '@/components/RetroWindow';
import RetroButton from '@/components/RetroButton';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="WITWAR" subtitle="LOGIN TO BATTLE" />
      
      <RetroWindow title="LOGIN.EXE">
        <View style={styles.content}>
          <View style={styles.form}>
            <Text style={styles.label}>EMAIL:</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#888888"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>PASSWORD:</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#888888"
              secureTextEntry
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <RetroButton
              title={loading ? "LOGGING IN..." : "LOGIN"}
              onPress={handleLogin}
              disabled={loading}
              style={styles.button}
            />

            <Link href="/auth/register" asChild>
              <RetroButton
                title="CREATE ACCOUNT"
                style={styles.registerButton}
              />
            </Link>
          </View>
        </View>
      </RetroWindow>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  form: {
    gap: 16,
  },
  label: {
    fontFamily: 'PressStart2P',
    fontSize: 14,
    color: '#ffcc00',
  },
  input: {
    backgroundColor: '#2a2a40',
    borderWidth: 2,
    borderColor: '#444466',
    padding: 12,
    fontFamily: 'VT323',
    fontSize: 18,
    color: '#ffffff',
    borderRadius: 4,
  },
  errorText: {
    fontFamily: 'VT323',
    fontSize: 16,
    color: '#ff6666',
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
  },
  registerButton: {
    backgroundColor: '#2a2a40',
    borderColor: '#444466',
  },
});