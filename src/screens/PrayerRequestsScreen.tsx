import React from 'react';
import { View, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Icon from '../components/Icon';
import { Colors, Icons } from '../constants';
import UserPrayerRequestsList from '../components/UserPrayerRequestsList';
import SharedPrayerRequestsList from '../components/SharedPrayerRequestsList';
import PublicPrayerRequestsList from '../components/PublicPrayerRequestsList';

const PrayerRequestsScreen = ({ navigation }: any) => {
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'myPrayers', title: 'My Prayers' },
    { key: 'sharedWithMe', title: 'Shared With Me' },
    { key: 'publicPrayers', title: 'Public Prayers' },
  ]);

  const renderScene = SceneMap({ 
    myPrayers: () => <UserPrayerRequestsList navigation={navigation} />,
    sharedWithMe: () => <SharedPrayerRequestsList navigation={navigation} />,
    publicPrayers: () => <PublicPrayerRequestsList navigation={navigation} />,
  });

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

export default PrayerRequestsScreen;


