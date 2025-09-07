import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants';

const ArticlesScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Articles</Text>
        <Text style={styles.subtitle}>Curated articles to help your journey.</Text>
      </View>
      <View style={styles.card}> 
        <Text style={styles.cardTitle}>Coming soon</Text>
        <Text style={styles.cardBody}>Were preparing helpful content here.</Text>
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

export default ArticlesScreen;
