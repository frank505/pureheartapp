import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

/**
 * ExploreScreen Component
 * 
 * This screen allows users to discover new content, features, or communities.
 * It's designed to showcase different categories and trending items.
 * 
 * Features:
 * - Category browsing with visual cards
 * - Trending section for popular content
 * - Search functionality placeholder
 * - Modern grid-like layout
 */
const ExploreScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Explore</Text>
            <Text style={styles.subtitle}>Discover new experiences</Text>
          </View>

          {/* Search Bar Placeholder */}
          <TouchableOpacity style={styles.searchBar}>
            <Text style={styles.searchText}>🔍 Search for anything...</Text>
          </TouchableOpacity>

          {/* Categories Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoriesGrid}>
              <TouchableOpacity style={styles.categoryCard}>
                <Text style={styles.categoryIcon}>🌟</Text>
                <Text style={styles.categoryName}>Featured</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.categoryCard}>
                <Text style={styles.categoryIcon}>🎨</Text>
                <Text style={styles.categoryName}>Creative</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.categoryCard}>
                <Text style={styles.categoryIcon}>🏃‍♂️</Text>
                <Text style={styles.categoryName}>Fitness</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.categoryCard}>
                <Text style={styles.categoryIcon}>📚</Text>
                <Text style={styles.categoryName}>Learning</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Trending Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            
            <TouchableOpacity style={styles.trendingItem}>
              <View style={styles.trendingContent}>
                <Text style={styles.trendingTitle}>🔥 Popular Challenge</Text>
                <Text style={styles.trendingDescription}>
                  Join thousands of users in this week's challenge
                </Text>
              </View>
              <Text style={styles.trendingArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.trendingItem}>
              <View style={styles.trendingContent}>
                <Text style={styles.trendingTitle}>✨ New Feature</Text>
                <Text style={styles.trendingDescription}>
                  Check out the latest addition to PureHeart
                </Text>
              </View>
              <Text style={styles.trendingArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.trendingItem}>
              <View style={styles.trendingContent}>
                <Text style={styles.trendingTitle}>🎉 Community Spotlight</Text>
                <Text style={styles.trendingDescription}>
                  See what the community is talking about
                </Text>
              </View>
              <Text style={styles.trendingArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    textAlign: 'center',
  },
  searchBar: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchText: {
    fontSize: 16,
    color: '#95a5a6',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    backgroundColor: '#1f2937',
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  trendingItem: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  trendingContent: {
    flex: 1,
  },
  trendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  trendingDescription: {
    fontSize: 14,
    color: '#a1a1aa',
    lineHeight: 20,
  },
  trendingArrow: {
    fontSize: 18,
    color: '#3498db',
    fontWeight: 'bold',
  },
});

export default ExploreScreen;