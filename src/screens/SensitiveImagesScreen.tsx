import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Surface } from 'react-native-paper';
import { format, parseISO } from 'date-fns';

// Components
import ScreenHeader from '../components/ScreenHeader';
import { Icon } from '../components';
import { Colors } from '../constants';

// Services
import screenshotApiService, { SensitiveImage } from '../services/screenshotApiService';

// Types
import { RootStackParamList } from '../navigation/types';

type SensitiveImagesNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SensitiveImages'>;
type SensitiveImagesRouteProp = RouteProp<RootStackParamList, 'SensitiveImages'>;

interface SensitiveImageListItemProps {
  item: SensitiveImage;
  onPress: (item: SensitiveImage) => void;
}

const SensitiveImageListItem: React.FC<SensitiveImageListItemProps> = ({ item, onPress }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'explicit':
        return Colors.error.main;
      case 'warning':
        return Colors.warning.main;
      default:
        return Colors.primary.main;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'explicit':
        return 'warning-outline';
      case 'warning':
        return 'alert-circle-outline';
      default:
        return 'checkmark-circle-outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'explicit':
        return 'Explicit Content';
      case 'warning':
        return 'Warning Content';
      default:
        return 'Clean Content';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  return (
    <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.7}>
      <Surface style={styles.imageItem}>
        <View style={styles.imageItemContent}>
          <View style={styles.imageItemHeader}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Icon 
                name={getStatusIcon(item.status)} 
                color={Colors.white} 
                size="sm" 
              />
              <Text style={styles.statusText}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
            <Text style={styles.dateText}>
              {formatDate(item.createdAt)}
            </Text>
          </View>

          {item.summary && (
            <Text style={styles.summaryText} numberOfLines={2}>
              {item.summary}
            </Text>
          )}

          <View style={styles.imageItemFooter}>
            <View style={styles.statsRow}>
              {item.findings && item.findings.length > 0 && (
                <View style={styles.statItem}>
                  <Icon name="search-outline" color={Colors.text.secondary} size="sm" />
                  <Text style={styles.statText}>
                    {item.findings.length} finding{item.findings.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
              
              {item.comments && item.comments.length > 0 && (
                <View style={styles.statItem}>
                  <Icon name="chatbubble-outline" color={Colors.text.secondary} size="sm" />
                  <Text style={styles.statText}>
                    {item.comments.length} comment{item.comments.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}

              {item.rawMeta?.imagesCount && (
                <View style={styles.statItem}>
                  <Icon name="images-outline" color={Colors.text.secondary} size="sm" />
                  <Text style={styles.statText}>
                    {item.rawMeta.imagesCount} image{item.rawMeta.imagesCount !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>

            <Icon name="chevron-forward-outline" color={Colors.text.tertiary} size="sm" />
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );
};

const SensitiveImagesScreen: React.FC = () => {
  const navigation = useNavigation<SensitiveImagesNavigationProp>();
  const route = useRoute<SensitiveImagesRouteProp>();
  const { userId } = route.params || {};

  const [images, setImages] = useState<SensitiveImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPartnerView = userId !== undefined;
  const screenTitle = isPartnerView ? 'Partner Reports' : 'My Reports';

  const loadImages = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await screenshotApiService.getSensitiveImages(userId);
      setImages(data);
    } catch (error) {
      console.error('Failed to load sensitive images:', error);
      setError(error instanceof Error ? error.message : 'Failed to load images');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadImages();
    }, [loadImages])
  );

  const handleItemPress = (item: SensitiveImage) => {
    navigation.navigate('ImageDetail', { imageId: item.id });
  };

  const handleRefresh = () => {
    loadImages(true);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="images-outline" color={Colors.text.tertiary} size="xl" />
      <Text style={styles.emptyStateTitle}>No Reports Found</Text>
      <Text style={styles.emptyStateDescription}>
        {isPartnerView 
          ? "No sensitive content reports found for this partner."
          : "No sensitive content has been detected in your screenshots yet."
        }
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Icon name="alert-circle-outline" color={Colors.error.main} size="xl" />
      <Text style={styles.errorTitle}>Unable to Load Reports</Text>
      <Text style={styles.errorDescription}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => loadImages()}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color={Colors.primary.main} />
      <Text style={styles.loadingText}>Loading reports...</Text>
    </View>
  );

  const renderItem = ({ item }: { item: SensitiveImage }) => (
    <SensitiveImageListItem item={item} onPress={handleItemPress} />
  );

  const getStatsText = () => {
    if (images.length === 0) return '';
    
    const explicitCount = images.filter(img => img.status === 'explicit').length;
    const warningCount = images.filter(img => img.status === 'warning').length;
    const cleanCount = images.filter(img => img.status === 'clean').length;

    const parts = [];
    if (explicitCount > 0) parts.push(`${explicitCount} explicit`);
    if (warningCount > 0) parts.push(`${warningCount} warning`);
    if (cleanCount > 0) parts.push(`${cleanCount} clean`);

    return `${images.length} total report${images.length !== 1 ? 's' : ''} • ${parts.join(' • ')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader 
        title={screenTitle} 
        navigation={navigation} 
        showBackButton={true}
      />

      {/* Stats Header */}
      {!loading && !error && images.length > 0 && (
        <Surface style={styles.statsHeader}>
          <Icon name="bar-chart-outline" color={Colors.primary.main} size="md" />
          <Text style={styles.statsText}>
            {getStatsText()}
          </Text>
        </Surface>
      )}

      {/* Content */}
      {loading ? (
        renderLoadingState()
      ) : error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={images}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.listContainer,
            images.length === 0 && styles.listContainerEmpty
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary.main]}
              tintColor={Colors.primary.main}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: Colors.background.secondary,
    gap: 8,
  },
  statsText: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  listContainerEmpty: {
    flex: 1,
  },
  imageItem: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
  },
  imageItemContent: {
    padding: 16,
  },
  imageItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  dateText: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  summaryText: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
    marginBottom: 12,
  },
  imageItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 16,
  },
});

export default SensitiveImagesScreen;
