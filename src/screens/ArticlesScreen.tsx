import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants';
import Icon from '../components/Icon';
import { articleService, ArticleListItem } from '../services/articleService';
import { useNavigation } from '@react-navigation/native';

const PAGE_SIZE = 20;

const ArticlesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<ArticleListItem[]>([]);
  const [page, setPage] = useState(1); // server-reported current page
  const [totalPages, setTotalPages] = useState(1);
  const [loadingInitial, setLoadingInitial] = useState(false); // first page
  const [loadingMore, setLoadingMore] = useState(false); // subsequent pages
  const [refreshing, setRefreshing] = useState(false); // pull-to-refresh
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false); // hard guard against duplicate calls
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const debouncedSearchRef = useRef(search);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadArticles = async (pageToLoad: number, replace = false) => {
    if (inFlightRef.current) return; // already loading
    if (pageToLoad === 1 && !refreshing) setLoadingInitial(true);
    if (pageToLoad > 1) setLoadingMore(true);
    inFlightRef.current = true;
    setError(null);
    try {
      const activeSearch = debouncedSearchRef.current.trim();
      const data = await articleService.getArticles({ page: pageToLoad, limit: PAGE_SIZE, search: activeSearch || undefined });
      // Basic sanity checks to prevent loops if API misbehaves
      const safePage = data.page > 0 ? data.page : pageToLoad;
      const safeTotalPages = data.totalPages > 0 ? data.totalPages : 1;
      setTotalPages(safeTotalPages);
      setPage(safePage);
      setItems(prev => replace ? data.items : [...prev, ...data.items]);
    } catch (e: any) {
      setError(e.message || 'Failed to load articles');
    } finally {
      inFlightRef.current = false;
      setLoadingInitial(false);
      setLoadingMore(false);
      if (refreshing) setRefreshing(false);
    }
  };

  // Initial load (runs once)
  useEffect(() => {
    loadArticles(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce search input: wait 400ms after user stops typing
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      if (debouncedSearchRef.current !== search) {
        debouncedSearchRef.current = search;
        // Reset list with new search query
        loadArticles(1, true);
      }
    }, 400);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleRefresh = () => {
    if (inFlightRef.current) return;
    setRefreshing(true);
    loadArticles(1, true);
  };

  const hasMore = page < totalPages;
  const loadMore = () => {
    if (inFlightRef.current) return;
    if (loadingInitial || loadingMore || refreshing) return;
    if (!hasMore) return;
    // Only load more if we have filled the current pages fully
    if (items.length < page * PAGE_SIZE) return;
    loadArticles(page + 1);
  };

  const renderItem = ({ item }: { item: ArticleListItem }) => (
    <TouchableOpacity
      style={styles.articleCard}
      onPress={() => navigation.navigate('ArticleDetail', { slug: item.slug })}
    >
      <Text style={styles.articleTitle}>{item.title}</Text>
      {item.summary && <Text style={styles.articleSummary} numberOfLines={3}>{item.summary}</Text>}
      <View style={styles.metaRow}>
        {item.category && <Text style={styles.metaText}>{item.category}</Text>}
        {Array.isArray(item.tags) && item.tags.slice(0, 2).map(tag => (
          <Text key={tag} style={styles.tag}>#{tag}</Text>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <View style={styles.topBar}>
          {navigation.canGoBack() ? (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn} accessibilityLabel="Go back">
              <Icon name="arrow-back" size="lg" color={Colors.text.primary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.navBtnPlaceholder} />
          )}
          <Text style={styles.topBarTitle} accessibilityRole="header">ARTICLES</Text>
          <View style={styles.navBtnPlaceholder} />
        </View>
        <Text style={styles.subtitle}>Curated articles to help your journey.</Text>
        <View style={[styles.searchWrapper, searchFocused && styles.searchWrapperFocused]}>
          <Icon name="search" size="md" color={searchFocused ? Colors.primary.main : Colors.text.tertiary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search articles..."
            placeholderTextColor={Colors.text.tertiary}
            style={styles.searchInput}
            autoCapitalize="none"
            returnKeyType="search"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onSubmitEditing={() => {
              debouncedSearchRef.current = search; // force immediate sync
              loadArticles(1, true);
            }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn} accessibilityLabel="Clear search">
              <Icon name="close-circle" size="md" color={Colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {error && (
        <TouchableOpacity style={styles.errorBox} onPress={() => loadArticles(1, true)}>
          <Text style={styles.errorText}>{error} - Tap to retry</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
  contentContainerStyle={items.length === 0 && !loadingInitial && !refreshing ? styles.emptyContainer : undefined}
        ListEmptyComponent={!loadingInitial && !refreshing ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>No articles yet</Text>
            <Text style={styles.cardBody}>Check back soon for helpful content.</Text>
          </View>
        ) : null}
        ListHeaderComponent={loadingInitial && !refreshing ? (
          <View style={styles.initialLoaderBox}><ActivityIndicator color={Colors.primary.main} /></View>
        ) : undefined}
        ListFooterComponent={loadingMore ? (
          <View style={styles.footerLoading}><ActivityIndicator color={Colors.primary.main} /></View>
        ) : hasMore && items.length > 0 ? (
          <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore}>
            <Text style={styles.loadMoreText}>Load more</Text>
          </TouchableOpacity>
        ) : <View style={{ height: 24 }} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary.main} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background.primary, padding: 16 },
  header: { marginBottom: 12 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.background.secondary, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border.primary },
  navBtnPlaceholder: { width: 44, height: 44 },
  topBarTitle: { color: Colors.text.primary, fontSize: 20, fontWeight: '800', letterSpacing: 1 },
  subtitle: { color: Colors.text.secondary, marginBottom: 14, paddingHorizontal: 2 },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background.secondary, borderRadius: 18, paddingHorizontal: 16, gap: 12, borderWidth: 1, borderColor: Colors.border.primary, height: 52, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  searchWrapperFocused: { borderColor: Colors.primary.main, shadowOpacity: 0.35 },
  searchInput: { flex: 1, color: Colors.text.primary, fontSize: 16, fontWeight: '500', paddingVertical: Platform.OS === 'android' ? 0 : 6 },
  clearBtn: { padding: 4, borderRadius: 16 },
  card: { backgroundColor: Colors.background.secondary, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.border.primary },
  cardTitle: { color: Colors.text.primary, fontWeight: '700', marginBottom: 6 },
  cardBody: { color: Colors.text.secondary },
  articleCard: { backgroundColor: Colors.background.secondary, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border.primary, marginBottom: 12 },
  articleTitle: { color: Colors.text.primary, fontSize: 16, fontWeight: '600', marginBottom: 4 },
  articleSummary: { color: Colors.text.secondary, fontSize: 13, lineHeight: 18 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 8 },
  metaText: { color: Colors.text.tertiary, fontSize: 12 },
  tag: { color: Colors.primary.main, fontSize: 12, marginRight: 6 },
  footerLoading: { paddingVertical: 20 },
  initialLoaderBox: { paddingVertical: 40 },
  loadMoreBtn: { paddingVertical: 14, alignItems: 'center' },
  loadMoreText: { color: Colors.primary.main, fontWeight: '600' },
  errorBox: { backgroundColor: Colors.error.container, padding: 12, borderRadius: 8, marginBottom: 12 },
  errorText: { color: Colors.error.light, fontSize: 12, textAlign: 'center' },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
});

export default ArticlesScreen;
