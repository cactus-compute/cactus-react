import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const LoadingScreen = ({ progress }: { progress: number }) => (
  <View style={styles.container}>
    <Text style={styles.title}>
      Initializing VLM...
    </Text>
    <Text style={styles.progress}>
      {(progress * 100).toFixed(1)}%
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  progress: {
    fontSize: 16,
    marginBottom: 10,
  },
});