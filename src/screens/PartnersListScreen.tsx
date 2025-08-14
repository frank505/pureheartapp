import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, Button, Chip, TextInput } from 'react-native-paper';
import { Colors, Icons } from '../constants';
import Icon from '../components/Icon';
import SkeletonList from '../components/SkeletonList';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  removePartner,
  revokeInvite,
  loadInvitationData,
  sendInvitesByEmail,
  acceptByCode,
} from '../store/slices/invitationSlice';

interface PartnersListScreenProps {
  navigation?: any;
}

const EmailInviteInline: React.FC = () => {
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
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to send invitations');
    }
  };

  return (
    <View>
      {emails.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          {emails.map((email) => (
            <Surface key={email} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: Colors.background.secondary, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ color: Colors.text.primary }}>{email}</Text>
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
      />
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6 }}>
        <Button mode="text" onPress={addEmails}>Add</Button>
      </View>

      <TextInput
        mode="outlined"
        value={customCode}
        onChangeText={setCustomCode}
        placeholder="Optional custom code (starts with ph_)"
        style={{ marginTop: 8 }}
      />

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <Button mode="contained" onPress={invite} disabled={emails.length === 0 || loading}>
          Invite Partners
        </Button>
      </View>
    </View>
  );
};

const PartnersListScreen: React.FC<PartnersListScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { connectedPartners, sentInvitations, receivedInvitations, loading, error } = useAppSelector(
    (state) => state.invitation
  );
  const { currentUser } = useAppSelector((state) => state.user);

  useEffect(() => {
    dispatch(loadInvitationData());
  }, [dispatch]);

  // Removed code generation; invitations are handled in Accountability screen and email inline below

  const handleRemovePartner = (id: string) => dispatch(removePartner(id));
  const handleRevoke = (id: string) => {
    Alert.alert(
      'Revoke Invitation',
      'Are you sure you want to revoke this invitation? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: () => dispatch(revokeInvite(id)),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Icon name={Icons.navigation.back.name} color={Colors.text.primary} size="md" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Partners & Invitations</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <SkeletonList count={3} />
      ) : error ? (
        <Surface style={styles.card} elevation={1}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </Surface>
      ) : (
        <FlatList
          ListHeaderComponent={
            <View style={styles.section}>
            
              {/* Connected Partners */}
              <Text style={styles.sectionTitle}>Connected Partners</Text>
              {connectedPartners.length === 0 ? (
                <Surface style={styles.card} elevation={1}>
                  <Text style={styles.muted}>No partners yet. Send an invite to get started.</Text>
                </Surface>
              ) : (
                connectedPartners.map((p) => (
                  <Surface key={p.id} style={styles.card} elevation={1}>
                    <View style={styles.rowBetween}>
                      <View style={styles.col}>
                        <Text style={styles.title}>{p.partner ? `${p.partner.firstName} ${p.partner.lastName}` : 'Unknown Partner'}</Text>
                        <Text style={styles.subtitle}>{p.partner?.email}</Text>
                        <Chip icon="account-group" compact style={styles.typeChip}>
                          Partner since {new Date(p.since).toLocaleDateString()}
                        </Chip>
                      </View>
                      <Button mode="text" onPress={() => p.partner && handleRemovePartner(p.partner.id)}>
                        Remove
                      </Button>
                    </View>
                  </Surface>
                ))
              )}

              {/* Sent Invitations */}
              <Text style={styles.sectionTitle}>Sent Invitations</Text>
              {sentInvitations.length === 0 ? (
                <Surface style={styles.card} elevation={1}>
                  <Text style={styles.muted}>No sent invitations.</Text>
                </Surface>
              ) : (
                sentInvitations.map((i) => (
                  <Surface key={i.id} style={styles.card} elevation={1}>
                    <View style={styles.rowBetween}>
                      <View style={styles.col}>
                        <Text style={styles.title}>{i.receiver?.email || 'Invitation link'}</Text>
                        <Text style={styles.subtitle}>
                          Status: {i.usedAt ? `Accepted on ${new Date(i.usedAt).toLocaleDateString()}` : 'Pending'}
                        </Text>
                      </View>
                      {!i.usedAt && (
                        <Button mode="text" onPress={() => handleRevoke(i.id)}>Revoke</Button>
                      )}
                    </View>
                  </Surface>
                ))
              )}

              {/* Received Invitations */}
              <Text style={styles.sectionTitle}>Received Invitations</Text>
              {receivedInvitations.length === 0 ? (
                <Surface style={styles.card} elevation={1}>
                  <Text style={styles.muted}>No received invitations.</Text>
                </Surface>
              ) : (
                receivedInvitations.map((i) => (
                  <Surface key={i.id} style={styles.card} elevation={1}>
                    <View style={styles.rowBetween}>
                      <View style={styles.col}>
                        <Text style={styles.title}>{i.sender ? `${i.sender.firstName} ${i.sender.lastName}` : 'Unknown Sender'}</Text>
                        <Text style={styles.subtitle}>{i.sender?.email}</Text>
                      </View>
                       {!i.usedAt && (
                        <Button mode="contained" onPress={() => dispatch(acceptByCode(i.hash))}>Accept</Button>
                       )}
                    </View>
                  </Surface>
                ))
              )}
            </View>
          }
          data={[]}
          renderItem={null as any}
          keyExtractor={() => 'x'}
        />
      )}
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
    backgroundColor: Colors.background.primary,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', flex: 1 },
  headerSpacer: { width: 40 },
  section: { paddingHorizontal: 16, paddingBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.text.primary, marginTop: 16, marginBottom: 8 },
  inviteButton: { borderRadius: 8, marginBottom: 8 },
  card: { backgroundColor: Colors.background.secondary, borderRadius: 8, padding: 16, marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  col: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: Colors.text.primary },
  subtitle: { fontSize: 12, color: Colors.text.secondary, marginTop: 2 },
  typeChip: { alignSelf: 'flex-start', marginTop: 8, backgroundColor: Colors.background.tertiary },
  muted: { color: Colors.text.secondary },
  loader: { marginTop: 20 },
  errorText: { color: Colors.error.main, textAlign: 'center' },
});

export default PartnersListScreen;


