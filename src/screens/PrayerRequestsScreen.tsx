import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Text, Searchbar, SegmentedButtons, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { Colors, Icons } from '../constants';
import { prayerRequestService, PrayerRequest } from '../services/prayerRequestService';
import { useNavigation } from '@react-navigation/native';

const PAGE_SIZE = 20;

const PrayerRequestsScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<'my' | 'shared' | 'public'>('my');
  const [myPrayers, setMyPrayers] = useState<PrayerRequest[]>([]);
  const [sharedPrayers, setSharedPrayers] = useState<PrayerRequest[]>([]);
  const [publicPrayers, setPublicPrayers] = useState<PrayerRequest[]>([]);
  const [mySearchQuery, setMySearchQuery] = useState('');
  const [sharedSearchQuery, setSharedSearchQuery] = useState('');
  const [publicSearchQuery, setPublicSearchQuery] = useState('');
  const [myLoading, setMyLoading] = useState(false);
  const [sharedLoading, setSharedLoading] = useState(false);
  const [publicLoading, setPublicLoading] = useState(false);
  const [myCurrentPage, setMyCurrentPage] = useState(1);
  const [sharedCurrentPage, setSharedCurrentPage] = useState(1);
  const [publicCurrentPage, setPublicCurrentPage] = useState(1);
  const [myHasMore, setMyHasMore] = useState(true);
  const [sharedHasMore, setSharedHasMore] = useState(true);
  const [publicHasMore, setPublicHasMore] = useState(true);
  
  // Use refs to track loading states to prevent infinite loops
  const myLoadingRef = useRef(false);
  const sharedLoadingRef = useRef(false);
  const publicLoadingRef = useRef(false);
  const myCurrentPageRef = useRef(1);
  const sharedCurrentPageRef = useRef(1);
  const publicCurrentPageRef = useRef(1);
  const myHasMoreRef = useRef(true);
  const sharedHasMoreRef = useRef(true);
  const publicHasMoreRef = useRef(true);

  // Update refs when state changes
  useEffect(() => {
    myCurrentPageRef.current = myCurrentPage;
  }, [myCurrentPage]);

  useEffect(() => {
    sharedCurrentPageRef.current = sharedCurrentPage;
  }, [sharedCurrentPage]);

  useEffect(() => {
    publicCurrentPageRef.current = publicCurrentPage;
  }, [publicCurrentPage]);

  useEffect(() => {
    myHasMoreRef.current = myHasMore;
  }, [myHasMore]);

  useEffect(() => {
    sharedHasMoreRef.current = sharedHasMore;
  }, [sharedHasMore]);

  useEffect(() => {
    publicHasMoreRef.current = publicHasMore;
  }, [publicHasMore]);

  const loadMyPrayers = useCallback(async (page = 1, search = '') => {
    if (myLoadingRef.current) return;

    myLoadingRef.current = true;
    setMyLoading(true);
    
    try {
      const response = await prayerRequestService.getPrayerRequests(page, PAGE_SIZE, search);
      
      if (page === 1) {
        setMyPrayers(response.items);
      } else {
        setMyPrayers(prev => [...prev, ...response.items]);
      }
      
      setMyHasMore(response.page < response.totalPages);
    } catch (error) {
      console.error('Error loading my prayers:', error);
    } finally {
      myLoadingRef.current = false;
      setMyLoading(false);
    }
  }, []);

  const loadSharedPrayers = useCallback(async (page = 1, search = '') => {
    if (sharedLoadingRef.current) return;

    sharedLoadingRef.current = true;
    setSharedLoading(true);
    
    try {
      const response = await prayerRequestService.getSharedPrayerRequests(page, PAGE_SIZE, search);
      
      if (page === 1) {
        setSharedPrayers(response.items);
      } else {
        setSharedPrayers(prev => [...prev, ...response.items]);
      }
      
      setSharedHasMore(response.page < response.totalPages);
    } catch (error) {
      console.error('Error loading shared prayers:', error);
    } finally {
      sharedLoadingRef.current = false;
      setSharedLoading(false);
    }
  }, []);

  const loadPublicPrayers = useCallback(async (page = 1, search = '') => {
    if (publicLoadingRef.current) return;

    publicLoadingRef.current = true;
    setPublicLoading(true);
    
    try {
      const response = await prayerRequestService.getPublicPrayerRequests(page, PAGE_SIZE, search);
      
      if (page === 1) {
        setPublicPrayers(response.items);
      } else {
        setPublicPrayers(prev => [...prev, ...response.items]);
      }
      
      setPublicHasMore(response.page < response.totalPages);
    } catch (error) {
      console.error('Error loading public prayers:', error);
    } finally {
      publicLoadingRef.current = false;
      setPublicLoading(false);
    }
  }, []);

  const handleMySearch = useCallback((query: string) => {
    setMySearchQuery(query);
    setMyCurrentPage(1);
    setMyHasMore(true);
    loadMyPrayers(1, query);
  }, [loadMyPrayers]);

  const handleSharedSearch = useCallback((query: string) => {
    setSharedSearchQuery(query);
    setSharedCurrentPage(1);
    setSharedHasMore(true);
    loadSharedPrayers(1, query);
  }, [loadSharedPrayers]);

  const handlePublicSearch = useCallback((query: string) => {
    setPublicSearchQuery(query);
    setPublicCurrentPage(1);
    setPublicHasMore(true);
    loadPublicPrayers(1, query);
  }, [loadPublicPrayers]);

  const handleMyLoadMore = useCallback(() => {
    if (!myLoadingRef.current && myHasMoreRef.current) {
      const nextPage = myCurrentPageRef.current + 1;
      setMyCurrentPage(nextPage);
      myCurrentPageRef.current = nextPage;
      loadMyPrayers(nextPage, mySearchQuery);
    }
  }, [loadMyPrayers, mySearchQuery]);

  const handleSharedLoadMore = useCallback(() => {
    if (!sharedLoadingRef.current && sharedHasMoreRef.current) {
      const nextPage = sharedCurrentPageRef.current + 1;
      setSharedCurrentPage(nextPage);
      sharedCurrentPageRef.current = nextPage;
      loadSharedPrayers(nextPage, sharedSearchQuery);
    }
  }, [loadSharedPrayers, sharedSearchQuery]);

  const handlePublicLoadMore = useCallback(() => {
    if (!publicLoadingRef.current && publicHasMoreRef.current) {
      const nextPage = publicCurrentPageRef.current + 1;
      setPublicCurrentPage(nextPage);
      publicCurrentPageRef.current = nextPage;
      loadPublicPrayers(nextPage, publicSearchQuery);
    }
  }, [loadPublicPrayers, publicSearchQuery]);

  useEffect(() => {
    // Initial load when component mounts
    loadMyPrayers();
    loadSharedPrayers();
    loadPublicPrayers();
  }, [loadMyPrayers, loadSharedPrayers, loadPublicPrayers]);

  const renderPrayerRequest = ({ item }: { item: PrayerRequest }) => (
    <TouchableOpacity onPress={() => navigation.navigate('PrayerRequestDetail', { prayerRequestId: item.id })}>
      <Surface style={styles.prayerItem} elevation={2}>
        <Text variant="titleMedium" numberOfLines={1}>{item.title}</Text>
        {item.body && (
          <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>
            {item.body}
          </Text>
        )}
        <View style={styles.metaRow}>
          <Text variant="bodySmall" style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          <Text variant="bodySmall" style={styles.visibilityText}>
            {item.visibility}
          </Text>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    const loading = activeTab === 'my' ? myLoading : activeTab === 'shared' ? sharedLoading : publicLoading;
    const hasMore = activeTab === 'my' ? myHasMore : activeTab === 'shared' ? sharedHasMore : publicHasMore;
    const data = getCurrentData();
    
    // Show loading indicator if we're loading AND there's more data to load
    if (loading && hasMore) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={Colors.primary.main} />
        </View>
      );
    }
    
    // Show "end of list" indicator if we have data but no more to load
    if (data.length > 0 && !hasMore) {
      return (
        <View style={styles.endOfList}>
          <Text style={styles.endOfListText}>You've reached the end</Text>
        </View>
      );
    }
    
    return null;
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'my': return myPrayers;
      case 'shared': return sharedPrayers;
      case 'public': return publicPrayers;
      default: return [];
    }
  };

  const getCurrentSearch = () => {
    switch (activeTab) {
      case 'my': return mySearchQuery;
      case 'shared': return sharedSearchQuery;
      case 'public': return publicSearchQuery;
      default: return '';
    }
  };

  const getCurrentSearchHandler = () => {
    switch (activeTab) {
      case 'my': return handleMySearch;
      case 'shared': return handleSharedSearch;
      case 'public': return handlePublicSearch;
      default: return handleMySearch;
    }
  };

  const getCurrentLoadMoreHandler = () => {
    switch (activeTab) {
      case 'my': return handleMyLoadMore;
      case 'shared': return handleSharedLoadMore;
      case 'public': return handlePublicLoadMore;
      default: return handleMyLoadMore;
    }
  };

  const getCurrentLoading = () => {
    switch (activeTab) {
      case 'my': return myLoading;
      case 'shared': return sharedLoading;
      case 'public': return publicLoading;
      default: return false;
    }
  };

  const getCurrentHasMore = () => {
    switch (activeTab) {
      case 'my': return myHasMore;
      case 'shared': return sharedHasMore;
      case 'public': return publicHasMore;
      default: return false;
    }
  };

  const renderEmptyState = () => {
    const isLoading = getCurrentLoading();
    const searchQuery = getCurrentSearch();
    
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Text style={styles.emptyStateText}>Loading prayer requests...</Text>
        </View>
      );
    }
    
    if (searchQuery) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No prayer requests found for "{searchQuery}"</Text>
        </View>
      );
    }
    
    const emptyMessage = () => {
      switch (activeTab) {
        case 'my': return 'No prayer requests yet. Create your first one!';
        case 'shared': return 'No shared prayer requests available.';
        case 'public': return 'No public prayer requests available.';
        default: return 'No prayer requests available.';
      }
    };
    
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>{emptyMessage()}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Icon name={Icons.navigation.back.name} color={Colors.text.primary} size="md" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prayer Requests</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'my' | 'shared' | 'public')}
          buttons={[
            {
              value: 'my',
              label: 'My Prayers',
            },
            {
              value: 'shared',
              label: 'Shared With Me',
            },
            {
              value: 'public',
              label: 'Public Prayers',
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <Searchbar
        placeholder={`Search ${activeTab === 'my' ? 'my' : activeTab === 'shared' ? 'shared' : 'public'} prayers`}
        onChangeText={getCurrentSearchHandler()}
        value={getCurrentSearch()}
        style={styles.searchBar}
      />
      
      <FlatList
        data={getCurrentData()}
        renderItem={renderPrayerRequest}
        keyExtractor={item => item.id.toString()}
        onEndReached={getCurrentHasMore() ? getCurrentLoadMoreHandler() : undefined}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={getCurrentData().length === 0 ? { flex: 1 } : styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  segmentedButtons: {
    backgroundColor: Colors.background.secondary,
  },
  searchBar: {
    margin: 16,
  },
  list: {
    padding: 16,
  },
  prayerItem: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  description: {
    marginTop: 4,
    color: Colors.text.secondary,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  dateText: {
    color: Colors.text.secondary,
  },
  visibilityText: {
    color: Colors.text.secondary,
    textTransform: 'capitalize',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  endOfList: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  endOfListText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default PrayerRequestsScreen;


