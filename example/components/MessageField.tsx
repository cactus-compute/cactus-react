import React from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

interface MessageFieldProps {
  message: string;
  setMessage: (text: string) => void;
  onSendMessage: () => void;
  isGenerating: boolean;
  attachedImages: string[];
  onAttachImage: () => void;
  onRemoveImage: (index: number) => void;
}

export const MessageField = ({
  message,
  setMessage,
  onSendMessage,
  isGenerating,
  attachedImages,
  onAttachImage,
  onRemoveImage
}: MessageFieldProps) => (
  <View style={styles.container}>
    {attachedImages.length > 0 && (
      <ScrollView
        horizontal
        style={styles.imagesScrollView}
        showsHorizontalScrollIndicator={false}
      >
        {attachedImages.map((imageUri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.attachedImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => onRemoveImage(index)}
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    )}

    <View style={styles.inputRow}>
      <TouchableOpacity
        onPress={onAttachImage}
        style={styles.cameraButton}
      >
        <Text style={styles.cameraButtonText}>📷</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.textInput}
        value={message}
        onChangeText={setMessage}
        placeholder="Type a message or attach an image..."
        multiline
        editable={!isGenerating}
      />

      <TouchableOpacity
        onPress={onSendMessage}
        disabled={isGenerating || (!message.trim() && attachedImages.length === 0)}
        style={[
          styles.sendButton,
          {
            backgroundColor: isGenerating || (!message.trim() && attachedImages.length === 0)
              ? '#ccc'
              : '#007AFF',
          }
        ]}
      >
        <Text style={styles.sendButtonText}>
          {isGenerating ? '...' : '➤'}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
  },
  imagesScrollView: {
    marginBottom: 12,
  },
  imageContainer: {
    marginRight: 8,
    position: 'relative',
  },
  attachedImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  cameraButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 16,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});