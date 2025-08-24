import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getPublicVictories } from '../store/slices/victorySlice';
import { RootState, AppDispatch } from '../store';
import { Colors } from '../constants';
import { Victory } from '../services/victoryService';

const VictoryStories = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { publicVictories, loading, error } = useSelector((state: RootState) => state.victories);

  useEffect(() => {
    dispatch(getPublicVictories({ page: 1, limit: 5 }));
  }, [dispatch]);

  const renderStory = ({ item }: { item: Victory }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('VictoryDetails', { victoryId: item.id })}
      style={[styles.storyCard, { backgroundColor: getRandomColor() }]}
    >
      <Text style={styles.storyText}>{item.title}</Text>
    </TouchableOpacity>
  );

  const getRandomColor = () => {
    const colors = [Colors.primary.main, Colors.secondary.main, Colors.background.tertiary, '#FFC107', '#4CAF50', '#2196F3'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Overcomers stories</Text>
        <TouchableOpacity onPress={() => navigation.navigate('PublicVictories')}>
          <Text style={styles.moreButton}>More</Text>
        </TouchableOpacity>
      </View>
      {loading && <Text>Loading...</Text>}
      {error && <Text>Error: {error}</Text>}
      <FlatList
        data={publicVictories?.items || []}
        renderItem={renderStory}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  moreButton: {
    fontSize: 14,
    color: Colors.primary.main,
  },
  list: {
    paddingHorizontal: 16,
  },
  storyCard: {
    width: 120,
    height: 120,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    padding: 8,
  },
  storyText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default VictoryStories;
