/**
 * Active Commitment Dashboard Screen
 * 
 * View active commitment and report relapse.
 * Main dashboard for managing an active commitment.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Alert,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Text, Surface, Button, Portal, Modal, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import { ScreenHeader, Icon } from '../../components';
import { Colors } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchActiveCommitment, reportRelapse } from '../../store/slices/commitmentsSlice';

type Props = NativeStackScreenProps<any, 'ActiveCommitmentDashboard'>;

const ActiveCommitmentDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { activeCommitment, loading } = useAppSelector((state) => state.commitments);
  const user = useAppSelector((state) => state.user);
  const partners = useAppSelector((state) => state.invitation.connectedPartners);

  const [relapseModalVisible, setRelapseModalVisible] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    React.useCallback(() => {
      // Fetch active commitment when screen comes into focus
      if (user.currentUser?.id) {
        dispatch(fetchActiveCommitment(user.currentUser.id));
      }
    }, [dispatch, user.currentUser?.id])
  );

  useEffect(() => {
    // Pulse animation for relapse button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const getDaysRemaining = (): number => {
    if (!activeCommitment) return 0;
    const now = new Date();
    const target = new Date(activeCommitment.targetDate);
    const diff = target.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getProgress = (): number => {
    if (!activeCommitment) return 0;
    const created = new Date(activeCommitment.createdAt);
    const target = new Date(activeCommitment.targetDate);
    const now = new Date();
    
    const total = target.getTime() - created.getTime();
    const elapsed = now.getTime() - created.getTime();
    
    return Math.min(1, Math.max(0, elapsed / total));
  };

  const partner = partners.find(p => p.partner && p.partner.id === activeCommitment?.partnerId);

  const handleRelapsePress = () => {
    setRelapseModalVisible(true);
  };

  const handleHoldStart = () => {
    setIsHolding(true);
    setHoldProgress(0);
    
    let progress = 0;
    holdTimerRef.current = setInterval(() => {
      progress += 0.033; // 3 seconds = ~30 ticks
      setHoldProgress(progress);
      
      if (progress >= 1) {
        handleConfirmRelapse();
      }
    }, 100);
  };

  const handleHoldEnd = () => {
    setIsHolding(false);
    setHoldProgress(0);
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const handleConfirmRelapse = async () => {
    handleHoldEnd();
    setRelapseModalVisible(false);

    if (!activeCommitment) return;

    try {
      await dispatch(
        reportRelapse({
          commitmentId: activeCommitment.id,
          payload: {
            relapseDate: new Date().toISOString(),
          },
        })
      ).unwrap();

      // Navigate to action pending screen
      navigation.navigate('ActionPending');
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to report relapse');
    }
  };

  if (loading.commitments) {
    return (
      <ImageBackground
        source={require('../../../assets/images/appbackgroundimage.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.container} edges={['top']}>
          <ScreenHeader
            title="My Commitment"
            navigation={navigation}
            showBackButton={false}
          />
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (!activeCommitment) {
    return (
      <ImageBackground
        source={require('../../../assets/images/appbackgroundimage.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.container} edges={['top']}>
          <ScreenHeader
            title="My Commitment"
            navigation={navigation}
            showBackButton={false}
          />
          <View style={styles.emptyContainer}>
            <Icon name="shield-checkmark-outline" size={80} color={Colors.text.secondary} />
            <Text style={styles.emptyTitle}>No Active Commitment</Text>
            <Text style={styles.emptyText}>
              Create a commitment to hold yourself accountable
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('ChooseCommitmentType')}
              style={styles.createButton}
            >
              Create Commitment
            </Button>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../../assets/images/appbackgroundimage.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader
          title="My Commitment"
          navigation={navigation}
          showBackButton={false}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Card */}
          <Surface style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Icon name="flag" size={24} color={Colors.primary.main} />
              <Text style={styles.progressTitle}>Target Progress</Text>
            </View>
            
            <View style={styles.progressContent}>
              <Text style={styles.daysRemaining}>{getDaysRemaining()}</Text>
              <Text style={styles.daysLabel}>Days Remaining</Text>
            </View>

            <ProgressBar
              progress={getProgress()}
              color={Colors.primary.main}
              style={styles.progressBar}
            />

            <Text style={styles.targetDate}>
              Target: {new Date(activeCommitment.targetDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </Surface>

          {/* Action Details Card */}
          <Surface style={styles.actionCard}>
            <View style={styles.actionHeader}>
              <Icon name="heart" size={24} color="#ef4444" />
              <Text style={styles.actionTitle}>If You Relapse</Text>
            </View>
            
            <Text style={styles.actionName}>{activeCommitment.action?.title}</Text>
            <Text style={styles.actionDescription}>
              {activeCommitment.action?.description}
            </Text>

            <View style={styles.actionMeta}>
              <View style={styles.metaItem}>
                <Icon name="time-outline" size={16} color={Colors.text.secondary} />
                <Text style={styles.metaText}>
                  {activeCommitment.action?.estimatedHours}h required
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="alarm-outline" size={16} color={Colors.text.secondary} />
                <Text style={styles.metaText}>48h deadline</Text>
              </View>
            </View>

            <Button
              mode="outlined"
              onPress={() => navigation.navigate('ActionDetails')}
              style={styles.viewDetailsButton}
            >
              View Action Details
            </Button>
          </Surface>

          {/* Partner Card */}
          {partner && (
            <Surface style={styles.partnerCard}>
              <View style={styles.partnerHeader}>
                <Icon name="people" size={24} color={Colors.primary.main} />
                <Text style={styles.partnerTitle}>Accountability Partner</Text>
              </View>
              
              <View style={styles.partnerInfo}>
                <View style={styles.partnerAvatar}>
                  <Icon name="person" size={32} color={Colors.white} />
                </View>
                <View style={styles.partnerDetails}>
                  <Text style={styles.partnerName}>
                    {partner.partner?.username || 'Partner'}
                  </Text>
                  <Text style={styles.partnerRole}>
                    {activeCommitment.requirePartnerVerification
                      ? 'Will verify proof'
                      : 'Supporting you'}
                  </Text>
                </View>
              </View>
            </Surface>
          )}

          {/* Relapse Button */}
          <Animated.View
            style={[
              styles.relapseButtonContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.relapseButton}
              onPress={handleRelapsePress}
              activeOpacity={0.8}
            >
              <Icon name="refresh" size={32} color={Colors.white} />
              <Text style={styles.relapseButtonText}>I Relapsed</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Tips Section */}
          <Surface style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Icon name="bulb" size={24} color="#f59e0b" />
              <Text style={styles.tipsTitle}>Stay Strong</Text>
            </View>
            <Text style={styles.tipsText}>
              • Take it one day at a time{'\n'}
              • Reach out to your partner when tempted{'\n'}
              • Remember why you started this journey{'\n'}
              • Celebrate small victories
            </Text>
          </Surface>
        </ScrollView>

        {/* Relapse Confirmation Modal */}
        <Portal>
          <Modal
            visible={relapseModalVisible}
            onDismiss={() => {
              setRelapseModalVisible(false);
              handleHoldEnd();
            }}
            contentContainerStyle={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Icon name="alert-circle" size={48} color="#ef4444" />
              <Text style={styles.modalTitle}>Report Relapse?</Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                If you report a relapse, you'll need to:
              </Text>
              <View style={styles.consequencesList}>
                <View style={styles.consequenceItem}>
                  <Icon name="checkmark" size={20} color="#ef4444" />
                  <Text style={styles.consequenceText}>
                    Complete: {activeCommitment.action?.title}
                  </Text>
                </View>
                <View style={styles.consequenceItem}>
                  <Icon name="checkmark" size={20} color="#ef4444" />
                  <Text style={styles.consequenceText}>
                    Upload photo proof within 48 hours
                  </Text>
                </View>
                <View style={styles.consequenceItem}>
                  <Icon name="checkmark" size={20} color="#ef4444" />
                  <Text style={styles.consequenceText}>
                    Get verification from your partner
                  </Text>
                </View>
              </View>

              <View style={styles.warningBox}>
                <Icon name="warning" size={20} color="#f59e0b" />
                <Text style={styles.warningText}>
                  This action cannot be undone
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setRelapseModalVisible(false);
                  handleHoldEnd();
                }}
                style={styles.cancelButton}
                contentStyle={styles.modalButtonContent}
              >
                Cancel
              </Button>
              
              <TouchableOpacity
                onPressIn={handleHoldStart}
                onPressOut={handleHoldEnd}
                style={[
                  styles.confirmRelapseButton,
                  isHolding && styles.confirmRelapseButtonHolding,
                ]}
                activeOpacity={0.9}
              >
                <View style={styles.confirmButtonContent}>
                  {isHolding && (
                    <View style={styles.holdProgressBar}>
                      <View
                        style={[
                          styles.holdProgressFill,
                          { width: `${holdProgress * 100}%` },
                        ]}
                      />
                    </View>
                  )}
                  <Text style={styles.confirmRelapseButtonText}>
                    {isHolding ? 'Hold...' : 'Yes, I Relapsed'}
                  </Text>
                  <Text style={styles.confirmRelapseButtonSubtext}>
                    Hold for 3 seconds
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </Modal>
        </Portal>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    borderRadius: 12,
  },
  progressCard: {
    borderRadius: 20,
    padding: 24,
    backgroundColor: Colors.background.secondary,
    marginBottom: 16,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  progressContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  daysRemaining: {
    fontSize: 64,
    fontWeight: '700',
    color: Colors.primary.main,
  },
  daysLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  targetDate: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  actionCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: Colors.background.secondary,
    marginBottom: 16,
    elevation: 2,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  actionName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  actionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  viewDetailsButton: {
    borderRadius: 12,
  },
  partnerCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: Colors.background.secondary,
    marginBottom: 16,
    elevation: 2,
  },
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  partnerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  partnerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerDetails: {
    flex: 1,
  },
  partnerName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  partnerRole: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  relapseButtonContainer: {
    marginBottom: 16,
  },
  relapseButton: {
    backgroundColor: '#ef4444',
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    elevation: 4,
  },
  relapseButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  tipsCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#fffbeb',
    elevation: 1,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f59e0b',
  },
  tipsText: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  modalContent: {
    backgroundColor: Colors.background.secondary,
    margin: 20,
    borderRadius: 20,
    padding: 24,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: 16,
  },
  modalBody: {
    marginBottom: 24,
  },
  modalText: {
    fontSize: 15,
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 22,
  },
  consequencesList: {
    gap: 12,
    marginBottom: 20,
  },
  consequenceItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  consequenceText: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fffbeb',
    padding: 16,
    borderRadius: 12,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
  },
  confirmRelapseButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmRelapseButtonHolding: {
    backgroundColor: '#dc2626',
  },
  confirmButtonContent: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  holdProgressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'transparent',
  },
  holdProgressFill: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  confirmRelapseButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 2,
  },
  confirmRelapseButtonSubtext: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  modalButtonContent: {
    paddingVertical: 8,
  },
});

export default ActiveCommitmentDashboardScreen;
