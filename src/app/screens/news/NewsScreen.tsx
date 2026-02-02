import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, News } from '@app/types';
import { useAuthStore } from '@app/store';
import { newsApi } from '@app/services/api';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { Card, Avatar, EmptyState, Loading } from '@app/components';
import { formatDate, getRelativeTime } from '@app/utils/helpers';

export const NewsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [news, setNews] = React.useState<News[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const response = await newsApi.getNews();
      setNews(response as News[]);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderNewsItem = ({ item }: { item: News }) => (
    <Card style={styles.newsCard} onPress={() => navigation.navigate('NewsDetail', { newsId: item.id })}>
      {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.newsImage} />}
      <View style={styles.newsContent}>
        <View style={styles.newsHeader}>
          <Avatar source={item.author?.avatarUrl} name={item.author?.fullName || 'Author'} size="sm" />
          <View style={styles.newsMeta}>
            <Text style={styles.authorName}>{item.author?.fullName || 'Unknown'}</Text>
            <Text style={styles.newsTime}>{getRelativeTime(item.createdAt)}</Text>
          </View>
        </View>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsExcerpt} numberOfLines={2}>
          {item.content.substring(0, 100)}...
        </Text>
        <View style={styles.newsFooter}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart-outline" size={18} color={Colors.gray400} />
            <Text style={styles.actionText}>{item.likesCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={18} color={Colors.gray400} />
            <Text style={styles.actionText}>{item.commentsCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={18} color={Colors.gray400} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={news}
        renderItem={renderNewsItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          isLoading ? (
            <Loading fullscreen={false} />
          ) : (
            <EmptyState
              title="No news"
              message="Check back later for company updates"
              icon="newspaper-outline"
            />
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  list: {
    padding: Spacing.base,
  },
  newsCard: {
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: 180,
  },
  newsContent: {
    padding: Spacing.md,
  },
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
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
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  newsExcerpt: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  newsFooter: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionText: {
    fontSize: Typography.size.sm,
    color: Colors.gray400,
  },
});
