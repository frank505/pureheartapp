import React, { useState, useLayoutEffect, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Surface,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { Colors, Icons } from '../constants';
import { configure, getOfferings, purchasePackage, restore, ENTITLEMENT_ID } from '../services/purchasesService';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { refreshSubscription } from '../store/slices/subscriptionSlice';
import LinearGradient from 'react-native-linear-gradient';

interface SubscriptionScreenProps {
  navigation?: any;
  route?: any;
}

const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const subscription = useAppSelector(state => state.subscription);
  const user = useAppSelector(state => state.user.currentUser);
  const dispatch = useAppDispatch();

  useLayoutEffect(() => {
    navigation?.setOptions?.({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    loadOfferings();
  }, [user?.id]);

  const handleGoBack = () => {
    navigation?.goBack();
  };

  const loadOfferings = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      await configure(user.id.toString());
      const offerings = await getOfferings();

      if (!offerings) {
        setError('Failed to load offerings');
        return;
      }
      // Correct aggregation: RevenueCat returns { current: Offering | null, all: { [id]: Offering } }
      const allOfferingMap = (offerings as any).all || {};
      const offeringList: any[] = Object.values(allOfferingMap);

      // Aggregate all packages from every offering (including current if not already included)
      const aggregatedPackages: any[] = [];
      offeringList.forEach((off: any) => {
        if (off?.availablePackages?.length) {
          off.availablePackages.forEach((pkg: any) => {
            if (!aggregatedPackages.find(existing => existing.identifier === pkg.identifier)) {
              aggregatedPackages.push(pkg);
            }
          });
        }
      });

      // If still empty, fallback to current offering packages
      const finalPackages = aggregatedPackages.length
        ? aggregatedPackages
        : offerings.current?.availablePackages || [];

      if (!finalPackages.length) {
        setError('No subscription plans available');
        return;
      }

      // Sort by desired order (extendable list)
      const order = ['WEEKLY', 'MONTHLY', 'ANNUAL', 'LIFETIME'];
      finalPackages.sort((a, b) => {
        const ia = order.indexOf(a.packageType);
        const ib = order.indexOf(b.packageType);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      });

      setPackages(finalPackages);

      // Debug for missing expected types
      const expected = ['WEEKLY', 'MONTHLY', 'ANNUAL'];
      const present = new Set(finalPackages.map(p => p.packageType));
      const missing = expected.filter(t => !present.has(t));
      if (missing.length) {
        console.log('[SubscriptionScreen] Missing package types:', missing.join(', '));
      }

      if (__DEV__) {
        try {
          console.log('[SubscriptionScreen] Offerings loaded summary', {
            offeringIds: offeringList.map((o: any) => o.identifier),
            packageCount: finalPackages.length,
            packages: finalPackages.map(p => ({
              id: p.identifier,
              type: p.packageType,
              product: p.product?.identifier,
              price: p.product?.priceString,
            }))
          });
        } catch {}
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load subscription plans');
      console.error('Load offerings error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg: any) => {
    try {
      setLoading(true);
      const { customerInfo } = await purchasePackage(pkg);
      
      if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
        dispatch(refreshSubscription());
        Alert.alert('Success', 'Premium subscription activated!');
      }
    } catch (e: any) {
      if (!e?.userCancelled) {
        Alert.alert('Purchase Failed', e?.message || 'Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      await restore();
      dispatch(refreshSubscription());
      Alert.alert('Success', 'Purchases restored successfully');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to restore purchases');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#0f172a", "#1e293b", "#334155"]}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Icon name={Icons.navigation.back.name} color={Colors.white} size="md" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium Subscription</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Status */}
        <Surface style={styles.statusCard} elevation={2}>
          <Text style={styles.statusTitle}>
            {subscription.isActive ? 'Premium Active' : 'Free Plan'}
          </Text>
          <Text style={styles.statusDescription}>
            {subscription.isActive 
              ? 'You have access to all premium features'
              : 'Upgrade to unlock all features'
            }
          </Text>
        </Surface>

        {/* Error State */}
        {error && (
          <Surface style={styles.errorCard} elevation={1}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadOfferings}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </Surface>
        )}

        {/* Loading State */}
        {loading && (
          <Surface style={styles.loadingCard} elevation={1}>
            <ActivityIndicator color={Colors.primary.main} />
            <Text style={styles.loadingText}>Loading subscription plans...</Text>
          </Surface>
        )}

        {/* Subscription Plans */}
        {!loading && packages.length > 0 && (
          <View style={styles.plansContainer}>
            <Text style={styles.sectionTitle}>Choose Your Plan</Text>
            {packages.map((pkg, index) => (
              <Surface key={pkg.identifier} style={styles.planCard} elevation={2}>
                <View style={styles.planHeader}>
                  <Text style={styles.planType}>
                    {pkg.packageType?.replace('_', ' ') || 'Premium'}
                  </Text>
                  <Text style={styles.planPrice}>
                    {pkg.product?.priceString || 'Loading...'}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={[
                    styles.purchaseButton,
                    subscription.isActive && styles.purchaseButtonDisabled
                  ]}
                  onPress={() => handlePurchase(pkg)}
                  disabled={loading || subscription.isActive}
                >
                  <Text style={styles.purchaseButtonText}>
                    {subscription.isActive ? 'Active' : 'Subscribe'}
                  </Text>
                </TouchableOpacity>
              </Surface>
            ))}
          </View>
        )}

        {/* Restore Button */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={loading}
        >
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>

        {/* Features List */}
        <Surface style={styles.featuresCard} elevation={1}>
          <Text style={styles.featuresTitle}>Premium Features</Text>
          {[
            'Unlimited access to all content',
            'AI-powered personalized support',
            'Advanced progress tracking',
            'Priority customer support',
            'Ad-free experience'
          ].map((feature, index) => (
            <View key={index} style={styles.feature}>
              <Icon name="checkmark-circle" color={Colors.primary.main} size="sm" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  errorCard: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.white,
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
  plansContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  planHeader: {
    marginBottom: 16,
  },
  planType: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary.main,
  },
  purchaseButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  restoreButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  restoreText: {
    color: Colors.text.secondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  featuresCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
});

export default SubscriptionScreen;
