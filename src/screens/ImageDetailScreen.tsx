import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Surface } from 'react-native-paper';
import { format, parseISO } from 'date-fns';

// Components
import ScreenHeader from '../components/ScreenHeader';
import { Icon } from '../components';
import { Colors } from '../constants';

// Services
import screenshotApiService, { SensitiveImage, SensitiveImageComment } from '../services/screenshotApiService';

// Types
import { RootStackParamList } from '../navigation/types';

type ImageDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ImageDetail'>;
type ImageDetailRouteProp = RouteProp<RootStackParamList, 'ImageDetail'>;

interface FindingItemProps {
  label: string;
  category?: string | null;
  score?: number | null;
}

const FindingItem: React.FC<FindingItemProps> = ({ label, category, score }) => {
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return Colors.error.main;
    if (score >= 0.6) return Colors.warning.main;
    return Colors.primary.main;
  };

  return (
    <Surface style={styles.findingItem}>
      <View style={styles.findingContent}>
        <Text style={styles.findingLabel}>{label}</Text>
        {category && (
          <Text style={styles.findingCategory}>Category: {category}</Text>
        )}
        {score !== null && score !== undefined && (
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Confidence: </Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(score) }]}>
              {Math.round(score * 100)}%
            </Text>
          </View>
        )}
      </View>
    </Surface>
  );
};

interface CommentItemProps {
  comment: SensitiveImageComment;
  isOwner: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, isOwner }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  return (
    <Surface style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <View style={styles.commentAuthor}>
          <Icon 
            name={isOwner ? "person-outline" : "people-outline"} 
            color={Colors.primary.main} 
            size="sm" 
          />
          <Text style={styles.commentAuthorText}>
            {isOwner ? 'You' : 'Accountability Partner'}
          </Text>
        </View>
        {comment.createdAt && (
          <Text style={styles.commentDate}>
            {formatDate(comment.createdAt)}
          </Text>
        )}
      </View>
      <Text style={styles.commentText}>{comment.comment}</Text>
    </Surface>
  );
};

