import { View, Text, StyleSheet } from 'react-native';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'PressStart2P',
    fontSize: 20,
    color: '#ffcc00',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontFamily: 'VT323',
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
  },
});