/**
 * GroupChatScreen Component
 * 
 * Chat interface for accountability groups.
 * Features real-time messaging, member avatars, and group info.
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { Colors, Icons } from '../constants';

interface GroupChatScreenProps {
  navigation?: any;
  route?: any;
}

interface Message {
  id: string;
  text: string;
  sender: string;
  avatar: string;
  timestamp: string;
  isCurrentUser: boolean;
}

const GroupChatScreen: React.FC<GroupChatScreenProps> = ({ navigation }) => {
  const [messageText, setMessageText] = useState('');
  const groupName = 'Men of Valor';
  const memberCount = 3;

  // Sample messages
  const [messages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey everyone, I'm Ethan. I'm here to support each other in our journey to overcome porn addiction. Let's share our struggles and victories, and keep each other accountable.",
      sender: 'Ethan',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpyvXsQbssMzX0CiD-50NXsCR9CM3gF6lUxjNSmmeyI-Jyj0bFy70DB0xm5VYPCAUq_it6mqtm8nLWnOaGLnAEHcmrcR6geO5v8BKZqEM2Qgt0Zo4XeFki2kbVZ-2KFUEgvSRDIkrhhzWckbsk_UmLUunmS9mbjUZk2APoiOExTPRvfQiba-1SMGJ9Kt18pWbCpqXpbb0mzXqefE0e2R284eh-xBLR69Z1KgZji8pJZ0TJRJdvAr6neWsOuHaDfCEICwyCYeg8ttgS',
      timestamp: '10:30 AM',
      isCurrentUser: false,
    },
    {
      id: '2',
      text: "Hi Ethan, I'm Olivia. I'm glad to be part of this group. I've been struggling with this for a while, and I hope we can find strength together.",
      sender: 'Olivia',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnaJtlx9qXJGv4DJ3ShF5TyjvAsXiiKO14AHRPNgxqYrKaHc66-VgsOPNQk0kgLz5SCrmmEEfENtfoeQwGWZW8tHCtuC8OUz_LemzxcWoOt-DYIPQ752AS_nkIO3rrJDQ-lJRrQCEpkwo1HCnxQSvEpOnj4RC5_cjAEtkLoyKTJX4i4J1Jv_ibbyJkMIl7YgdBJL2hDuE0cyKe1XBOZjfVJUJDD22u5gcJfC_SOohMaNtG6MCknstdx5sAA2we1USk_tAFBb43RZNt',
      timestamp: '10:32 AM',
      isCurrentUser: false,
    },
    {
      id: '3',
      text: "Welcome, Ethan and Olivia! I'm Noah. It's not easy, but we can do this. Let's set some goals for the week and check in regularly.",
      sender: 'You',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDv2VoIhmwQjSM8MW8Ee4UIhDmycNqDmv2Jt38ywmD2gSNWvVFiSG8vNClaN8IUeVSHejgklIHQt--sQR1YPl8TQkG5-tQRE0SEmHWrl52W4QjO1MW9YCEtIfkzqGI31CWomnv0Vh84FrSt9XE-gBxuiFWpe3K_VBp9KVORfPgwbbnlt7Z6eF6O27e7fGcSA_vacW3c-Vdp8wNHvSS7-WgENt7Wa6HnLH_v6Mdff5MgDRzJUX7AtCxhUBNF7UwlZPwrF5UMhJiLtIK',
      timestamp: '10:35 AM',
      isCurrentUser: true,
    },
    {
      id: '4',
      text: "Sounds good, Noah. My goal is to avoid triggers and spend more time in prayer and Bible study.",
      sender: 'Ethan',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwbppk1rxtZzX1TmFJ9Pd3qPGT4GfHtFXsH_h94eFeJ6EeuFx7nMHoIMmjGxw5iqrsLDCDUOhNN1G_rgyWv8ij-RaNNu4c2LRjHBDoXbJM9q2A_g9NXt66xCitpJmHLj3d7i4jFMVLC4Qz4TWftdSIP29sFSJ7yIqq8hgCHjO5OXsDJjrAHxvECGoL6Xob7Oznqr8X_rV_eV5OgvR9pmOnvFjMlaBM6ljxEIxoyZRkew-uiHlJNdIWk6tmRaF84qMg6h1pSH_can4f',
      timestamp: '10:37 AM',
      isCurrentUser: false,
    },
    {
      id: '5',
      text: "I'll join you in that, Ethan. I'll also try to find healthier ways to cope with stress instead of turning to porn.",
      sender: 'Olivia',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHeCuZTLzF3kXxbd2xeNmy8njDgCR9rigT1i5fsOuXgOPXNXm5z4n3bk6P26bIHmcKi8OrD4RW3llzHH5D15HmjK4vh-nAewK51phu3xW4a2IMAC1aC7WmPLfv4rnWHFAdm9ZK3wF0P4xoTmn9NFpvsbc8ttTMDvk2gQGb4GXQdmnSZ-RdUgw1Sb8Ek-KXLiK1auzCV8Y-iJDEqMPLJ-O-dK2Z7xYqGwUM8jUQ7wptryHMsHN-xs3gEDydrLOwOzG62tK5JGt_9ia0',
      timestamp: '10:39 AM',
      isCurrentUser: false,
    },
    {
      id: '6',
      text: "Great! Let's keep each other updated on our progress. Remember, we're in this together.",
      sender: 'You',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCern0GLQ4xDIuj7G1OMzDXBVtU9FAxGS4ElPvwUOyLKSEMsltU5ksxZXoeAcppPg0_I33Kxx5ehY-qjSEGSbejIOe07s2l3opuCkbrJS8FWlRvL--lvLJLK-bMMYUXox2fgDxHlKEIsK7-9YwUqaq_5MjhKgETc7NpRicyOtrVDvpcKOps43x0bw6a7GL0-tOYS2XMW6DXVg-eh7lNWCpilUAth7xWjxKe6CRajWA7j-GuWCy5jfzCUMNkpXIL6kZNe4QgYR4p7yNe',
      timestamp: '10:41 AM',
      isCurrentUser: true,
    },
  ]);
  
  const handleGoBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleGroupInfo = () => {
    Alert.alert(
      'Group Info',
      `${groupName}\n${memberCount} members\n\nManage group settings and members`,
      [{ text: 'OK' }]
    );
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Here you would send the message to your backend
      setMessageText('');
    }
  };

  const handleAttachment = () => {
    Alert.alert(
      'Add Attachment',
      'Choose what to share',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Photo', onPress: () => {} },
        { text: 'Scripture', onPress: () => {} },
        { text: 'Prayer Request', onPress: () => {} }
      ]
    );
  };

  const renderMessage = (message: Message, index: number) => {
    const isCurrentUser = message.isCurrentUser;
    
    return (
      <View 
        key={message.id}
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
        ]}
      >
        {!isCurrentUser && (
          <Image source={{ uri: message.avatar }} style={styles.messageAvatar} />
        )}
        
        <View style={styles.messageContent}>
          {!isCurrentUser && (
            <Text style={styles.messageSender}>{message.sender}</Text>
          )}
          {isCurrentUser && (
            <Text style={[styles.messageSender, styles.currentUserSender]}>You</Text>
          )}
          
          <View style={[
            styles.messageBubble,
            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
          ]}>
            <Text style={[
              styles.messageText,
              isCurrentUser ? styles.currentUserText : styles.otherUserText
            ]}>
              {message.text}
            </Text>
          </View>
        </View>
        
        {isCurrentUser && (
          <Image source={{ uri: message.avatar }} style={styles.messageAvatar} />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Icon 
            name={Icons.navigation.back.name} 
            color={Colors.text.primary} 
            size="md" 
          />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{groupName}</Text>
          <Text style={styles.headerSubtitle}>{memberCount} members</Text>
        </View>
        
        <TouchableOpacity style={styles.infoButton} onPress={handleGroupInfo}>
          <Icon 
            name="information-circle-outline" 
            color={Colors.text.primary} 
            size="md" 
          />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message, index) => renderMessage(message, index))}
        </ScrollView>

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.messageInput}
              mode="outlined"
              placeholder={`Message ${groupName}`}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
              outlineColor="transparent"
              activeOutlineColor="transparent"
              textColor={Colors.text.primary}
              placeholderTextColor={Colors.text.secondary}
              theme={{
                colors: {
                  surface: Colors.background.secondary,
                  onSurface: Colors.text.primary,
                  outline: 'transparent',
                }
              }}
            />
            
            <TouchableOpacity 
              style={styles.attachmentButton}
              onPress={handleAttachment}
            >
              <Icon 
                name="add-outline" 
                color={Colors.text.primary} 
                size="md" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.sendButton,
                messageText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
              ]}
              onPress={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Icon 
                name="send-outline" 
                color={messageText.trim() ? Colors.white : Colors.text.secondary} 
                size="md" 
              />
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
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  infoButton: {
    padding: 8,
  },

  // Messages
  messagesContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 24,
  },
  messageContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  currentUserMessage: {
    justifyContent: 'flex-end',
  },
  otherUserMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  messageContent: {
    flex: 1,
    maxWidth: '75%',
  },
  messageSender: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  currentUserSender: {
    textAlign: 'right',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '100%',
  },
  currentUserBubble: {
    backgroundColor: Colors.primary.main,
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: Colors.background.secondary,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  currentUserText: {
    color: Colors.white,
  },
  otherUserText: {
    color: Colors.text.primary,
  },

  // Input
  inputContainer: {
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
    padding: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageInput: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    borderRadius: 24,
    maxHeight: 100,
    fontSize: 16,
  },
  attachmentButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: Colors.primary.main,
  },
  sendButtonInactive: {
    backgroundColor: Colors.background.secondary,
  },
});

export default GroupChatScreen;