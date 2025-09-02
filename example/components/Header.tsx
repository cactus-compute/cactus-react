import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const Header = ({ onClearConversation }: { 
  onClearConversation?: () => void;
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>
      Cactus VLM Chat
    </Text>
    {onClearConversation && (
      <TouchableOpacity
        onPress={onClearConversation}
        style={styles.clearButton}
      >
        <Text style={styles.clearButtonText}>
          Clear
        </Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#007AFF',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});