import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Text, Surface, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { Colors } from '../constants';

import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TruthStackParamList } from '../navigation/TruthNavigator';
import { RootStackParamList } from '../navigation/types';

import { truthService } from '../services/truthService';

type AddTruthScreenProps = CompositeScreenProps<
  NativeStackScreenProps<TruthStackParamList, 'AddTruth'>,
  NativeStackScreenProps<RootStackParamList>
>;

const AddTruthScreen: React.FC<AddTruthScreenProps> = ({ navigation, route }) => {
  const [lie, setLie] = useState(route.params?.lie || '');
  const [biblicalTruth, setBiblicalTruth] = useState(route.params?.truth || '');
  const [explanation, setExplanation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = route.params?.isEditing || false;
  const entryId = route.params?.id;

  useEffect(() => {
    if (isEditing && entryId) {
      loadTruthEntry();
    }
  }, [isEditing, entryId]);

  const loadTruthEntry = async () => {
    if (!entryId) return;
    try {
      const response = await truthService.getTruthEntryById(entryId);
      if (response.success && response.data) {
        const entry = response.data;
        setLie(entry.lie);
        setBiblicalTruth(entry.biblicalTruth);
        setExplanation(entry.explanation);
      }
    } catch (err) {
      console.error('Failed to load truth entry:', err);
      setError('Failed to load the truth entry');
    }
  };

  const handleSave = async () => {
    if (!lie || !biblicalTruth) {
      setError('Please fill in both the lie and biblical truth');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (isEditing && entryId) {
        const response = await truthService.updateTruthEntry(entryId, {
          lie,
          biblicalTruth,
          explanation,
        });
        if (!response.success) {
          throw new Error(response.message || 'Failed to update truth entry');
        }
      } else {
        const response = await truthService.saveTruthEntry({
          lie,
          biblicalTruth,
          explanation,
        });
        if (!response.success) {
          throw new Error(response.message || 'Failed to save truth entry');
        }
      }
      // Refresh truth entries before navigating back
      await truthService.getUserTruthEntries();
      navigation.goBack();
    } catch (err) {
      console.error('Failed to save truth entry:', err);
      setError('Failed to save the truth entry');
    } finally {
      setIsSaving(false);
    }
  };

  const generateTruth = async () => {
    if (!lie) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const response = await truthService.generateResponseToLie(lie);
      if (response.success && response.data) {
        setBiblicalTruth(response.data.biblicalTruth);
        setExplanation(response.data.explanation);
      }
    } catch (err) {
      console.error('Failed to generate truth:', err);
      setError('Failed to generate biblical truth response');
    } finally {
      setIsGenerating(false);
    }
  };

  const openScriptureBrowser = () => {
    navigation.navigate('ScriptureBrowser' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          disabled={isSaving}
        >
          <Icon name="arrow-back" size="md" color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Truth' : 'Add New Truth'}
        </Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={Colors.primary.main} />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Lie Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identify the Lie</Text>
          <Text style={styles.sectionDescription}>
            What lie are you believing? Be specific and honest.
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter the lie..."
            placeholderTextColor={Colors.text.secondary}
            value={lie}
            onChangeText={setLie}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Biblical Truth Response */}
        <View style={styles.section}>
         
   
          <Text style={styles.sectionDescription}>
            Replace this lie with God's truth. What does His Word say about this?
          </Text>
          
          <TextInput
            style={styles.textArea}
            placeholder='e.g., "I can do all things through Christ who strengthens me." - Philippians 4:13'
            placeholderTextColor={Colors.text.secondary}
            value={biblicalTruth}
            onChangeText={setBiblicalTruth}
            multiline={true}
            numberOfLines={6}
            textAlignVertical="top"
          />
          
          <TouchableOpacity 
            style={[
              styles.generateButton,
              (!lie || isGenerating) && styles.generateButtonDisabled
            ]}
            onPress={generateTruth}
            disabled={!lie || isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <>
                <Icon name="bulb-outline" size="sm" color={Colors.white} />
                <Text style={styles.generateButtonText}>Generate Biblical Truth</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Explanation */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Explanation</Text>
            <Text style={styles.sectionDescription}>
              How does this truth counter the lie? What scripture supports this?
            </Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter an explanation..."
              placeholderTextColor={Colors.text.secondary}
              value={explanation}
              onChangeText={setExplanation}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>



          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: Colors.primary.main,
    fontWeight: '600',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  truthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scriptureLink: {
    color: Colors.primary.main,
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text.primary,
    minHeight: 120,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  suggestionsScroll: {
    marginTop: 16,
  },
  suggestionCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    width: 280,
  },
  verseText: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 24,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  verseReference: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
    marginBottom: 12,
  },
  useVerseButton: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  useVerseText: {
    color: Colors.primary.main,
    fontWeight: '600',
    fontSize: 14,
  },

  errorContainer: {
    backgroundColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
});

export default AddTruthScreen;
