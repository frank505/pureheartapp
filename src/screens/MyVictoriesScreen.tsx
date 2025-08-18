import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, SegmentedButtons, Searchbar } from 'react-native-paper';
import Icon from '../components/Icon';
import { Colors, Icons } from '../constants';
import UserVictoriesList from '../components/UserVictoriesList';
import SharedVictoriesList from '../components/SharedVictoriesList';

const MyVictoriesScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<'myVictories' | 'sharedWithMe'>('myVictories');
  const [myVictoriesSearchQuery, setMyVictoriesSearchQuery] = useState('');
  const [sharedVictoriesSearchQuery, setSharedVictoriesSearchQuery] = useState('');

  const getCurrentSearchQuery = () => {
    return activeTab === 'myVictories' ? myVictoriesSearchQuery : sharedVictoriesSearchQuery;
  };

  const handleSearchChange = (query: string) => {
    if (activeTab === 'myVictories') {
      setMyVictoriesSearchQuery(query);
    } else {
      setSharedVictoriesSearchQuery(query);
    }
  };

  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'myVictories':
        return <UserVictoriesList navigation={navigation} searchQuery={myVictoriesSearchQuery} />;
      case 'sharedWithMe':
        return <SharedVictoriesList navigation={navigation} searchQuery={sharedVictoriesSearchQuery} />;
      default:
        return <UserVictoriesList navigation={navigation} searchQuery={myVictoriesSearchQuery} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Icon name={Icons.navigation.back.name} color={Colors.text.primary} size="md" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Victories</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'myVictories' | 'sharedWithMe')}
          buttons={[
            {
              value: 'myVictories',
              label: 'My Victories',
            },
            {
              value: 'sharedWithMe',
              label: 'Shared With Me',
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {/* Search Bar */}
      <Searchbar
        placeholder={`Search ${activeTab === 'myVictories' ? 'my' : 'shared'} victories`}
        onChangeText={handleSearchChange}
        value={getCurrentSearchQuery()}
        style={styles.searchBar}
      />

      {/* Current Tab Content */}
      <View style={styles.content}>
        {renderCurrentTab()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background.primary 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  backButton: { 
    padding: 8 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: Colors.text.primary, 
    textAlign: 'center', 
    flex: 1 
  },
  headerSpacer: { 
    width: 40 
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
  content: {
    flex: 1,
  },
});

export default MyVictoriesScreen;
