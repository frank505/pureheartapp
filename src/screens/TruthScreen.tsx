/**
 * TruthScreen Component
 * 
 * "Lies vs Truth Center" helping users identify lies and replace them with biblical truth.
 * Features common lies, custom lie input, biblical truth response, and progress tracking.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import {
  Text,
  Surface,
  Searchbar,
  Chip,
  Portal,
  Modal,
} from 'react-native-paper';
import { truthService, TruthEntry } from '../services/truthService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, ProfileDropdown, ScreenHeader } from '../components';
import { Colors, Icons } from '../constants';
import InfiniteScrollList from '../components/InfiniteScrollList';
import useDebounce from '../hooks/useDebounce';

import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TruthStackParamList } from '../navigation/TruthNavigator';
import { RootStackParamList } from '../navigation/types';

const { width: screenWidth } = Dimensions.get('window');


type TruthScreenProps = CompositeScreenProps<
  NativeStackScreenProps<TruthStackParamList, 'TruthList'>,
  NativeStackScreenProps<RootStackParamList>
>;

const TruthScreen: React.FC<TruthScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [isAddingLie, setIsAddingLie] = useState(false);
  const [newLie, setNewLie] = useState('');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(0)).current;
  const cardAnimations = useRef<Animated.Value[]>([]).current;

  const startShimmerAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);
  const [loading, setLoading] = useState(false);
  const [lies, setLies] = useState<TruthEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  
  const fetchLies = useCallback(async (resetPage = false) => {
    try {
      if (resetPage) {
        setPage(1);
      }
      
      setError(null);
      if (!refreshing) {
        setLoading(true);
      }
      
      const currentPage = resetPage ? 1 : page;
      const response = await truthService.getUserTruthEntries({
        search: debouncedSearchQuery || undefined
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch lies');
      }

      if (currentPage === 1) {
        setLies(response.data);
      } else {
        setLies(prevLies => [...prevLies, ...response.data]);
      }
      // Since we don't have pagination from the API, we'll set totalPages to 1
      setTotalPages(1);
      
    } catch (err) {
      setError('Failed to fetch lies. Please try again.');
      console.error('Error fetching lies:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedSearchQuery, page, refreshing]);

  useEffect(() => {
    fetchLies(true);
    
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(fabScale, {
        toValue: 1,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [debouncedSearchQuery]);

  // Animate cards when data changes
  useEffect(() => {
    if (lies.length > 0) {
      // Reset animations for existing cards
      cardAnimations.forEach(anim => anim.setValue(0));
      
      // Create animations for new cards if needed
      while (cardAnimations.length < lies.length) {
        cardAnimations.push(new Animated.Value(0));
      }
      
      // Animate cards in sequence
      lies.forEach((_, index) => {
        if (cardAnimations[index]) {
          Animated.timing(cardAnimations[index], {
            toValue: 1,
            duration: 400,
            delay: index * 100,
            useNativeDriver: true,
          }).start();
        }
      });
    }
  }, [lies.length]);

  useEffect(() => {
    if (loading && !refreshing) {
      startShimmerAnimation();
    }
  }, [loading, refreshing, startShimmerAnimation]);

  const handleRetry = () => {
    fetchLies(true);
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLies(true);
  }, [fetchLies]);

  const viewTruthDetail = async (lie: string, truth?: string, explanation?: string) => {
    try {
      if (!truth) {
        const response = await truthService.generateResponseToLie(lie);
        if (response.success && response.data) {
          truth = response.data.biblicalTruth;
          explanation = response.data.explanation;
        }
      }
      navigation.navigate('TruthDetail', { lie, truth, explanation });
    } catch (err) {
      console.error('Error generating truth response:', err);
      navigation.navigate('TruthDetail', { lie, truth, explanation });
    }
  };

  const editTruth = (lie: string, truth?: string) => {
    navigation.navigate('AddTruth', { lie, truth, isEditing: true });
  };

  const handleAddNewTruth = () => {
    navigation.navigate('AddTruth', {});
  };



  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const renderLieItem = ({ item, index }: { item: TruthEntry; index: number }) => {
    const cardAnim = cardAnimations[index] || new Animated.Value(1);
    
    return (
      <Animated.View
        style={[
          {
            opacity: cardAnim,
            transform: [
              {
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
              {
                scale: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity 
          onPress={() => viewTruthDetail(item.lie, item.biblicalTruth, item.explanation)}
          activeOpacity={0.8}
        >
          <View style={styles.lieCard}>
            <View style={styles.lieCardHeader}>
              <View style={styles.lieIconContainer}>
                <Icon 
                  name={item.biblicalTruth ? "checkmark-circle" : "help-circle-outline"} 
                  size="md" 
                  color={item.biblicalTruth ? Colors.primary.main : Colors.warning.main} 
                />
              </View>
              <View style={styles.lieStatusBadge}>
                <Text style={[
                  styles.lieStatusText, 
                  { color: item.biblicalTruth ? Colors.primary.main : Colors.warning.main }
                ]}>
                  {item.biblicalTruth ? 'Truth Found' : 'Needs Truth'}
                </Text>
              </View>
            </View>
            
            <View style={styles.lieContent}>
              <Text style={styles.lieText} numberOfLines={3}>{item.lie}</Text>
              {item.biblicalTruth && (
                <View style={styles.truthPreview}>
                  <Text style={styles.truthPreviewText} numberOfLines={2}>
                    {item.biblicalTruth}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.lieCardFooter}>
              <TouchableOpacity 
                style={[
                  styles.actionChip,
                  { backgroundColor: item.biblicalTruth ? Colors.primary.main + '20' : Colors.warning.main + '20' }
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  editTruth(item.lie, item.biblicalTruth);
                }}
              >
                <Icon 
                  name={item.biblicalTruth ? "create-outline" : "add-circle-outline"}
                  color={item.biblicalTruth ? Colors.primary.main : Colors.warning.main}
                  size="sm" 
                />
                <Text style={[
                  styles.actionChipText,
                  { color: item.biblicalTruth ? Colors.primary.main : Colors.warning.main }
                ]}>
                  {item.biblicalTruth ? 'Edit Truth' : 'Add Truth'}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.chevronContainer}>
                <Icon 
                  name="chevron-forward-outline" 
                  color={Colors.text.secondary} 
                  size="sm" 
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const loadMoreData = () => {
    if (!loading && page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScreenHeader 
          title="Lies vs Truth" 
          showBackButton
          navigation={navigation} 
        />
      </Animated.View>

      {/* Enhanced Search Section */}
      <Animated.View 
        style={[
          styles.searchSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search lies and truths..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={Colors.primary.main}
            placeholderTextColor={Colors.text.secondary}
          />
        </View>
        
        
      </Animated.View>

      {/* Content Area */}
      <Animated.View 
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        {loading && !refreshing ? (
          <FlatList
            data={[1, 2, 3, 4, 5]}
            renderItem={() => {
              const animatedStyle = {
                opacity: shimmerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.7],
                }),
              };

              return (
                <View style={styles.skeletonCard}>
                  <View style={styles.skeletonHeader}>
                    <Animated.View style={[styles.skeletonCircle, animatedStyle]} />
                    <Animated.View style={[styles.skeletonBadge, animatedStyle]} />
                  </View>
                  <View style={styles.skeletonContent}>
                    <Animated.View style={[styles.skeletonLine, { width: '90%' }, animatedStyle]} />
                    <Animated.View style={[styles.skeletonLine, { width: '70%' }, animatedStyle]} />
                  </View>
                  <View style={styles.skeletonFooter}>
                    <Animated.View style={[styles.skeletonChip, animatedStyle]} />
                  </View>
                </View>
              );
            }}
            keyExtractor={(item) => item.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : error ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorIconContainer}>
              <Icon name="alert-circle" color={Colors.error.main} size="xl" />
            </View>
            <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Icon name="refresh" color={Colors.white} size="sm" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : lies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Icon name="library-outline" color={Colors.text.secondary} size="xl" />
            </View>
            <Text style={styles.emptyTitle}>No Lies Recorded Yet</Text>
            <Text style={styles.emptyText}>
              Start your journey to truth by recording lies you want to overcome
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton} 
              onPress={() => navigation.navigate('AddTruth', {})}
            >
              <Icon name="add" color={Colors.white} size="sm" />
              <Text style={styles.emptyButtonText}>Add Your First Lie</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={lies}
            renderItem={renderLieItem}
            keyExtractor={(item: TruthEntry) => item.id.toString()}
            onEndReached={loadMoreData}
            onEndReachedThreshold={0.5}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={() => loading && page > 1 ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color={Colors.primary.main} size="large" />
                <Text style={styles.loadingText}>Loading more...</Text>
              </View>
            ) : null}
          />
        )}
      </Animated.View>
      
      {/* Enhanced Floating Action Button */}
      <Animated.View 
        style={[
          styles.fabContainer,
          {
            transform: [{ scale: fabScale }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddTruth', {})}
          activeOpacity={0.8}
        >
          <Icon name="add" size="lg" color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.fabLabel}>Add Lie</Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  // Enhanced Header
  header: {
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.tertiary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 24,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Enhanced Search Section
  searchSection: {
    backgroundColor: Colors.background.primary,
    paddingBottom: 16,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.background.tertiary,
  },
  searchInput: {
    color: Colors.text.primary,
    fontSize: 16,
  },

  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.background.tertiary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    backgroundColor: Colors.primary.main + '20',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.secondary,
    textAlign: 'center',
  },

  // Content Container
  contentContainer: {
    flex: 1,
  },

  // Enhanced Lie Cards
  lieCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.background.tertiary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  lieCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
  },
  lieIconContainer: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: 12,
    padding: 8,
  },
  lieStatusBadge: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  lieStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lieContent: {
    padding: 16,
    paddingTop: 0,
  },
  lieText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    lineHeight: 24,
    marginBottom: 12,
  },
  truthPreview: {
    backgroundColor: Colors.primary.main + '10',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary.main,
    paddingLeft: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  truthPreviewText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  lieCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
    backgroundColor: Colors.background.primary + '40',
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  actionChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chevronContainer: {
    backgroundColor: Colors.background.tertiary,
    padding: 6,
    borderRadius: 8,
  },

  // Enhanced Loading States
  skeletonCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.background.tertiary,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  skeletonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.tertiary,
  },
  skeletonBadge: {
    width: 80,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.background.tertiary,
  },
  skeletonContent: {
    marginBottom: 12,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: Colors.background.tertiary,
    borderRadius: 8,
    marginVertical: 4,
  },
  skeletonFooter: {
    alignItems: 'flex-start',
  },
  skeletonChip: {
    width: 100,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background.tertiary,
  },

  // Enhanced Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorIconContainer: {
    backgroundColor: Colors.error.main + '20',
    borderRadius: 32,
    padding: 16,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    color: Colors.text.secondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // Enhanced Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconContainer: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: 32,
    padding: 16,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: Colors.text.secondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // List
  listContent: {
    paddingVertical: 8,
    paddingBottom: 120,
  },
  footerLoader: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },

  // Enhanced FAB
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'center',
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 8,
  },
  fabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
  },

  // Legacy styles (keeping for compatibility)
  skeletonContainer: {
    flex: 1,
    padding: 8,
  },
  separator: {
    height: 12,
  },
  truthIndicator: {
    marginRight: 8,
  },
  addButton: {
    padding: 4,
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  input: {
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    borderRadius: 8,
    padding: 12,
    color: Colors.text.primary,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.background.secondary,
  },
  addButtonModal: {
    backgroundColor: Colors.primary.main,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  addButtonText: {
    color: Colors.white,
  },
});

export default TruthScreen;