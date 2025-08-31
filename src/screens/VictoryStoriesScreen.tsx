import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components';
import { Colors } from '../constants';

const VictoryStoriesScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Victory Stories"  />
      <ScrollView>
        <View style={styles.content}>
          <Text>Victory Stories content will go here</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    padding: 16,
  },
});

export default VictoryStoriesScreen;
