import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, Chip } from 'react-native-paper';
import Icon from '../components/Icon';
import { Icons } from '../constants';
import { useDispatch, useSelector } from 'react-redux';
import { createPrayerRequest } from '../store/slices/prayerRequestSlice';
import { AppDispatch, RootState } from '../store';
import { CreatePrayerRequestPayload } from '../services/prayerRequestService';
import { Colors } from '../constants';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';

const CreatePrayerRequestScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.prayerRequests);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState<CreatePrayerRequestPayload['visibility']>('private');
  const richText = useRef<RichEditor>(null);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a title for your prayer request.');
      return;
    }
    const payload: CreatePrayerRequestPayload = { title, body, visibility };
    try {
      await dispatch(createPrayerRequest(payload)).unwrap();
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create prayer request.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Icon name={Icons.navigation.back.name} color={Colors.text.primary} size="md" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create a Prayer Request</Text>
        <View style={styles.headerSpacer} />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.form}>
          <View style={styles.textFieldContainer}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              mode="outlined"
              placeholder="Prayer Request Title"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />
          </View>
          <View style={styles.textFieldContainer}>
            <Text style={styles.label}>Details</Text>
            <ScrollView style={{ height: 250 }}>
              <RichEditor
                ref={richText}
                placeholder="Write your prayer request details..."
                initialContentHTML={body}
                onChange={(html: string) => setBody(html)}
                androidHardwareAccelerationDisabled={true}
                useContainer={true}
                editorStyle={{ backgroundColor: Colors.background.primary, color: Colors.text.primary }}
                style={styles.richEditor}
              />
              <RichToolbar
                editor={richText}
                actions={[actions.undo, actions.redo, actions.bold, actions.italic, actions.underline, actions.insertBulletsList, actions.insertOrderedList, actions.insertLink]}
                style={styles.richToolbar}
                iconMap={{}}
              />
            </ScrollView>
          </View>

          <View style={styles.visibilityRow}>
            {(['private', 'partner', 'group', 'public'] as const).map((v) => (
              <Chip
                key={v}
                selected={visibility === v}
                onPress={() => setVisibility(v)}
                style={[styles.visibilityChip, visibility === v && styles.visibilityChipActive]}
              >
                {v}
              </Chip>
            ))}
          </View>
          <Button mode="contained" onPress={handleSubmit} style={styles.submitButton} buttonColor={Colors.primary.main} loading={loading}>
            Submit
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { padding: 8 },
  headerSpacer: { width: 40 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', flex: 1 },
  form: { padding: 16 },
  textFieldContainer: { marginBottom: 12 },
  label: { color: Colors.text.secondary, marginBottom: 6 },
  input: { backgroundColor: Colors.background.primary, marginBottom: 12 },
  richEditor: { minHeight: 180, borderRadius: 8, padding: 8, backgroundColor: Colors.background.primary },
  richToolbar: { borderTopWidth: 1, borderTopColor: Colors.border?.primary || '#333', backgroundColor: Colors.background.secondary, marginTop: 8, borderRadius: 8 },
  visibilityRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  visibilityChip: { backgroundColor: Colors.background.tertiary },
  visibilityChipActive: { backgroundColor: `${Colors.primary.main}22` },
  submitButton: { marginTop: 4, borderRadius: 8 },
});

export default CreatePrayerRequestScreen;
