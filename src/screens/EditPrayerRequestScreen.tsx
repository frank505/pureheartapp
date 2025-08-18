import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Chip, TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { updatePrayerRequest, getPrayerRequestById } from '../store/slices/prayerRequestSlice';
import { AppDispatch, RootState } from '../store';
import { UpdatePrayerRequestPayload } from '../services/prayerRequestService';
import { Colors, Icons } from '../constants';
import Icon from '../components/Icon';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import PartnerGroupSelector from '../components/PartnerGroupSelector';
import { fetchPartners, fetchGroups } from '../store/slices/invitationSlice';

const EditPrayerRequestScreen = ({ route, navigation }: any) => {
  const { prayerRequestId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { selectedPrayerRequest, loading } = useSelector((state: RootState) => state.prayerRequests);
  const { connectedPartners, groups } = useSelector((state: RootState) => state.invitation);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState<UpdatePrayerRequestPayload['visibility']>('private');
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const richText = useRef<RichEditor>(null);

  useEffect(() => {
    dispatch(getPrayerRequestById(prayerRequestId));
    dispatch(fetchPartners());
    dispatch(fetchGroups());
  }, [dispatch, prayerRequestId]);

  useEffect(() => {
    if (selectedPrayerRequest) {
      setTitle(selectedPrayerRequest.title);
      setBody(selectedPrayerRequest.body || '');
      setVisibility(selectedPrayerRequest.visibility);
      setSelectedPartners(Array.from(new Set(selectedPrayerRequest.partnerIds?.map(String) || [])));
      setSelectedGroups(Array.from(new Set(selectedPrayerRequest.groupIds?.map(String) || [])));
    }
  }, [selectedPrayerRequest]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a title for your prayer request.');
      return;
    }
    Alert.alert('id', prayerRequestId);
    const payload: UpdatePrayerRequestPayload = {
      title,
      body,
      visibility,
      partnerIds: Array.from(new Set(selectedPartners.map(Number))),
      groupIds: Array.from(new Set(selectedGroups.map(Number))),
    };

    try {
      await dispatch(updatePrayerRequest({ id: prayerRequestId, payload })).unwrap();
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update prayer request.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Icon name={Icons.navigation.back.name} color={Colors.text.primary} size="md" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Prayer Request</Text>
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

          {visibility === 'partner' && (
            <PartnerGroupSelector
              partners={connectedPartners}
              groups={[]}
              selectedPartners={selectedPartners}
              selectedGroups={selectedGroups}
              onPartnerSelectionChange={setSelectedPartners}
              onGroupSelectionChange={setSelectedGroups}
            />
          )}
          {visibility === 'group' && (
            <PartnerGroupSelector
              partners={[]}
              groups={groups}
              selectedPartners={selectedPartners}
              selectedGroups={selectedGroups}
              onPartnerSelectionChange={setSelectedPartners}
              onGroupSelectionChange={setSelectedGroups}
            />
          )}

          <Button mode="contained" onPress={handleSubmit} style={styles.submitButton} buttonColor={Colors.primary.main} loading={loading}>
            Update
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

export default EditPrayerRequestScreen;
