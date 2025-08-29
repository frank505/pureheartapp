import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../constants';
import fastingService from '../services/fastingService';

type RouteParams = { fastId: number };

const CreateJournalScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { fastId } = (route.params || {}) as RouteParams;
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'partner'>('private');
  const [saving, setSaving] = useState(false);
  
  const bodyInputRef = useRef<TextInput>(null);
  const titleInputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Focus on title input when screen loads
    const timer = setTimeout(() => {
      titleInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = async () => {
    if (!body.trim()) {
      Alert.alert('Empty Journal', 'Please write something before saving.');
      return;
    }

    try {
      setSaving(true);
      await fastingService.createJournal(fastId, {
        title: title.trim() || undefined,
        body: body.trim(),
        visibility: visibility,
      });
      
      // Navigate back to journals list
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save journal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || body.trim()) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Continue Writing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>New Journal</Text>
        
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.headerButton, styles.saveButton]}
          disabled={saving || !body.trim()}
        >
          {saving ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={[
              styles.headerButtonText, 
              styles.saveButtonText,
              (!body.trim()) && styles.disabledButtonText
            ]}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Title Input */}
        <TextInput
          ref={titleInputRef}
          style={styles.titleInput}
          placeholder="Title"
          placeholderTextColor={Colors.text.tertiary}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
          returnKeyType="next"
          onSubmitEditing={() => bodyInputRef.current?.focus()}
        />

        {/* Body Input */}
        <TextInput
          ref={bodyInputRef}
          style={styles.bodyInput}
          placeholder="Start writing..."
          placeholderTextColor={Colors.text.tertiary}
          value={body}
          onChangeText={setBody}
          multiline
          textAlignVertical="top"
          scrollEnabled
        />

        {/* Visibility Options */}
        <View style={styles.visibilityContainer}>
          <Text style={styles.visibilityLabel}>Visibility</Text>
          <View style={styles.visibilityButtons}>
            <TouchableOpacity
              style={[
                styles.visibilityButton,
                visibility === 'private' && styles.visibilityButtonActive
              ]}
              onPress={() => setVisibility('private')}
            >
              <Text style={[
                styles.visibilityButtonText,
                visibility === 'private' && styles.visibilityButtonTextActive
              ]}>
                Private
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.visibilityButton,
                visibility === 'partner' && styles.visibilityButtonActive
              ]}
              onPress={() => setVisibility('partner')}
            >
              <Text style={[
                styles.visibilityButtonText,
                visibility === 'partner' && styles.visibilityButtonTextActive
              ]}>
                Partner
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border.secondary,
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 60,
  },
  headerButtonText: {
    color: Colors.primary.main,
    fontSize: 16,
    fontWeight: '400',
  },
  headerTitle: {
    color: Colors.text.primary,
    fontSize: 17,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
  },
  saveButtonText: {
    color: Colors.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledButtonText: {
    color: Colors.text.tertiary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  bodyInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.primary,
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'Roboto',
  },
  visibilityContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border.secondary,
  },
  visibilityLabel: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  visibilityButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  visibilityButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    backgroundColor: 'transparent',
  },
  visibilityButtonActive: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  visibilityButtonText: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  visibilityButtonTextActive: {
    color: Colors.white,
  },
});

export default CreateJournalScreen;
