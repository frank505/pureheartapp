import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Portal, Modal, Text, Button } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { hidePaywall } from '../store/slices/paywallSlice';
import { Colors } from '../constants';
import Icon from './Icon';
import { navigationRef } from '../navigation/RootNavigation';
import Purchases from 'react-native-purchases';

// Optional offering override via env (if added later)
let DEFAULT_OFFERING: string | undefined;
try {
  // @ts-ignore
  const env = require('@env');
  DEFAULT_OFFERING = env.REVENUECAT_DEFAULT_OFFERING_ID;
} catch {}

const PaywallModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const paywall = useAppSelector(state => state.paywall);
  const subscription = useAppSelector(state => state.subscription);
  const [presenting, setPresenting] = useState(false);
  const presentedRef = useRef(false);

  const onClose = useCallback(() => {
    dispatch(hidePaywall());
    // Automatically return to previous screen if possible
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  }, [dispatch]);

  const goToSubscription = () => {
    dispatch(hidePaywall());
    if (navigationRef.isReady()) {
      navigationRef.navigate('Subscription' as any);
    }
  };

  // When paywall becomes visible, immediately present hosted RevenueCat paywall
  useEffect(() => {
    const present = async () => {
      if (!paywall.visible) return;
      if (presentedRef.current) return; // prevent double
      presentedRef.current = true;
      setPresenting(true);
      try {
        // Check if presentPaywall exists (newer SDKs) else fallback
        const anyPurchases: any = Purchases as any;
        if (typeof anyPurchases.presentPaywall === 'function') {
          let offeringId = DEFAULT_OFFERING;
          if (!offeringId) {
            const offerings = await Purchases.getOfferings();
            offeringId = offerings.current?.identifier;
          }
          const result = await anyPurchases.presentPaywall(offeringId);
          if (result?.customerInfo?.entitlements?.active) {
            onClose();
            return;
          }
        } else {
          // Fallback: navigate user directly to Subscription UI
            if (navigationRef.isReady()) {
              navigationRef.navigate('Subscription' as any);
            }
        }
      } catch (e) {
        console.warn('[Paywall] Hosted paywall attempt failed, showing fallback UI', e);
      } finally {
        setPresenting(false);
      }
    };
    present();
  }, [paywall.visible, onClose]);

  if (!paywall.visible) return null;

  const trialInfo = paywall.trialEnded ? 'Your free trial has ended.' : (paywall.trialEndsAt ? `Trial ends at ${new Date(paywall.trialEndsAt).toLocaleDateString()}` : undefined);

  // Fallback UI (only shown if hosted paywall fails / still presenting)
  return (
    <Portal>
      <Modal visible={paywall.visible} onDismiss={onClose} contentContainerStyle={styles.container} dismissable={false}>
        <View style={styles.header}>
          <Icon name="diamond-outline" size="xl" color={Colors.primary.main} />
          <Text style={styles.title}>Premium Required</Text>
          {paywall.feature && <Text style={styles.subtitle}>Unlock access to {paywall.feature}</Text>}
        </View>
        {trialInfo && <Text style={styles.trialInfo}>{trialInfo}</Text>}
        {presenting && (
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <ActivityIndicator color={Colors.primary.main} />
            <Text style={styles.loadingText}>Loading paywall...</Text>
          </View>
        )}
        {!presenting && (
          <>
            {subscription.isActive && <Text style={styles.alreadyActive}>You already have an active subscription. Try refreshing.</Text>}
            <View style={styles.actions}>
              <Button mode="contained" onPress={goToSubscription} style={styles.cta}>
                {subscription.isActive ? 'Manage Subscription' : 'View Plans'}
              </Button>
              <Button mode="text" onPress={onClose} textColor={Colors.text.secondary}>Cancel</Button>
            </View>
          </>
        )}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.secondary,
    margin: 16,
    borderRadius: 20,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 6
  },
  trialInfo: {
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 12
  },
  alreadyActive: {
    fontSize: 12,
    color: Colors.primary.main,
    textAlign: 'center',
    marginBottom: 12
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.text.secondary,
  },
  actions: {
    marginTop: 8
  },
  cta: {
    marginBottom: 8,
  }
});

export default PaywallModal;
