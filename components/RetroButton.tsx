import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

interface RetroButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export default function RetroButton({ title, onPress, style, disabled = false }: RetroButtonProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        disabled ? styles.disabledButton : null,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ffcc00',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 3,
    borderTopColor: '#ffffaa',
    borderLeftColor: '#ffffaa',
    borderRightColor: '#aa8800',
    borderBottomColor: '#aa8800',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 50,
  },
  buttonText: {
    fontFamily: 'PressStart2P',
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#999999',
    borderTopColor: '#bbbbbb',
    borderLeftColor: '#bbbbbb',
    borderRightColor: '#777777',
    borderBottomColor: '#777777',
    opacity: 0.7,
  },
});