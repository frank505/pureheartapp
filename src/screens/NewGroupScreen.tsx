/**
 * NewGroupScreen Component
 * 
 * Screen for creating a new accountability group.
 * Features group name, description, privacy settings, and member invitations.
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  Surface,
  TextInput,
  Button,
  Chip,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { Colors, Icons } from '../constants';
import groupService from '../services/groupService';

interface NewGroupScreenProps {
  navigation?: any;
  route?: any;
}

const NewGroupScreen: React.FC<NewGroupScreenProps> = ({ navigation }) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const addEmailTokens = (text: string) => {
    const tokens = text
      .split(/[\s,;]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    if (tokens.length === 0) return;
    setEmails((prev) => {
      const set = new Set(prev.map((e) => e.toLowerCase()));
      const next = [...prev];
      for (const t of tokens) {
        const lower = t.toLowerCase();
        if (!set.has(lower)) {
          set.add(lower);
          next.push(t);
        }
      }
      return next;
    });
    setEmailInput('');
  };
  
  const handleGoBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }
    try {
      setCreating(true);
      const created = await groupService.createGroup({ name: groupName.trim(), description: description.trim() || undefined, privacy });
      // Ensure an invite/access code exists before sending invites
      try {
        const { code } = await groupService.rotateInviteCode(created.id);
        setAccessCode(code);
      } catch {}
      if (emails.length) {
        try { await groupService.inviteMembers(created.id, emails); } catch {}
      }
      Alert.alert(
        'Group Created!',
        `Your group "${created.name}" has been created successfully.${accessCode ? `\nAccess Code: ${accessCode}` : ''}`,
        [
          {
            text: 'Open Chat',
            onPress: () => navigation?.navigate('GroupChat', { groupId: created.id, groupName: created.name, memberCount: created.membersCount })
          },
          { text: 'OK', onPress: () => navigation?.goBack() },
        ]
      );
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Failed to create group';
      Alert.alert('Error', message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Icon 
            name={Icons.navigation.back.name} 
            color={Colors.text.primary} 
            size="md" 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Group</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Group Name */}
          <View style={styles.section}>
            <Text style={styles.label}>Group Name</Text>
            <TextInput
              style={styles.input}
              mode="outlined"
              placeholder="Victorious Warriors"
              value={groupName}
              onChangeText={setGroupName}
              outlineColor={Colors.border.primary}
              activeOutlineColor={Colors.primary.main}
              textColor={Colors.text.primary}
              placeholderTextColor={Colors.text.secondary}
              theme={{
                colors: {
                  surface: Colors.background.secondary,
                  onSurface: Colors.text.primary,
                  outline: Colors.border.primary,
                }
              }}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.textArea}
              mode="outlined"
              placeholder="A space for accountability and growth."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              outlineColor={Colors.border.primary}
              activeOutlineColor={Colors.primary.main}
              textColor={Colors.text.primary}
              placeholderTextColor={Colors.text.secondary}
              theme={{
                colors: {
                  surface: Colors.background.secondary,
                  onSurface: Colors.text.primary,
                  outline: Colors.border.primary,
                }
              }}
            />
          </View>

          {/* Privacy Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy</Text>
            
            <TouchableOpacity 
              style={[
                styles.privacyOption,
                privacy === 'public' && styles.privacyOptionSelected
              ]}
              onPress={() => setPrivacy('public')}
            >
              <View style={styles.privacyContent}>
                <Text style={styles.privacyTitle}>Public</Text>
                <Text style={styles.privacyDescription}>
                  Anyone can find and join this group.
                </Text>
              </View>
              <View style={[
                styles.radioButton,
                privacy === 'public' && styles.radioButtonSelected
              ]}>
                {privacy === 'public' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.privacyOption,
                privacy === 'private' && styles.privacyOptionSelected
              ]}
              onPress={() => setPrivacy('private')}
            >
              <View style={styles.privacyContent}>
                <Text style={styles.privacyTitle}>Private</Text>
                <Text style={styles.privacyDescription}>
                  Only invited members can join.
                </Text>
              </View>
              <View style={[
                styles.radioButton,
                privacy === 'private' && styles.radioButtonSelected
              ]}>
                {privacy === 'private' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Invite Members */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invite Members</Text>
            <View style={styles.chipsContainer}>
              {emails.map((e) => (
                <Chip key={e} onClose={() => setEmails((prev) => prev.filter((x) => x !== e))} style={styles.chip}>
                  {e}
                </Chip>
              ))}
            </View>
            <View style={styles.emailInputContainer}>
              <Icon name="mail-outline" color={Colors.text.secondary} size="sm" style={styles.emailIcon} />
              <TextInput
                style={styles.emailInput}
                mode="outlined"
                placeholder="Type email and press space/comma/enter to add"
                value={emailInput}
                onChangeText={(t) => {
                  setEmailInput(t);
                  if (/[\s,;]$/.test(t)) {
                    addEmailTokens(t);
                  }
                }}
                onBlur={() => emailInput && addEmailTokens(emailInput)}
                outlineColor={Colors.border.primary}
                activeOutlineColor={Colors.primary.main}
                textColor={Colors.text.primary}
                placeholderTextColor={Colors.text.secondary}
                theme={{
                  colors: {
                    surface: Colors.background.secondary,
                    onSurface: Colors.text.primary,
                    outline: Colors.border.primary,
                  },
                }}
              />
            </View>
            <Text style={styles.helperText}>Emails will receive an invite. If the group is private, they will need the access code.</Text>

            {/* Access Code (generated after creation) */}
            <View style={{ marginTop: 12 }}>
              <Text style={styles.label}>Access Code</Text>
              <TextInput mode="outlined" value={accessCode ?? 'Will be generated on creation'} editable={false} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer with Create Button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleCreateGroup}
          style={styles.createButton}
          contentStyle={styles.createButtonContent}
          labelStyle={styles.createButtonLabel}
          buttonColor={Colors.primary.main}
        >
          Create Group
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },

  // Content
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },

  // Sections
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: 8,
  },

  // Inputs
  input: {
    backgroundColor: Colors.background.secondary,
    fontSize: 16,
  },
  textArea: {
    backgroundColor: Colors.background.secondary,
    fontSize: 16,
    minHeight: 120,
  },

  // Privacy Options
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    marginBottom: 12,
    backgroundColor: Colors.background.secondary,
  },
  privacyOptionSelected: {
    borderColor: Colors.primary.main,
    backgroundColor: `${Colors.primary.main}10`,
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  privacyDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: Colors.primary.main,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary.main,
  },

  // Email Input
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  chip: {
    backgroundColor: Colors.background.tertiary,
  },
  emailInputContainer: {
    position: 'relative',
  },
  emailIcon: {
    position: 'absolute',
    left: 12,
    top: 16,
    zIndex: 1,
  },
  emailInput: {
    backgroundColor: Colors.background.secondary,
    fontSize: 16,
    paddingLeft: 48,
  },
  helperText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 8,
  },

  // Footer
  footer: {
    padding: 16,
    backgroundColor: Colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
  },
  createButton: {
    borderRadius: 8,
  },
  createButtonContent: {
    paddingVertical: 8,
  },
  createButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});

export default NewGroupScreen;