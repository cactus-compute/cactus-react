import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Message } from '../cactus';

interface MessageBubbleProps {
  message: Message
}

export const MessageBubble = ({ message }: MessageBubbleProps) => (
  <View
    style={[
      styles.container,
      {
        backgroundColor: message.role === 'user' ? '#007AFF' : '#EEEEEE',
        marginLeft: message.role === 'user' ? 'auto' : '2%',
        marginRight: message.role === 'user' ? '2%' : 'auto',
      }
    ]}
  >
    {message.images && message.images.length > 0 && (
      <View style={styles.imagesContainer}>
        {message.images.map((imageUri, index) => (
          <Image
            key={index}
            source={{ uri: imageUri }}
            style={[
              styles.image,
              {
                marginBottom: index < message.images!.length - 1 ? 8 : 0,
              }
            ]}
            resizeMode="cover"
          />
        ))}
      </View>
    )}
    <Text style={[
      styles.text,
      {
        color: message.role === 'user' ? 'white' : 'black',
      }
    ]}>
      {message.content?.toString() || ''}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    maxWidth: '80%',
    marginBottom: 8,
    padding: 12,
  },
  imagesContainer: {
    marginBottom: 8,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
  },
});