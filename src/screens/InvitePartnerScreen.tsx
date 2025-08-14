import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, Chip, Surface } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { sendInvitesByEmail } from '../store/slices/invitationSlice';
import { Colors, Icons } from '../constants';
import Icon from '../components/Icon';

const InvitePartnerScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((s) => s.invitation.loading);
  const [emailsText, setEmailsText] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [customCode, setCustomCode] = useState('');

  const parseEmails = (raw: string): string[] => {
    return raw
      .split(/[\n,\s]+/)
      .map((e) => e.trim())
      .filter((e) => !!e && /.+@.+\..+/.test(e));
  };

  const addEmails = () => {
    const parsed = parseEmails(emailsText);
    if (parsed.length === 0) return;
    setEmails((prev) => Array.from(new Set([...prev, ...parsed])));
    setEmailsText('');
  };

  const removeEmail = (email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email));
  };

  const invite = async () => {
    if (emails.length === 0) return;
    try {
      await dispatch(
        sendInvitesByEmail({ emails, hash: customCode?.trim() || undefined })
      ).unwrap();
      setEmails([]);
      setEmailsText('');
      setCustomCode('');
      Alert.alert('Success', 'Invitations sent');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to send invitations');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Icon name={Icons.navigation.back.name} color={Colors.text.primary} size="md" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite a Partner</Text>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Add email addresses to invite your accountability partners. A code will be generated and sent unless you specify a custom code below.
        </Text>
        {emails.length > 0 && (
          <View style={styles.chipContainer}>
            {emails.map((email) => (
              <Surface key={email} style={styles.chipSurface}>
                <Text style={styles.chipText}>{email}</Text>
                <TouchableOpacity onPress={() => removeEmail(email)}>
                  <Icon name="close-outline" color={Colors.text.secondary} size="sm" />
                </TouchableOpacity>
              </Surface>
            ))}
          </View>
        )}
        <TextInput
          mode="outlined"
          value={emailsText}
          onChangeText={setEmailsText}
          onSubmitEditing={addEmails}
          placeholder="Type an email and press Enter"
          returnKeyType="done"
          style={styles.input}
        />
        <View style={styles.addButtonContainer}>
          <Button mode="text" onPress={addEmails}>Add</Button>
        </View>
        <TextInput
          mode="outlined"
          value={customCode}
          onChangeText={setCustomCode}
          placeholder="Optional custom code (starts with ph_)"
          style={styles.input}
        />
        <Button
          mode="contained"
          onPress={invite}
          disabled={emails.length === 0 || loading}
          loading={loading}
          style={styles.inviteButton}
        >
          Invite Partners
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', flex: 1 },
  headerSpacer: { width: 40 },
  content: { padding: 16 },
  subtitle: { color: Colors.text.secondary, marginBottom: 12, textAlign: 'center' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chipSurface: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: Colors.background.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipText: { color: Colors.text.primary },
  input: { marginBottom: 8 },
  addButtonContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: -8, marginBottom: 8 },
  inviteButton: { marginTop: 16 },
});

export default InvitePartnerScreen;
