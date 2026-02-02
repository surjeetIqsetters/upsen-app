import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '@app/types';
import { useAuthStore } from '@app/store';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { Avatar, Loading } from '@app/components';
import { formatTime } from '@app/utils/helpers';

import { useChatStore } from '@app/store/chatStore';
import { supabase } from '@app/services/supabase';

export const ChatScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const navigation = useNavigation();
  const { conversationId } = route.params;
  const { user } = useAuthStore();
  const {
    currentMessages,
    isLoading,
    sendMessage: sendMessageToStore,
    fetchMessages,
    subscribeToConversation,
    setCurrentConversation,
  } = useChatStore();

  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setCurrentConversation(conversationId);
    const unsubscribe = subscribeToConversation(conversationId);
    return () => {
      unsubscribe();
      setCurrentConversation(null);
    };
  }, [conversationId]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');
    try {
      await sendMessageToStore(conversationId, text);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    // API uses snake_case, internal types might use camelCase
    const senderId = item.sender_id || item.senderId;
    const isMe = senderId === user?.id;
    const sender = item.sender;
    const content = item.content;
    const createdAt = item.created_at || item.createdAt;

    return (
      <View style={[styles.messageContainer, isMe && styles.messageContainerMe]}>
        {!isMe && <Avatar source={sender?.avatar_url || sender?.avatarUrl} name={sender?.full_name || sender?.fullName || 'User'} size="sm" />}
        <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleOther]}>
          <Text style={[styles.messageText, isMe && styles.messageTextMe]}>{content}</Text>
          <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>
            {createdAt ? formatTime(createdAt) : ''}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading && currentMessages.length === 0) {
    return <Loading fullscreen text="Loading messages..." />;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Avatar name="Conversation" size="md" />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>Chat</Text>
          <Text style={styles.headerStatus}>Active Now</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="videocam" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="call" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={currentMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="attach" size={24} color={Colors.gray400} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginRight: Spacing.sm,
    padding: Spacing.xs,
  },
  headerInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  headerName: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  headerStatus: {
    fontSize: Typography.size.sm,
    color: Colors.success,
  },
  headerButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  messagesList: {
    padding: Spacing.base,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
  messageContainerMe: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginLeft: Spacing.sm,
  },
  messageBubbleMe: {
    backgroundColor: Colors.primary,
    marginLeft: 0,
  },
  messageBubbleOther: {
    backgroundColor: Colors.white,
  },
  messageText: {
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  messageTextMe: {
    color: Colors.white,
  },
  messageTime: {
    fontSize: Typography.size.xs,
    color: Colors.gray400,
    marginTop: Spacing.xs,
    alignSelf: 'flex-end',
  },
  messageTimeMe: {
    color: Colors.white + '80',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  attachButton: {
    padding: Spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.sm,
    fontSize: Typography.size.base,
  },
  sendButton: {
    padding: Spacing.sm,
  },
});
