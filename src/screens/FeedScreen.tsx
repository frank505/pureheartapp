/**
 * Feed Screen Component
 * 
 * This screen showcases the infinite scroll functionality with a social media feed.
 * It demonstrates Redux integration, infinite loading, and modern UI components.
 * 
 * Features:
 * - Infinite scroll with automatic pagination
 * - Pull-to-refresh functionality
 * - Like and bookmark interactions with optimistic updates
 * - Redux state management for posts
 * - React Native Paper UI components
 * - Loading states and error handling
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar } from 'react-native-paper';

// Redux imports
import { useAppDispatch } from '../store/hooks';
import { optimisticLike, optimisticBookmark, likePost, bookmarkPost, Post } from '../store/slices/postsSlice';

// Component imports
import InfiniteScrollList from '../components/InfiniteScrollList';
import Icon from '../components/Icon';

// Constants
import { Icons } from '../constants';

/**
 * Feed Screen Component
 * 
 * Main component that renders the social media feed with infinite scroll.
 * Integrates with Redux for state management and provides user interactions.
 */
const FeedScreen: React.FC = () => {
  const dispatch = useAppDispatch();

  /**
   * Handle Post Press
   * 
   * Called when user taps on a post. In a real app, this would
   * navigate to a detailed post view.
   */
  const handlePostPress = useCallback((post: Post) => {
    Alert.alert(
      'Post Details',
      `You tapped on "${post.title}" by ${post.author.name}`,
      [{ text: 'OK' }]
    );
  }, []);

  /**
   * Handle Like Press
   * 
   * Handles liking/unliking a post with optimistic updates.
   * First updates UI immediately, then sends API request.
   */
  const handleLikePress = useCallback((post: Post) => {
    // Optimistic update for immediate UI feedback
    dispatch(optimisticLike(post.id));
    
    // Send API request (will revert optimistic update if it fails)
    dispatch(likePost(post.id));
  }, [dispatch]);

  /**
   * Handle Bookmark Press
   * 
   * Handles bookmarking/unbookmarking a post with optimistic updates.
   * First updates UI immediately, then sends API request.
   */
  const handleBookmarkPress = useCallback((post: Post) => {
    // Optimistic update for immediate UI feedback
    dispatch(optimisticBookmark(post.id));
    
    // Send API request (will revert optimistic update if it fails)
    dispatch(bookmarkPost(post.id));
  }, [dispatch]);

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <Appbar.Header style={styles.header}>
        <Appbar.Content 
          title="Feed" 
          titleStyle={styles.headerTitle}
        />
        <Appbar.Action 
          icon={() => <Icon name={Icons.navigation.search.name} color="#ffffff" />}
          onPress={() => Alert.alert('Search', 'Search functionality coming soon!')} 
        />
        <Appbar.Action 
          icon={() => <Icon name={Icons.navigation.add.name} color="#ffffff" />}
          onPress={() => Alert.alert('Create Post', 'Create post functionality coming soon!')} 
        />
      </Appbar.Header>

      {/* Infinite Scroll List */}
      <InfiniteScrollList
        onItemPress={handlePostPress}
        onLikePress={handleLikePress}
        onBookmarkPress={handleBookmarkPress}
        testID="feed-infinite-scroll-list"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    backgroundColor: '#1f2937',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default FeedScreen;