const ImageDetailScreen: React.FC = () => {
  const navigation = useNavigation<ImageDetailNavigationProp>();
  const route = useRoute<ImageDetailRouteProp>();
  const { imageId } = route.params;

  const [image, setImage] = useState<SensitiveImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [cancellingStreak, setCancellingStreak] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadImageDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Since we don't have a specific endpoint for single image details,
      // we'll get all images and find the one we need
      const images = await screenshotApiService.getSensitiveImages();
      const foundImage = images.find(img => img.id === imageId);
      
      if (foundImage) {
        setImage(foundImage);
      } else {
        setError('Image not found');
      }
    } catch (error) {
      console.error('Failed to load image details:', error);
      setError(error instanceof Error ? error.message : 'Failed to load image details');
    } finally {
      setLoading(false);
    }
  }, [imageId]);

  useFocusEffect(
    useCallback(() => {
      loadImageDetails();
    }, [loadImageDetails])
  );

  const handleAddComment = async () => {
    if (!commentText.trim() || !image) return;

    try {
      setSubmittingComment(true);
      const newComment = await screenshotApiService.addComment(image.id, commentText.trim());
      
      // Update the image with the new comment
      setImage(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: [...(prev.comments || []), newComment]
        };
      });
      
      setCommentText('');
      Alert.alert('Success', 'Comment added successfully');
    } catch (error) {
      console.error('Failed to add comment:', error);
      Alert.alert(
        'Error', 
        error instanceof Error ? error.message : 'Failed to add comment'
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCancelStreak = async () => {
    if (!image) return;

    Alert.alert(
      'Cancel Streak',
      'Are you sure you want to cancel this user\'s streak? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Cancel Streak',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancellingStreak(true);
              await screenshotApiService.cancelStreak(image.id);
              Alert.alert(
                'Streak Cancelled',
                'The user\'s streak has been cancelled and they have been notified.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              console.error('Failed to cancel streak:', error);
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to cancel streak'
              );
            } finally {
              setCancellingStreak(false);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'explicit':
        return Colors.error.main;
      case 'warning':
        return Colors.warning.main;
      default:
        return Colors.primary.main;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'explicit':
        return 'warning-outline';
      case 'warning':
        return 'alert-circle-outline';
      default:
        return 'checkmark-circle-outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'explicit':
        return 'Explicit Content Detected';
      case 'warning':
        return 'Warning Content Detected';
      default:
        return 'No Issues Detected';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMMM d, yyyy \'at\' h:mm a');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader 
          title="Image Details" 
          navigation={navigation} 
          showBackButton={true}
        />
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !image) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader 
          title="Image Details" 
          navigation={navigation} 
          showBackButton={true}
        />
        <View style={styles.errorState}>
          <Icon name="alert-circle-outline" color={Colors.error.main} size="xl" />
          <Text style={styles.errorTitle}>Unable to Load Details</Text>
          <Text style={styles.errorDescription}>
            {error || 'Image not found'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadImageDetails}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader 
        title="Report Details" 
        navigation={navigation} 
        showBackButton={true}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Status Header */}
          <Surface style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(image.status) }]}>
                <Icon 
                  name={getStatusIcon(image.status)} 
                  color={Colors.white} 
                  size="md" 
                />
                <Text style={styles.statusText}>
                  {getStatusLabel(image.status)}
                </Text>
              </View>
            </View>
            <Text style={styles.dateText}>
              Analyzed on {formatDate(image.createdAt)}
            </Text>
            {image.summary && (
              <Text style={styles.summaryText}>{image.summary}</Text>
            )}
          </Surface>

          {/* Metadata */}
          <Surface style={styles.metadataCard}>
            <Text style={styles.sectionTitle}>Analysis Details</Text>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Images Processed:</Text>
              <Text style={styles.metadataValue}>
                {image.rawMeta?.imagesCount || 1}
              </Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Status:</Text>
              <Text style={[styles.metadataValue, { color: getStatusColor(image.status) }]}>
                {image.status.charAt(0).toUpperCase() + image.status.slice(1)}
              </Text>
            </View>
          </Surface>

          {/* Findings Section */}
          {image.findings && image.findings.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detected Content</Text>
              {image.findings.map((finding, index) => (
                <FindingItem
                  key={index}
                  label={finding.label}
                  category={finding.category}
                  score={finding.score}
                />
              ))}
            </View>
          )}

          {/* Comments Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Partner Comments</Text>
            {image.comments && image.comments.length > 0 ? (
              image.comments.map((comment, index) => (
                <CommentItem
                  key={index}
                  comment={comment}
                  isOwner={false} // For now, assume all comments are from partners
                />
              ))
            ) : (
              <Surface style={styles.emptyCommentsCard}>
                <Icon name="chatbubble-outline" color={Colors.text.tertiary} size="md" />
                <Text style={styles.emptyCommentsText}>
                  No partner comments yet
                </Text>
              </Surface>
            )}
          </View>

          {/* Partner Actions (only show if this is a partner viewing) */}
          {image.status === 'explicit' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Partner Actions</Text>
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelStreakButton]}
                  onPress={handleCancelStreak}
                  disabled={cancellingStreak}
                >
                  {cancellingStreak ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <Icon name="close-circle-outline" color={Colors.white} size="sm" />
                  )}
                  <Text style={styles.actionButtonText}>
                    {cancellingStreak ? 'Cancelling...' : 'Cancel Streak'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Comment Input */}
        <Surface style={styles.commentInputContainer}>
          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a supportive comment..."
              placeholderTextColor={Colors.text.tertiary}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!commentText.trim() || submittingComment) && styles.sendButtonDisabled
              ]}
              onPress={handleAddComment}
              disabled={!commentText.trim() || submittingComment}
            >
              {submittingComment ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Icon name="send-outline" color={Colors.white} size="sm" />
              )}
            </TouchableOpacity>
          </View>
        </Surface>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 16,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  statusCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
  },
  statusHeader: {
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  dateText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  metadataCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  metadataLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  findingItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: Colors.background.secondary,
  },
  findingContent: {
    gap: 4,
  },
  findingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  findingCategory: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  scoreValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  commentItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: Colors.background.secondary,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentAuthorText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary.main,
  },
  commentDate: {
    fontSize: 10,
    color: Colors.text.tertiary,
  },
  commentText: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 18,
  },
  emptyCommentsCard: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: Colors.background.secondary,
    alignItems: 'center',
    gap: 8,
  },
  emptyCommentsText: {
    fontSize: 14,
    color: Colors.text.tertiary,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  cancelStreakButton: {
    backgroundColor: Colors.error.main,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  commentInputContainer: {
    padding: 16,
    backgroundColor: Colors.background.secondary,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.text.primary,
    backgroundColor: Colors.background.primary,
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: Colors.primary.main,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.text.tertiary,
  },
});

export default ImageDetailScreen;
