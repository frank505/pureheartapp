import React, { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, TextInput, Button } from 'react-native-paper';
import Icon from '../components/Icon';
import { Colors, Icons } from '../constants';

interface AIChatScreenProps { navigation?: any }

type Msg = { id: string; role: 'user'|'assistant'; text: string };

const AIChatScreen: React.FC<AIChatScreenProps> = ({ navigation }) => {
  const [messages, setMessages] = useState<Msg[]>([
    { id: 'm1', role: 'assistant', text: 'Hi, I am your AI companion. How can I support you today?' },
  ]);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<Msg>>(null);

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Msg = { id: String(Date.now()), role: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMsg, { id: `${Date.now()}_a`, role: 'assistant', text: 'Thank you for sharing. Remember Philippians 4:13 — I can do all things through Him who strengthens me.' }]);
    setInput('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const quicks = useMemo(() => [
    { key: 'coach', label: 'Emergency coach' },
    { key: 'truth', label: 'Replace a lie' },
    { key: 'scripture', label: 'Scripture suggestion' },
  ], []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Icon name={Icons.navigation.back.name} color={Colors.text.primary} size="md" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Companion</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Quick prompts */}
      <View style={styles.quickRow}>
        {quicks.map((q) => (
          <Button key={q.key} mode="outlined" style={styles.quickBtn} onPress={() => setInput(q.label)}>
            {q.label}
          </Button>
        ))}
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <View style={[styles.msgRow, item.role === 'user' ? styles.right : styles.left]}>
            <Surface style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]} elevation={1}>
              <Text style={item.role === 'user' ? styles.userText : styles.assistantText}>{item.text}</Text>
            </Surface>
          </View>
        )}
        contentContainerStyle={styles.messages}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          mode="outlined"
          placeholder="Type a message"
          value={input}
          onChangeText={setInput}
          style={styles.input}
        />
        <TouchableOpacity style={[styles.sendBtn, !input.trim() ? styles.sendDisabled : styles.sendEnabled]} onPress={send} disabled={!input.trim()}>
          <Icon name="send-outline" color={input.trim() ? Colors.white : Colors.text.secondary} size="md" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', flex: 1 },
  headerSpacer: { width: 40 },
  quickRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  quickBtn: { borderColor: Colors.border.primary },
  messages: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  msgRow: { flexDirection: 'row' },
  left: { justifyContent: 'flex-start' },
  right: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '80%', borderRadius: 12, padding: 12 },
  userBubble: { backgroundColor: Colors.primary.main },
  assistantBubble: { backgroundColor: Colors.background.secondary },
  userText: { color: Colors.white },
  assistantText: { color: Colors.text.primary },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: Colors.border.primary },
  input: { flex: 1, backgroundColor: Colors.background.secondary },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sendEnabled: { backgroundColor: Colors.primary.main },
  sendDisabled: { backgroundColor: Colors.background.secondary },
});

export default AIChatScreen;


