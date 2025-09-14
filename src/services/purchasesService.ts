import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBundleId } from 'react-native-device-info';
// IMPORTANT: react-native-dotenv only transforms ES module import syntax.
// Using require('@env') returns an empty object at runtime, causing blank keys.
// Always use: import { VAR } from '@env';
import { REVENUECAT_API_KEY_IOS, REVENUECAT_API_KEY_ANDROID, REVENUECAT_DEBUG_LOGS, REVENUECAT_DEBUG_EXPOSE_KEY } from '@env';

const API_KEY_IOS = REVENUECAT_API_KEY_IOS || '';
const API_KEY_ANDROID = REVENUECAT_API_KEY_ANDROID || '';
const DEBUG_FLAG = REVENUECAT_DEBUG_LOGS;
const EXPOSE_FLAG = REVENUECAT_DEBUG_EXPOSE_KEY;

export const ENTITLEMENT_ID = 'premium';

// Internal state
let configuredUserId: string | null = null;
let debug = __DEV__ || DEBUG_FLAG === 'true';
let expose = EXPOSE_FLAG === 'true';

// Utility functions
export const enableDebugLogs = () => { debug = true; };
export const disableDebugLogs = () => { debug = false; };
export const enableExposeKey = () => { expose = true; };

const mask = (key: string) => {
  if (!key) return 'EMPTY';
  if (key.length <= 6) return key;
  return key.slice(0, 4) + '***' + key.slice(-3);
};

export const getApiKeyInfo = () => {
  const platform = Platform.OS;
  const key = Platform.select({ ios: API_KEY_IOS, android: API_KEY_ANDROID, default: API_KEY_ANDROID }) || '';
  return {
    platform,
    configuredUserId,
    raw: expose ? key : undefined,
    masked: mask(key),
    length: key.length,
    empty: !key,
    debug,
  };
};

const handleCustomerInfoUpdate = async (info: any) => {
  try {
    const active = info?.entitlements?.active?.[ENTITLEMENT_ID];
    const entitlement = active ? {
      isActive: true,
      expiresDate: active.expirationDate,
      willRenew: !!active.willRenew,
      productIdentifier: active.productIdentifier,
      latestPurchaseDate: active.latestPurchaseDate,
    } : { isActive: false };
    await AsyncStorage.setItem('subscription_entitlement', JSON.stringify(entitlement));
  } catch (e) {
    console.warn('[PurchasesService] Failed to cache entitlement', e);
  }
};

export const configure = async (userId: string) => {
  if (configuredUserId == userId) {
    if (debug) console.log('[PurchasesService] configure skipped (already configured for user)', userId);
    return;
  }
  const platform = Platform.OS;
  const apiKey = Platform.select({ ios: API_KEY_IOS, android: API_KEY_ANDROID, default: API_KEY_ANDROID });
  
  if (!apiKey) {
    const error = `CRITICAL: Missing RevenueCat API Key for platform ${platform}`;
    throw new Error(error);
  }
  
  if (debug) {
    console.log('[PurchasesService] Configuring', { platform, userId, apiKeyMasked: mask(apiKey) });
  }
  
  try {
    if (debug && (Purchases as any).setLogLevel) {
      try {
        (Purchases as any).setLogLevel((Purchases as any).LOG_LEVEL?.DEBUG || 'DEBUG');
      } catch {}
    }
  
    await Purchases.configure({ apiKey, appUserID: userId });
    
    console.log('[PurchasesService] Successfully configured RevenueCat');
    configuredUserId = userId;
    Purchases.addCustomerInfoUpdateListener(handleCustomerInfoUpdate);
    
    // CRITICAL: Add app bundle diagnostics to check project mismatch
    try {
      console.log('[PurchasesService] === POST-CONFIGURATION DIAGNOSTICS ===');
      
      // Get app bundle ID to verify project match
      const bundleId = await getBundleId();
      console.log('[PurchasesService] App Bundle ID:', bundleId);
      console.log('[PurchasesService] Expected Bundle ID: com.100klabs.pureheart');
      
      if (bundleId !== 'com.100klabs.pureheart') {
        console.warn('[PurchasesService] ⚠️  Bundle ID mismatch detected!');
      }
      
      // Get app info to verify customer setup
      const customerInfo = await Purchases.getCustomerInfo();
      console.log('[PurchasesService] Customer Info Retrieved:', {
        originalAppUserId: customerInfo.originalAppUserId,
        firstSeen: customerInfo.firstSeen,
        originalApplicationVersion: customerInfo.originalApplicationVersion,
        managementURL: customerInfo.managementURL
      });
      
      // Test immediate offerings fetch
      console.log('[PurchasesService] Testing immediate offerings fetch...');
      const offerings = await Purchases.getOfferings();
      console.log('[PurchasesService] Immediate offerings result:', summarizeOfferings(offerings));
      
      if (!offerings) {
        console.error('[PurchasesService] ❌ OFFERINGS NULL - Possible causes:');
        console.error('1. App Bundle ID mismatch with RevenueCat project');
        console.error(`   Current: ${bundleId}, Expected: com.100klabs.pureheart`);
        console.error('2. API Key belongs to different project');
        console.error('3. Network/connectivity issues');
        console.error('4. RevenueCat service temporarily down');
        console.error('5. No offerings configured in RevenueCat dashboard');
      } else if (!offerings.current) {
        console.error('[PurchasesService] ❌ NO CURRENT OFFERING - Set one as "Current" in RevenueCat dashboard');
        console.error('Available offerings:', Object.keys(offerings));
      } else {
        console.log('[PurchasesService] ✅ Offerings configured correctly');
      }
    } catch (e) {
      console.error('[PurchasesService] ❌ Post-config diagnostics failed:', e);
    }
  } catch (e) {
    throw e; // Re-throw to let caller handle the error
  }
};

export const getCachedEntitlement = async () => {
  try {
    const raw = await AsyncStorage.getItem('subscription_entitlement');
    return raw ? JSON.parse(raw) : { isActive: false };
  } catch {
    return { isActive: false };
  }
};

export const getOfferings = async () => {
   return Purchases.getOfferings();
};

export const purchasePackage = async (pkg: any) => {
  return Purchases.purchasePackage(pkg);
};

export const restore = async () => {
  return Purchases.restorePurchases();
};

export const logout = async () => {
  try {
    await Purchases.logOut();
  } catch {}
  configuredUserId = null;
};

const summarizeOfferings = (offerings: any) => {
  if (!offerings) return 'offerings=null';
  const current = offerings.current;
  if (!current) return { current: null, all: Object.keys(offerings || {}) };
  return {
    currentId: current.identifier,
    packageCount: current.availablePackages?.length || 0,
    packages: current.availablePackages?.map((p: any) => ({
      id: p.identifier,
      type: p.packageType,
      productId: p.product?.identifier,
      price: p.product?.priceString,
    }))
  };
};

// Legacy class-based default export for backward compatibility
// Users should prefer importing individual functions like: import { configure, getOfferings } from './purchasesService'
export default {
  configure,
  getOfferings,
  purchasePackage,
  restore,
  logout,
  getCachedEntitlement,
  getApiKeyInfo,
  enableDebugLogs,
  disableDebugLogs,
  enableExposeKey,
};
