import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, TextInput, Chip } from 'react-native-paper';
import Icon from '../components/Icon';
import { Colors, Icons } from '../constants';

interface ScriptureBrowserScreenProps { navigation?: any }

const topics = ['Identity', 'Temptation', 'Strength', 'Hope', 'Grace'];
const results = [
  { id: 'v1', reference: 'Philippians 4:13', text: 'I can do all things through him who strengthens me.', translation: 'ESV' },
  { id: 'v2', reference: '1 Corinthians 10:13', text: 'No temptation has overtaken you...', translation: 'ESV' },
];

const ScriptureBrowserScreen: React.FC<ScriptureBrowserScreenProps> = ({ navigation }) => {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<string>('');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Icon name={Icons.navigation.back.name} color={Colors.text.primary} size="md" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scripture</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchSection}>
        <TextInput
          mode="outlined"
          placeholder="Search verses..."
          value={q}
          onChangeText={setQ}
          style={styles.search}
        />
      </View>

      <View style={styles.topics}>
        {topics.map((t) => (
          <Chip key={t} selected={selected === t} onPress={() => setSelected(t)} style={styles.topicChip}>
            {t}
          </Chip>
        ))}
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Surface style={styles.card} elevation={1}>
            <Text style={styles.reference}>{item.reference} · {item.translation}</Text>
            <Text style={styles.text}>{item.text}</Text>
          </Surface>
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', flex: 1 },
  headerSpacer: { width: 40 },
  searchSection: { paddingHorizontal: 16, paddingBottom: 8 },
  search: { backgroundColor: Colors.background.secondary },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  topicChip: { backgroundColor: Colors.background.tertiary },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  card: { backgroundColor: Colors.background.secondary, borderRadius: 8, padding: 16, marginBottom: 8 },
  reference: { color: Colors.text.primary, fontWeight: '600', marginBottom: 6 },
  text: { color: Colors.text.secondary, lineHeight: 20 },
});

export default ScriptureBrowserScreen;


