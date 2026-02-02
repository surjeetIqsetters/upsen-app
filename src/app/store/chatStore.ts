import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { realtimeChat, type Message, type Conversation } from '@app/services/realtimeChat';
import { chatApi } from '@app/services/api';
import { StorageKeys } from '@app/utils/constants';
import Toast from 'react-native-toast-message';

interface ChatState {
  conversations: Conversation[];
  currentMessages: Message[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  unreadCount: number;
  currentConversationId: string | null;
  hasMoreMessages: boolean;
  currentPage: number;
  
  // Actions
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string, page?: number, append?: boolean) => Promise<void>;
  sendMessage: (conversationId: string, content: string, type?: 'text' | 'image' | 'file', fileUrl?: string) => Promise<void>;
  createConversation: (participantIds: string[], isGroup?: boolean, name?: string) => Promise<string>;
  markAsRead: (conversationId: string) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  subscribeToConversation: (conversationId: string) => () => void;
  subscribeToConversations: () => () => void;
  setCurrentConversation: (conversationId: string | null) => void;
  loadMoreMessages: () => Promise<void>;
  uploadAndSendFile: (conversationId: string, file: any, type: 'image' | 'file') => Promise<void>;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentMessages: [],
      isLoading: false,
      isSending: false,
      error: null,
      unreadCount: 0,
      currentConversationId: null,
      hasMoreMessages: true,
      currentPage: 1,

      fetchConversations: async () => {
        set({ isLoading: true, error: null });
        try {
          const conversations = await realtimeChat.getConversations();
          set({ conversations, isLoading: false });
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch conversations', isLoading: false });
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to load conversations',
          });
        }
      },

      fetchMessages: async (conversationId, page = 1, append = false) => {
        if (page === 1) set({ isLoading: true });
        try {
          const { messages, hasMore } = await realtimeChat.getMessages(conversationId, page);
          set((state) => ({
            currentMessages: append 
              ? [...messages, ...state.currentMessages] 
              : messages,
            hasMoreMessages: hasMore,
            currentPage: page,
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      loadMoreMessages: async () => {
        const { currentConversationId, currentPage, hasMoreMessages } = get();
        if (!currentConversationId || !hasMoreMessages) return;
        
        await get().fetchMessages(currentConversationId, currentPage + 1, true);
      },

      sendMessage: async (conversationId, content, type = 'text', fileUrl) => {
        set({ isSending: true });
        try {
          const message = await realtimeChat.sendMessage(conversationId, content, type, fileUrl);
          set((state) => ({
            currentMessages: [...state.currentMessages, message],
            isSending: false,
          }));
          
          // Update conversation last message
          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === conversationId
                ? { ...conv, last_message: message }
                : conv
            ),
          }));
        } catch (error: any) {
          set({ error: error.message, isSending: false });
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to send message',
          });
        }
      },

      uploadAndSendFile: async (conversationId, file, type) => {
        set({ isSending: true });
        try {
          // Upload file
          const fileUrl = await realtimeChat.uploadFile(file, conversationId);
          
          // Send message with file
          await get().sendMessage(conversationId, file.name, type, fileUrl);
        } catch (error: any) {
          set({ error: error.message, isSending: false });
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to upload file',
          });
        }
      },

      createConversation: async (participantIds, isGroup = false, name) => {
        try {
          const conversation = await realtimeChat.createConversation(
            participantIds,
            isGroup,
            name
          );
          set((state) => ({
            conversations: [conversation, ...state.conversations],
          }));
          return conversation.id;
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to create conversation',
          });
          throw error;
        }
      },

      markAsRead: async (conversationId) => {
        try {
          await realtimeChat.markAsRead(conversationId);
          
          // Update local unread count
          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
            ),
          }));
          
          // Recalculate total unread
          get().fetchUnreadCount();
        } catch (error: any) {
          console.error('Failed to mark as read:', error);
        }
      },

      fetchUnreadCount: async () => {
        try {
          const count = await realtimeChat.getUnreadCount();
          set({ unreadCount: count });
        } catch (error) {
          console.error('Failed to fetch unread count:', error);
        }
      },

      subscribeToConversation: (conversationId) => {
        const unsubscribe = realtimeChat.subscribeToConversation(
          conversationId,
          (message) => {
            // Only add if not already in list (prevents duplicates)
            set((state) => {
              const exists = state.currentMessages.some((m) => m.id === message.id);
              if (exists) return state;
              return { currentMessages: [...state.currentMessages, message] };
            });
            
            // Update conversation last message
            set((state) => ({
              conversations: state.conversations.map((conv) =>
                conv.id === conversationId
                  ? { ...conv, last_message: message, unread_count: (conv.unread_count || 0) + 1 }
                  : conv
              ),
            }));
          },
          (updatedMessage) => {
            set((state) => ({
              currentMessages: state.currentMessages.map((m) =>
                m.id === updatedMessage.id ? updatedMessage : m
              ),
            }));
          },
          (deletedMessageId) => {
            set((state) => ({
              currentMessages: state.currentMessages.filter((m) => m.id !== deletedMessageId),
            }));
          }
        );
        
        return () => {
          unsubscribe.unsubscribe();
        };
      },

      subscribeToConversations: () => {
        // This would need the current user ID
        // For now, we'll just fetch periodically
        const interval = setInterval(() => {
          get().fetchConversations();
          get().fetchUnreadCount();
        }, 30000); // Every 30 seconds
        
        return () => clearInterval(interval);
      },

      setCurrentConversation: (conversationId) => {
        set({ 
          currentConversationId: conversationId,
          currentMessages: [],
          currentPage: 1,
          hasMoreMessages: true,
        });
        if (conversationId) {
          get().fetchMessages(conversationId);
        }
      },
    }),
    {
      name: StorageKeys.authUser + '_chat',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        conversations: state.conversations,
        unreadCount: state.unreadCount,
      }),
    }
  )
);
