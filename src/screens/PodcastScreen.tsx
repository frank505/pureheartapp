import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants';

const PodcastScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Podcast</Text>
        <Text style={styles.subtitle}>Listen and grow. Episodes coming soon.</Text>
      </View>
      <View style={styles.card}> 
        <Text style={styles.cardTitle}>Coming soon</Text>
        <Text style={styles.cardBody}>Podcasts will appear here.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background.primary, padding: 16 },
  header: { marginBottom: 16 },
  title: { color: Colors.text.primary, fontSize: 24, fontWeight: '800' },
  subtitle: { color: Colors.text.secondary, marginTop: 4 },
  card: { backgroundColor: Colors.background.secondary, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.border.primary },
  cardTitle: { color: Colors.text.primary, fontWeight: '700', marginBottom: 6 },
  cardBody: { color: Colors.text.secondary },
});

export default PodcastScreen;
