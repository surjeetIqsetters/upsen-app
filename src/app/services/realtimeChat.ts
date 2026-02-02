import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'voice';
  file_url?: string;
  created_at: string;
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  created_by: string;
  created_at: string;
  last_message?: Message;
  unread_count: number;
  participants?: Participant[];
}

export interface Participant {
  id: string;
  user_id: string;
  conversation_id: string;
  last_read_at?: string;
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
    is_online?: boolean;
  };
}

class RealtimeChatService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private messageCallbacks: Map<string, ((message: Message) => void)[]> = new Map();
  private typingCallbacks: Map<string, ((userId: string, isTyping: boolean) => void)[]> = new Map();

  // Subscribe to a conversation for real-time messages
  subscribeToConversation(
    conversationId: string,
    onNewMessage: (message: Message) => void,
    onMessageUpdated?: (message: Message) => void,
    onMessageDeleted?: (messageId: string) => void
  ): RealtimeChannel {
    // Unsubscribe from existing channel for this conversation
    this.unsubscribeFromConversation(conversationId);

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const message = payload.new as Message;
          // Fetch sender details
          const { data: senderData } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', message.sender_id)
            .single();
          
          const sender = senderData ? {
            id: senderData.id,
            full_name: senderData.full_name,
            avatar_url: senderData.avatar_url || undefined
          } : undefined;

          const messageWithSender = { ...message, sender };
          onNewMessage(messageWithSender);
          
          // Trigger registered callbacks
          const callbacks = this.messageCallbacks.get(conversationId) || [];
          callbacks.forEach(cb => cb(messageWithSender));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (onMessageUpdated) {
            onMessageUpdated(payload.new as Message);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (onMessageDeleted) {
            onMessageDeleted(payload.old.id);
          }
        }
      )
      .subscribe();

    this.channels.set(conversationId, channel);
    return channel;
  }

  // Subscribe to user's conversations for new messages
  subscribeToConversations(
    userId: string,
    onConversationUpdate: (conversation: Conversation) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel(`user-conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_members',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          // Fetch updated conversation details
          const { data: conversation } = await supabase
            .from('conversations')
            .select(`
              *,
              last_message:messages(*),
              participants:conversation_members(
                *,
                user:profiles(id, full_name, avatar_url)
              )
            `)
            .eq('id', (payload as any).new.conversation_id)
            .single();
          
          if (conversation) {
            onConversationUpdate(conversation as Conversation);
          }
        }
      )
      .subscribe();

    this.channels.set(`user-${userId}`, channel);
    return channel;
  }

  // Subscribe to typing indicators
  subscribeToTypingIndicators(
    conversationId: string,
    onTypingChange: (userId: string, isTyping: boolean) => void
  ): void {
    const channel = supabase.channel(`typing:${conversationId}`);
    
    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        onTypingChange(payload.payload.userId, payload.payload.isTyping);
      })
      .subscribe();

    this.channels.set(`typing-${conversationId}`, channel);
  }

  // Send typing indicator
  async sendTypingIndicator(conversationId: string, isTyping: boolean): Promise<void> {
    const channel = this.channels.get(`typing-${conversationId}`);
    if (channel) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        channel.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId: user.id, isTyping },
        });
      }
    }
  }

  // Unsubscribe from a conversation
  unsubscribeFromConversation(conversationId: string): void {
    const channel = this.channels.get(conversationId);
    if (channel) {
      channel.unsubscribe();
      this.channels.delete(conversationId);
    }
    
    const typingChannel = this.channels.get(`typing-${conversationId}`);
    if (typingChannel) {
      typingChannel.unsubscribe();
      this.channels.delete(`typing-${conversationId}`);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll(): void {
    this.channels.forEach((channel) => {
      channel.unsubscribe();
    });
    this.channels.clear();
    this.messageCallbacks.clear();
    this.typingCallbacks.clear();
  }

  // Register message callback for a conversation
  onMessage(conversationId: string, callback: (message: Message) => void): () => void {
    const callbacks = this.messageCallbacks.get(conversationId) || [];
    callbacks.push(callback);
    this.messageCallbacks.set(conversationId, callbacks);
    
    // Return unsubscribe function
    return () => {
      const currentCallbacks = this.messageCallbacks.get(conversationId) || [];
      this.messageCallbacks.set(
        conversationId,
        currentCallbacks.filter(cb => cb !== callback)
      );
    };
  }

  // Fetch conversations for current user
  async getConversations(): Promise<Conversation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('conversation_members')
      .select(`
        conversation:conversations(
          *,
          last_message:messages(*),
          participants:conversation_members(
            *,
            user:profiles(id, full_name, avatar_url, is_online)
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data?.map((item: any) => item.conversation) || []) as Conversation[];
  }

  // Fetch messages for a conversation
  async getMessages(
    conversationId: string,
    page = 1,
    limit = 50
  ): Promise<{ messages: Message[]; hasMore: boolean }> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles(id, full_name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return {
      messages: (data || []).reverse() as Message[],
      hasMore: (data?.length || 0) === limit,
    };
  }

  // Send a message
  async sendMessage(
    conversationId: string,
    content: string,
    type: 'text' | 'image' | 'file' | 'voice' = 'text',
    fileUrl?: string
  ): Promise<Message> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        type,
        file_url: fileUrl,
      })
      .select(`
        *,
        sender:profiles(id, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    // Update conversation's last_message
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data as Message;
  }

  // Create a new conversation
  async createConversation(
    participantIds: string[],
    isGroup = false,
    name?: string
  ): Promise<Conversation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        type: isGroup ? 'group' : 'direct',
        name,
        created_by: user.id,
      })
      .select()
      .single();

    if (convError) throw convError;

    // Add participants
    const allParticipants = [...new Set([...participantIds, user.id])];
    const memberInserts = allParticipants.map((userId) => ({
      conversation_id: conversation.id,
      user_id: userId,
    }));

    const { error: memberError } = await supabase
      .from('conversation_members')
      .insert(memberInserts);

    if (memberError) throw memberError;

    return conversation as Conversation;
  }

  // Mark messages as read
  async markAsRead(conversationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('conversation_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // Get unread message count
  async getUnreadCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data, error } = await supabase.rpc('get_unread_message_count', {
      p_user_id: user.id,
    });

    if (error) throw error;
    return data || 0;
  }

  // Upload file for message
  async uploadFile(file: File, conversationId: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${conversationId}/${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-files')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('chat-files')
      .getPublicUrl(fileName);

    return publicUrl;
  }
}

export const realtimeChat = new RealtimeChatService();
export default realtimeChat;
