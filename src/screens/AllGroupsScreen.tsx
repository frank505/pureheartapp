import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Text, Searchbar, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Icons } from '../constants';
import Icon from '../components/Icon';
import groupService, { GroupSummary } from '../services/groupService';
import { useNavigation } from '@react-navigation/native';

const PAGE_SIZE = 20;

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type AllGroupsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AllGroupsScreen = () => {
  const [activeTab, setActiveTab] = useState<'my' | 'public'>('my');
  const [myGroups, setMyGroups] = useState<GroupSummary[]>([]);
  const [publicGroups, setPublicGroups] = useState<GroupSummary[]>([]);
  const [mySearchQuery, setMySearchQuery] = useState('');
  const [publicSearchQuery, setPublicSearchQuery] = useState('');
  const [myLoading, setMyLoading] = useState(false);
  const [publicLoading, setPublicLoading] = useState(false);
  const [myCurrentPage, setMyCurrentPage] = useState(1);
  const [publicCurrentPage, setPublicCurrentPage] = useState(1);
  const [myHasMore, setMyHasMore] = useState(true);
  const [publicHasMore, setPublicHasMore] = useState(true);
  const navigation = useNavigation<AllGroupsScreenNavigationProp>();
  
  // Use refs to track loading states to prevent infinite loops
  const myLoadingRef = useRef(false);
  const publicLoadingRef = useRef(false);
  const myCurrentPageRef = useRef(1);
  const publicCurrentPageRef = useRef(1);
  const myHasMoreRef = useRef(true);
  const publicHasMoreRef = useRef(true);

  // Update refs when state changes
  useEffect(() => {
    myCurrentPageRef.current = myCurrentPage;
  }, [myCurrentPage]);

  useEffect(() => {
    publicCurrentPageRef.current = publicCurrentPage;
  }, [publicCurrentPage]);

  useEffect(() => {
    myHasMoreRef.current = myHasMore;
  }, [myHasMore]);

  useEffect(() => {
    publicHasMoreRef.current = publicHasMore;
  }, [publicHasMore]);

  const loadMyGroups = useCallback(async (page = 1, search = '') => {
    if (myLoadingRef.current) return;

    myLoadingRef.current = true;
    setMyLoading(true);
    
    try {
      // For now, we'll use the same listMyGroups endpoint and filter client-side
      // In the future, you might want to add a searchMyGroups endpoint
      const response = await groupService.listMyGroups({ page, pageSize: PAGE_SIZE });
      
      let filteredItems = response.items;
      if (search) {
        filteredItems = response.items.filter(group => 
          group.name.toLowerCase().includes(search.toLowerCase()) ||
          (group.description && group.description.toLowerCase().includes(search.toLowerCase()))
        );
      }
      
      if (page === 1) {
        setMyGroups(filteredItems);
      } else {
        setMyGroups(prev => [...prev, ...filteredItems]);
      }
      
      setMyHasMore(response.page < response.totalPages);
    } catch (error) {
      console.error('Error loading my groups:', error);
    } finally {
      myLoadingRef.current = false;
      setMyLoading(false);
    }
  }, []); // Empty dependency array to prevent recreating the function

  const loadPublicGroups = useCallback(async (page = 1, search = '') => {
    if (publicLoadingRef.current) return;

    publicLoadingRef.current = true;
    setPublicLoading(true);
    
    try {
      let response;
      if (search) {
        response = await groupService.searchPublicGroups(search, { page, pageSize: PAGE_SIZE });
      } else {
        response = await groupService.listPublicGroups({ page, pageSize: PAGE_SIZE });
      }
      
      if (page === 1) {
        setPublicGroups(response.items);
      } else {
        setPublicGroups(prev => [...prev, ...response.items]);
      }
      
      setPublicHasMore(response.page < response.totalPages);
    } catch (error) {
      console.error('Error loading public groups:', error);
    } finally {
      publicLoadingRef.current = false;
      setPublicLoading(false);
    }
  }, []); // Empty dependency array to prevent recreating the function

  const handleMySearch = useCallback((query: string) => {
    setMySearchQuery(query);
    setMyCurrentPage(1);
    setMyHasMore(true);
    loadMyGroups(1, query);
  }, [loadMyGroups]);

  const handlePublicSearch = useCallback((query: string) => {
    setPublicSearchQuery(query);
    setPublicCurrentPage(1);
    setPublicHasMore(true);
    loadPublicGroups(1, query);
  }, [loadPublicGroups]);

  const handleMyLoadMore = useCallback(() => {
    if (!myLoadingRef.current && myHasMoreRef.current) {
      const nextPage = myCurrentPageRef.current + 1;
      setMyCurrentPage(nextPage);
      myCurrentPageRef.current = nextPage;
      loadMyGroups(nextPage, mySearchQuery);
    }
  }, [loadMyGroups, mySearchQuery]);

  const handlePublicLoadMore = useCallback(() => {
    if (!publicLoadingRef.current && publicHasMoreRef.current) {
      const nextPage = publicCurrentPageRef.current + 1;
      setPublicCurrentPage(nextPage);
      publicCurrentPageRef.current = nextPage;
      loadPublicGroups(nextPage, publicSearchQuery);
    }
  }, [loadPublicGroups, publicSearchQuery]);

  useEffect(() => {
    // Initial load when component mounts
    loadMyGroups();
    loadPublicGroups();
  }, [loadMyGroups, loadPublicGroups]); // Include dependencies

  const renderGroup = ({ item }: { item: GroupSummary }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('GroupChat', { 
        groupId: item.id,
        groupName: item.name,
        memberCount: item.membersCount
      })}
      style={styles.groupItem}
    >
      <Text variant="titleMedium">{item.name}</Text>
      {item.description && (
        <Text variant="bodyMedium" style={styles.description}>
          {item.description}
        </Text>
      )}
      <Text variant="bodySmall" style={styles.members}>
        {item.membersCount} members • {item.privacy}
      </Text>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    const loading = activeTab === 'my' ? myLoading : publicLoading;
    const hasMore = activeTab === 'my' ? myHasMore : publicHasMore;
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

  const getCurrentData = () => activeTab === 'my' ? myGroups : publicGroups;
  const getCurrentSearch = () => activeTab === 'my' ? mySearchQuery : publicSearchQuery;
  const getCurrentSearchHandler = () => activeTab === 'my' ? handleMySearch : handlePublicSearch;
  const getCurrentLoadMoreHandler = () => activeTab === 'my' ? handleMyLoadMore : handlePublicLoadMore;
  const getCurrentLoading = () => activeTab === 'my' ? myLoading : publicLoading;
  const getCurrentHasMore = () => activeTab === 'my' ? myHasMore : publicHasMore;

  const renderEmptyState = () => {
    const isLoading = getCurrentLoading();
    const searchQuery = getCurrentSearch();
    
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Text style={styles.emptyStateText}>Loading groups...</Text>
        </View>
      );
    }
    
    if (searchQuery) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No groups found for "{searchQuery}"</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>
          {activeTab === 'my' ? 'No groups yet. Join or create one!' : 'No public groups available.'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name={Icons.navigation.back.name} color={Colors.text.primary} size="md" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Groups</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'my' | 'public')}
          buttons={[
            {
              value: 'my',
              label: 'My Groups',
            },
            {
              value: 'public',
              label: 'Public Groups',
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <Searchbar
        placeholder={`Search ${activeTab === 'my' ? 'my' : 'public'} groups`}
        onChangeText={getCurrentSearchHandler()}
        value={getCurrentSearch()}
        style={styles.searchBar}
      />
      <FlatList
        data={getCurrentData()}
        renderItem={renderGroup}
        keyExtractor={item => item.id}
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
  groupItem: {
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
  members: {
    marginTop: 8,
    color: Colors.text.secondary,
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

export default AllGroupsScreen;
