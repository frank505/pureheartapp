import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, Button, Modal, Portal, TextInput, ActivityIndicator } from 'react-native-paper';
import { Colors, Icons } from '../constants';
import Icon from '../components/Icon';
import groupService, { GroupMemberDTO, MessageDTO } from '../services/groupService';
import { useAppSelector } from '../store/hooks';

interface GroupChatScreenProps {
  navigation?: any;
  route?: { params?: { groupId: string; groupName?: string } };
}

const GroupChatScreen: React.FC<GroupChatScreenProps> = ({ navigation, route }) => {
  const groupId = route?.params?.groupId as string;
  const groupName = route?.params?.groupName as string | undefined;

  const currentUser = useAppSelector((s) => s.user.currentUser);

  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [membersVisible, setMembersVisible] = useState(false);
  const [members, setMembers] = useState<GroupMemberDTO[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersPage, setMembersPage] = useState(1);
  const [membersHasMore, setMembersHasMore] = useState(true);
  const [ownerId, setOwnerId] = useState<number | null>(null);

  const isOwner = useMemo(() => {
    if (!currentUser || ownerId == null) return false;
    // currentUser.id is string per slice, backend uses number. Coerce.
    const me = Number(currentUser.id);
    return me === ownerId;
  }, [currentUser, ownerId]);

  useEffect(() => {
    navigation?.setOptions?.({ headerShown: false });
  }, [navigation]);

  const loadMessages = useCallback(
    async (reset = false) => {
      if (!groupId) return;
      try {
        if (reset) setLoadingMsgs(true);
        else setLoadingMore(true);
        const params = reset ? {} : { cursor: nextCursor };
        const resp = await groupService.listMessages(groupId, params as any);
        if (reset) {
          // API returns newest first; keep as is for inverted list
          setMessages(resp.items);
        } else {
          setMessages((prev) => [...prev, ...resp.items]);
        }
        setNextCursor(resp.nextCursor);
      } catch (e) {
        // no-op minimal
      } finally {
        setLoadingMsgs(false);
        setLoadingMore(false);
      }
    },
    [groupId, nextCursor]
  );

  useEffect(() => {
    loadMessages(true);
  }, [loadMessages]);

  const loadMembers = useCallback(async (reset = false) => {
    if (!groupId) return;
    try {
      setMembersLoading(true);
      const page = reset ? 1 : membersPage;
      const resp = await groupService.listMembers(groupId, { page, pageSize: 20 });
      // First item may include owner via role === 'owner'; capture owner id
      const owner = resp.items.find((m) => m.role === 'owner');
      if (owner) setOwnerId(owner.user.id);
      setMembers((prev) => (reset ? resp.items : [...prev, ...resp.items]));
      setMembersPage(page + 1);
      setMembersHasMore(page < (resp.totalPages || 1));
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to load members');
    } finally {
      setMembersLoading(false);
    }
  }, [groupId, membersPage]);

  const openMembers = useCallback(() => {
    setMembersVisible(true);
    setMembers([]);
    setMembersPage(1);
    setMembersHasMore(true);
    // Delay to ensure modal open animation doesn't compete
    setTimeout(() => loadMembers(true), 50);
  }, [loadMembers]);

  const closeMembers = useCallback(() => setMembersVisible(false), []);

  const handleKick = useCallback(
    async (targetUserId: number) => {
      if (!groupId) return;
      Alert.alert('Remove Member', 'Are you sure you want to remove this member?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await groupService.kickMember(groupId, targetUserId);
              // Refresh members list optimistically
              setMembers((prev) => prev.filter((m) => m.user.id !== targetUserId));
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.message || 'Failed to remove member');
            }
          },
        },
      ]);
    },
    [groupId]
  );

  const renderMember = ({ item }: { item: GroupMemberDTO }) => {
    const name = item.user.firstName || item.user.lastName
      ? `${item.user.firstName ?? ''} ${item.user.lastName ?? ''}`.trim()
      : item.user.email;
    const isOwnerBadge = item.role === 'owner';
    const canKick = isOwner && item.role !== 'owner' && Number(currentUser?.id) !== item.user.id;
    return (
      <Surface style={styles.memberRow} elevation={0}>
        <View style={styles.memberLeft}>
          <Icon name={Icons.user.avatar.name} size="lg" />
          <View style={styles.memberText}>
            <Text style={styles.memberName}>{name || item.user.email}</Text>
            <Text style={styles.memberSub}>{item.user.email}</Text>
          </View>
        </View>
        <View style={styles.memberRight}>
          {isOwnerBadge && (
            <View style={styles.ownerBadge}>
              <Icon name="crown" library="MaterialCommunityIcons" color={Colors.warning.main} size={18} />
              <Text style={styles.ownerLabel}>Owner</Text>
            </View>
          )}
          {canKick && (
            <TouchableOpacity onPress={() => handleKick(item.user.id)}>
              <Icon name={Icons.navigation.delete.name} color={Colors.error.main} />
            </TouchableOpacity>
          )}
        </View>
      </Surface>
    );
  };

  const [addEmail, setAddEmail] = useState('');
  const handleInvite = useCallback(async () => {
    if (!groupId || !addEmail.trim()) return;
    try {
      const list = addEmail
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);
      await groupService.inviteMembers(groupId, list);
      Alert.alert('Invites sent', 'Invitation emails have been sent.');
      setAddEmail('');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to send invites');
    }
  }, [groupId, addEmail]);

  const handleLeaveGroup = useCallback(() => {
    if (!groupId) return;
    Alert.alert('Leave Group', 'Are you sure you want to leave this group?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            await groupService.leaveGroup(groupId);
            setMembersVisible(false);
            navigation?.goBack?.();
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Failed to leave group');
          }
        },
      },
    ]);
  }, [groupId, navigation]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!groupId || !text || sending) return;
    try {
      setSending(true);
      const msg = await groupService.sendMessage(groupId, { text });
      // Prepend to newest-first list
      setMessages((prev) => [msg, ...prev]);
      setInputText('');
    } catch (e) {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  }, [groupId, inputText, sending]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    try {
      setRefreshing(true);
      await loadMessages(true);
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, loadMessages]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Icon name={Icons.navigation.back.name} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{groupName || 'Group Chat'}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIconButton} onPress={openMembers}>
            <Icon name={Icons.tabs.accountability.name} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        inverted
        contentContainerStyle={{ padding: 12 }}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderItem={({ item }) => {
          const mine = currentUser && String(item.author.id) === String(currentUser.id);
          return (
            <View style={[styles.msgRow, mine ? styles.msgRowMine : styles.msgRowOther]}>
              <View style={[styles.msgBubble, mine ? styles.msgBubbleMine : styles.msgBubbleOther]}>
                {item.text ? <Text style={mine ? styles.msgTextMine : styles.msgTextOther}>{item.text}</Text> : null}
                <Text style={styles.msgTime}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
            </View>
          );
        }}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (!loadingMore && nextCursor) {
            loadMessages(false);
          }
        }}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={{ paddingVertical: 12 }} /> : null}
        ListEmptyComponent={
          loadingMsgs ? (
            <ActivityIndicator style={{ marginTop: 24 }} />
          ) : (
            <Text style={{ color: Colors.text.secondary, textAlign: 'center', marginTop: 24 }}>No messages yet</Text>
          )
        }
        style={{ flex: 1 }}
      />

      {/* Composer */}
      <Surface style={styles.composer} elevation={2}>
        <TextInput
          mode="outlined"
          placeholder="Type a message"
          value={inputText}
          onChangeText={setInputText}
          style={{ flex: 1 }}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={sending || !inputText.trim()}>
          <Icon name={Icons.actions.send.name} color={sending || !inputText.trim() ? Colors.text.tertiary : Colors.primary.main} />
        </TouchableOpacity>
      </Surface>

      {/* Members Modal */}
      <Portal>
        <Modal visible={membersVisible} onDismiss={closeMembers} contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Members</Text>
            <TouchableOpacity onPress={closeMembers}>
              <Icon name={Icons.navigation.close.name} />
            </TouchableOpacity>
          </View>

          {isOwner && (
            <Surface style={styles.inviteRow} elevation={0}>
              <TextInput
                mode="outlined"
                style={{ flex: 1 }}
                placeholder="Enter emails, comma separated"
                value={addEmail}
                onChangeText={setAddEmail}
              />
              <Button mode="contained" onPress={handleInvite} style={{ marginLeft: 8 }}>
                Invite
              </Button>
            </Surface>
          )}

          <FlatList
            data={members}
            keyExtractor={(m) => String(m.user.id)}
            renderItem={renderMember}
            onEndReachedThreshold={0.4}
            onEndReached={() => membersHasMore && !membersLoading && loadMembers()}
            ListFooterComponent={
              membersLoading ? (
                <Text style={{ color: Colors.text.secondary, textAlign: 'center', padding: 12 }}>Loading…</Text>
              ) : null
            }
            style={{ maxHeight: 420 }}
          />

          {!isOwner && (
            <View style={{ marginTop: 12 }}>
              <Button mode="contained" buttonColor={Colors.error.main} onPress={handleLeaveGroup}>
                Leave Group
              </Button>
            </View>
          )}
        </Modal>
      </Portal>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  backButton: { padding: 8 },
  headerTitle: { flex: 1, textAlign: 'center', color: Colors.text.primary, fontWeight: '700', fontSize: 16 },
  headerActions: { width: 40, alignItems: 'flex-end' },
  headerIconButton: { padding: 6 },
  msgRow: { flexDirection: 'row', marginBottom: 8 },
  msgRowMine: { justifyContent: 'flex-end' },
  msgRowOther: { justifyContent: 'flex-start' },
  msgBubble: { maxWidth: '80%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  msgBubbleMine: { backgroundColor: Colors.primary.main, borderTopRightRadius: 2 },
  msgBubbleOther: { backgroundColor: Colors.background.secondary, borderTopLeftRadius: 2, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.border.primary },
  msgTextMine: { color: Colors.white },
  msgTextOther: { color: Colors.text.primary },
  msgTime: { color: Colors.text.secondary, fontSize: 10, marginTop: 4 },

  composer: { flexDirection: 'row', alignItems: 'center', padding: 8, gap: 8, borderTopWidth: 1, borderTopColor: Colors.border.primary },
  sendBtn: { padding: 8 },

  modalContainer: {
    backgroundColor: Colors.background.secondary,
    margin: 16,
    borderRadius: 12,
    padding: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: { color: Colors.text.primary, fontSize: 18, fontWeight: '700' },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.primary,
  },
  memberLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  memberText: { },
  memberName: { color: Colors.text.primary, fontWeight: '600' },
  memberSub: { color: Colors.text.secondary, fontSize: 12 },
  memberRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ownerBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 6 },
  ownerLabel: { color: Colors.warning.main, fontSize: 12, fontWeight: '600' },
  inviteRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  ownerActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
});

export default GroupChatScreen;


