import React from 'react';
import { View, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Icon from '../components/Icon';
import { Colors, Icons } from '../constants';
import UserVictoriesList from '../components/UserVictoriesList';
import SharedVictoriesList from '../components/SharedVictoriesList';

const MyVictoriesScreen = ({ navigation }: any) => {
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'myVictories', title: 'My Victories' },
    { key: 'sharedWithMe', title: 'Shared With Me' },
  ]);

  const renderScene = SceneMap({
    myVictories: () => <UserVictoriesList navigation={navigation} />,
    sharedWithMe: () => <SharedVictoriesList navigation={navigation} />,
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Icon name={Icons.navigation.back.name} color={Colors.text.primary} size="md" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Victories</Text>
        <View style={styles.headerSpacer} />
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={props => (
          <TabBar
            {...props}
            style={{ backgroundColor: Colors.background.primary }}
            indicatorStyle={{ backgroundColor: Colors.primary.main }}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.background.primary },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', flex: 1 },
  headerSpacer: { width: 40 },
});

export default MyVictoriesScreen;
