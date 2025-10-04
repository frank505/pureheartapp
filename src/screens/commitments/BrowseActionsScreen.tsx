/**
 * Browse Available Actions Screen
 * 
 * Second screen in the action commitment flow.
 * Users browse and select pre-approved actions or create custom ones.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { Text, Surface, Chip, Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenHeader, Icon } from '../../components';
import { Colors } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAvailableActions, selectAction } from '../../store/slices/commitmentsSlice';
import type { ActionCategory, ActionDifficulty } from '../../types/commitments';

type Props = NativeStackScreenProps<any, 'BrowseActions'>;

const CATEGORY_LABELS: Record<ActionCategory, string> = {
  COMMUNITY_SERVICE: 'Community Service',
  CHURCH_SERVICE: 'Church & Ministry',
  CHARITY_DONATION: 'Charity & Donations',
  HELPING_INDIVIDUALS: 'Individual Help',
  ENVIRONMENTAL: 'Environmental',
  EDUCATIONAL: 'Educational',
  CUSTOM: 'Custom',
};

const CATEGORY_ICONS: Record<ActionCategory, string> = {
  COMMUNITY_SERVICE: 'people',
  CHURCH_SERVICE: 'church',
  CHARITY_DONATION: 'heart',
  HELPING_INDIVIDUALS: 'hand-left',
  ENVIRONMENTAL: 'leaf',
  EDUCATIONAL: 'school',
  CUSTOM: 'create',
};

const DIFFICULTY_COLORS: Record<ActionDifficulty, string> = {
  EASY: '#10b981',
  MEDIUM: '#f59e0b',
  HARD: '#ef4444',
};

const BrowseActionsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { availableActions, loading } = useAppSelector((state) => state.commitments);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<ActionCategory[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<ActionDifficulty | null>(null);

  useEffect(() => {
    // Fetch actions on mount
    dispatch(fetchAvailableActions(undefined));
  }, [dispatch]);

  const handleSelectAction = (actionId: string) => {
    const action = availableActions.find((a) => a.id === actionId);
    if (action) {
      dispatch(selectAction(action));
      navigation.navigate('ActionDetails');
    }
  };

  const handleCustomAction = () => {
    navigation.navigate('CreateCustomAction');
  };

  const toggleCategory = (category: ActionCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Filter actions based on search and filters
  const filteredActions = availableActions.filter((action) => {
    const matchesSearch = action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || 
                           selectedCategories.includes(action.category);
    const matchesDifficulty = !selectedDifficulty || action.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyLabel = (difficulty: ActionDifficulty): string => {
    const labels: Record<ActionDifficulty, string> = {
      EASY: 'Easy',
      MEDIUM: 'Medium',
      HARD: 'Hard',
    };
    return labels[difficulty];
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/appbackgroundimage.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader
          title="Choose an Action"
          navigation={navigation}
          showBackButton={true}
        />

        <View style={styles.content}>
          {/* Search Bar */}
          <Searchbar
            placeholder="Search actions..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={Colors.text.secondary}
            placeholderTextColor={Colors.text.secondary}
          />

          {/* Category Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {(Object.keys(CATEGORY_LABELS) as ActionCategory[])
              .filter((c) => c !== 'CUSTOM')
              .map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => toggleCategory(category)}
                  style={[
                    styles.categoryChip,
                    selectedCategories.includes(category) && styles.categoryChipSelected,
                  ]}
                >
                  <Icon 
                    name={CATEGORY_ICONS[category]} 
                    size={16} 
                    color={selectedCategories.includes(category) ? Colors.white : Colors.primary.main} 
                  />
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategories.includes(category) && styles.categoryChipTextSelected,
                  ]}>
                    {CATEGORY_LABELS[category]}
                  </Text>
                </TouchableOpacity>
              ))}
          </ScrollView>

          {/* Difficulty Filter */}
          <View style={styles.difficultyContainer}>
            <Text style={styles.filterLabel}>Difficulty:</Text>
            <View style={styles.difficultyButtons}>
              {(['EASY', 'MEDIUM', 'HARD'] as ActionDifficulty[]).map((diff) => (
                <TouchableOpacity
                  key={diff}
                  onPress={() => setSelectedDifficulty(selectedDifficulty === diff ? null : diff)}
                  style={[
                    styles.difficultyButton,
                    selectedDifficulty === diff && {
                      backgroundColor: DIFFICULTY_COLORS[diff],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.difficultyButtonText,
                      selectedDifficulty === diff && styles.difficultyButtonTextSelected,
                    ]}
                  >
                    {getDifficultyLabel(diff)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Actions List */}
          {loading.actions ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary.main} />
              <Text style={styles.loadingText}>Loading actions...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.actionsList}
              contentContainerStyle={styles.actionsListContent}
              showsVerticalScrollIndicator={false}
            >
              {filteredActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  onPress={() => handleSelectAction(action.id)}
                  activeOpacity={0.7}
                >
                  <Surface style={styles.actionCard}>
                    <View style={styles.actionHeader}>
                      <Text style={styles.actionTitle}>{action.title}</Text>
                      <View
                        style={[
                          styles.difficultyBadge,
                          { backgroundColor: DIFFICULTY_COLORS[action.difficulty] },
                        ]}
                      >
                        <Text style={styles.difficultyBadgeText}>
                          {getDifficultyLabel(action.difficulty)}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.actionDescription} numberOfLines={2}>
                      {action.description}
                    </Text>

                    <View style={styles.actionMeta}>
                      <View style={styles.metaItem}>
                        <Icon name="time-outline" size={16} color={Colors.text.secondary} />
                        <Text style={styles.metaText}>{action.estimatedHours}h</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Icon name="camera-outline" size={16} color={Colors.text.secondary} />
                        <Text style={styles.metaText}>Photo proof required</Text>
                      </View>
                    </View>

                    <View style={styles.categoryTag}>
                      <Text style={styles.categoryTagText}>
                        {CATEGORY_LABELS[action.category]}
                      </Text>
                    </View>
                  </Surface>
                </TouchableOpacity>
              ))}

              {/* Custom Action Button */}
              <TouchableOpacity onPress={handleCustomAction} activeOpacity={0.7}>
                <Surface style={[styles.actionCard, styles.customActionCard]}>
                  <Icon name="add-circle-outline" size={48} color={Colors.primary.main} />
                  <Text style={styles.customActionTitle}>Create Custom Action</Text>
                  <Text style={styles.customActionDescription}>
                    Can't find what you're looking for? Create your own action (requires partner approval)
                  </Text>
                </Surface>
              </TouchableOpacity>

              {filteredActions.length === 0 && !loading.actions && (
                <View style={styles.emptyState}>
                  <Icon name="search-outline" size={64} color={Colors.text.secondary} />
                  <Text style={styles.emptyStateTitle}>No Actions Found</Text>
                  <Text style={styles.emptyStateText}>
                    Try adjusting your filters or create a custom action
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    marginBottom: 16,
    backgroundColor: Colors.background.secondary,
    elevation: 2,
  },
  categoryScroll: {
    marginBottom: 16,
    maxHeight: 50,
  },
  categoryScrollContent: {
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    backgroundColor: Colors.background.secondary,
    borderColor: Colors.border.primary,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: Colors.primary.main,
  },
  chipText: {
    color: Colors.text.primary,
  },
  chipTextSelected: {
    color: Colors.white,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    borderColor: Colors.primary.main,
    borderWidth: 1,
    gap: 8,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: Colors.primary.main,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary.main,
  },
  categoryChipTextSelected: {
    color: Colors.white,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary.main,
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  difficultyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  difficultyButtonTextSelected: {
    color: Colors.white,
  },
  actionsList: {
    flex: 1,
  },
  actionsListContent: {
    gap: 12,
    paddingBottom: 16,
  },
  actionCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: Colors.background.secondary,
    elevation: 2,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
    textTransform: 'uppercase',
  },
  actionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  actionMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.primary.light,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary.main,
  },
  customActionCard: {
    alignItems: 'center',
    paddingVertical: 24,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: Colors.primary.main,
  },
  customActionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  customActionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 15,
    color: Colors.text.secondary,
    marginTop: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary.main,
    marginTop: 16,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  emptyStateText: {
    fontSize: 15,
    color: Colors.primary.main,
    textAlign: 'center',
    paddingHorizontal: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default BrowseActionsScreen;
