import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, News, NewsComment } from '@app/types';
import { newsApi } from '@app/services/api';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { Header, Card, Avatar, Loading } from '@app/components';
import { formatDate, getRelativeTime } from '@app/utils/helpers';
import Toast from 'react-native-toast-message';

export const NewsDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'NewsDetail'>>();
  const { newsId } = route.params;
  const [news, setNews] = useState<News | null>(null);
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    loadNewsDetail();
  }, [newsId]);

  const loadNewsDetail = async () => {
    try {
      const newsData = await newsApi.getNewsItem(newsId);
      setNews(newsData as News);
      const commentsData = await newsApi.getComments(newsId);
      setComments(commentsData.data as NewsComment[]);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        await newsApi.unlikeNews(newsId);
        setIsLiked(false);
      } else {
        await newsApi.likeNews(newsId);
        setIsLiked(true);
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to like news.' });
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      await newsApi.addComment(newsId, commentText);
      setCommentText('');
      loadNewsDetail();
      Toast.show({ type: 'success', text1: 'Comment Added!' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to add comment.' });
    }
  };

  if (isLoading || !news) {
    return (
      <View style={styles.container}>
        <Header title="News Detail" />
        <Loading fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="News Detail" />
      <ScrollView style={styles.content}>
        {news.imageUrl && <Image source={{ uri: news.imageUrl }} style={styles.newsImage} />}

        <View style={styles.newsHeader}>
          <Avatar source={news.author?.avatarUrl} name={news.author?.fullName || 'Author'} size="md" />
          <View style={styles.newsMeta}>
            <Text style={styles.authorName}>{news.author?.fullName || 'Unknown'}</Text>
            <Text style={styles.newsTime}>{getRelativeTime(news.createdAt)}</Text>
          </View>
        </View>

        <Text style={styles.newsTitle}>{news.title}</Text>
        <Text style={styles.newsContent}>{news.content}</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={24} color={isLiked ? Colors.error : Colors.gray400} />
            <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>{news.likesCount + (isLiked ? 1 : 0)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={24} color={Colors.gray400} />
            <Text style={styles.actionText}>{news.commentsCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={24} color={Colors.gray400} />
          </TouchableOpacity>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <Avatar source={comment.user.avatarUrl} name={comment.user.fullName} size="sm" />
              <View style={styles.commentContent}>
                <Text style={styles.commentAuthor}>{comment.user.fullName}</Text>
                <Text style={styles.commentText}>{comment.content}</Text>
                <Text style={styles.commentTime}>{getRelativeTime(comment.createdAt)}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.commentInputContainer}>
        <TextInput style={styles.commentInput} placeholder="Add a comment..." value={commentText} onChangeText={setCommentText} />
        <TouchableOpacity style={styles.sendButton} onPress={handleComment}>
          <Ionicons name="send" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  content: {
    padding: Spacing.base,
  },
  newsImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  newsMeta: {
    marginLeft: Spacing.sm,
  },
  authorName: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    color: Colors.textPrimary,
  },
  newsTime: {
    fontSize: Typography.size.sm,
    color: Colors.gray400,
  },
  newsTitle: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  newsContent: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.xl,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionText: {
    fontSize: Typography.size.base,
    color: Colors.gray400,
  },
  actionTextActive: {
    color: Colors.error,
  },
  commentsSection: {
    marginBottom: Spacing.xl,
  },
  commentsTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  commentContent: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  commentAuthor: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    color: Colors.textPrimary,
  },
  commentText: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  commentTime: {
    fontSize: Typography.size.xs,
    color: Colors.gray400,
    marginTop: 2,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.size.base,
  },
  sendButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
});
