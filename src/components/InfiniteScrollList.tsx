/**
 * Infinite Scroll List Component
 * 
 * A reusable component that provides infinite scroll functionality using FlatList.
 * It handles loading more data when the user scrolls near the bottom and provides
 * loading indicators and error handling.
 * 
 * Features:
 * - Infinite scroll with automatic loading
 * - Pull-to-refresh functionality
 * - Loading indicators for smooth UX
 * - Error handling and retry mechanisms
 * - Optimized performance with FlatList
 * - Customizable item rendering
 */

import React, { useCallback, useEffect } from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  RefreshControl,
  ListRenderItem,
  Text,
  TouchableOpacity,
} from 'react-native';
import { ActivityIndicator, Card, Title, Paragraph, Button } from 'react-native-paper';

// Redux imports
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPosts, loadMorePosts, Post } from '../store/slices/postsSlice';

/**
 * Props Interface
 * 
 * Defines the props that can be passed to the InfiniteScrollList component.
 */
interface InfiniteScrollListProps {
  onItemPress?: (item: Post) => void;
  onLikePress?: (item: Post) => void;
  onBookmarkPress?: (item: Post) => void;
  testID?: string;
}

/**
 * Post Item Component
 * 
 * Renders an individual post item in the list.
 * Uses React Native Paper components for consistent styling.
 */
interface PostItemProps {
  item: Post;
  onPress?: (item: Post) => void;
  onLikePress?: (item: Post) => void;
  onBookmarkPress?: (item: Post) => void;
}

const PostItem: React.FC<PostItemProps> = ({
  item,
  onPress,
  onLikePress,
  onBookmarkPress,
}) => {
  return (
    <Card style={styles.postCard} onPress={() => onPress?.(item)}>
      <Card.Content>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.authorInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.author.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.authorDetails}>
              <Title style={styles.authorName}>{item.author.name}</Title>
              <Paragraph style={styles.postDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Paragraph>
            </View>
          </View>
        </View>

        {/* Post Content */}
        <Title style={styles.postTitle}>{item.title}</Title>
        <Paragraph style={styles.postContent} numberOfLines={3}>
          {item.content}
        </Paragraph>

        {/* Tags */}
        {item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Post Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, item.isLiked && styles.likedButton]}
            onPress={() => onLikePress?.(item)}
          >
            <Text style={styles.actionIcon}>
              {item.isLiked ? '❤️' : '🤍'}
            </Text>
            <Text style={styles.actionText}>{item.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>{item.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, item.isBookmarked && styles.bookmarkedButton]}
            onPress={() => onBookmarkPress?.(item)}
          >
            <Text style={styles.actionIcon}>
              {item.isBookmarked ? '🔖' : '📑'}
            </Text>
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );
};

/**
 * Loading Footer Component
 * 
 * Shows loading indicator when loading more posts.
 */
const LoadingFooter: React.FC<{ loading: boolean }> = ({ loading }) => {
  if (!loading) return null;

  return (
    <View style={styles.loadingFooter}>
      <ActivityIndicator size="small" />
      <Text style={styles.loadingText}>Loading more posts...</Text>
    </View>
  );
};

/**
 * Error Component
 * 
 * Shows error message with retry option.
 */
const ErrorComponent: React.FC<{ error: string; onRetry: () => void }> = ({
  error,
  onRetry,
}) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>{error}</Text>
    <Button mode="contained" onPress={onRetry} style={styles.retryButton}>
      Retry
    </Button>
  </View>
);

/**
 * Empty State Component
 * 
 * Shows when there are no posts to display.
 */
const EmptyComponent: React.FC = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>📝</Text>
    <Text style={styles.emptyTitle}>No posts yet</Text>
    <Text style={styles.emptyText}>
      Be the first to share something inspiring!
    </Text>
  </View>
);

/**
 * Infinite Scroll List Component
 * 
 * Main component that provides infinite scroll functionality.
 */
const InfiniteScrollList: React.FC<InfiniteScrollListProps> = ({
  onItemPress,
  onLikePress,
  onBookmarkPress,
  testID,
}) => {
  const dispatch = useAppDispatch();
  const {
    posts,
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore,
  } = useAppSelector(state => state.posts);

  /**
   * Initial Data Load
   * 
   * Load posts when component mounts.
   */
  useEffect(() => {
    if (posts.length === 0 && !loading) {
      dispatch(fetchPosts());
    }
  }, [dispatch, posts.length, loading]);

  /**
   * Handle Refresh
   * 
   * Refreshes the list by fetching new posts.
   */
  const handleRefresh = useCallback(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  /**
   * Handle Load More
   * 
   * Loads more posts when user scrolls to the bottom.
   */
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && posts.length > 0) {
      dispatch(loadMorePosts());
    }
  }, [dispatch, loadingMore, hasMore, posts.length]);

  /**
   * Handle Retry
   * 
   * Retries loading posts after an error.
   */
  const handleRetry = useCallback(() => {
    if (posts.length === 0) {
      dispatch(fetchPosts());
    } else {
      dispatch(loadMorePosts());
    }
  }, [dispatch, posts.length]);

  /**
   * Render Post Item
   * 
   * Renders individual post items with proper callbacks.
   */
  const renderItem: ListRenderItem<Post> = useCallback(
    ({ item }) => (
      <PostItem
        item={item}
        onPress={onItemPress}
        onLikePress={onLikePress}
        onBookmarkPress={onBookmarkPress}
      />
    ),
    [onItemPress, onLikePress, onBookmarkPress]
  );

  /**
   * Key Extractor
   * 
   * Provides unique keys for FlatList items.
   */
  const keyExtractor = useCallback((item: Post) => item.id, []);

  // Show error state for initial load
  if (error && posts.length === 0) {
    return <ErrorComponent error={error} onRetry={handleRetry} />;
  }

  return (
    <FlatList
      testID={testID}
      data={posts}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      
      // Infinite scroll configuration
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5} // Load more when 50% from bottom
      
      // Pull to refresh
      refreshControl={
        <RefreshControl
          refreshing={refreshing || loading}
          onRefresh={handleRefresh}
          colors={['#3498db']} // Android
          tintColor="#3498db" // iOS
        />
      }
      
      // Loading and empty states
      ListFooterComponent={<LoadingFooter loading={loadingMore} />}
      ListEmptyComponent={loading ? null : <EmptyComponent />}
      
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={100}
      initialNumToRender={10}
      windowSize={10}
      
      // Styling
      showsVerticalScrollIndicator={false}
      bounces={true}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentContainer: {
    padding: 16,
  },
  postCard: {
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: '#1f2937',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  postDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#ffffff',
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#a1a1aa',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  likedButton: {
    backgroundColor: '#4b5563',
  },
  bookmarkedButton: {
    backgroundColor: '#4b5563',
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#7f8c8d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default InfiniteScrollList;