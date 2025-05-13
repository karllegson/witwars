import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { X } from 'lucide-react-native';

interface RetroWindowProps {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function RetroWindow({ title, children, style }: RetroWindowProps) {
  return (
    <View style={[styles.window, style]}>
      <View style={styles.titleBar}>
        <Text style={styles.titleText}>{title}</Text>
        <TouchableOpacity style={styles.closeButton}>
          <X size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  window: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#333344',
    borderWidth: 2,
    borderColor: '#666677',
    borderRadius: 8,
    overflow: 'hidden',
  },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#222233',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#444455',
  },
  titleText: {
    fontFamily: 'VT323',
    fontSize: 20,
    color: '#ffffff',
  },
  closeButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff3333',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  content: {
    flex: 1,
    backgroundColor: '#222233',
  },
});