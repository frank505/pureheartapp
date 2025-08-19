/**
 * Icon Constants
 * 
 * Centralized icon definitions using react-native-vector-icons.
 * This file provides consistent icon usage across the app and makes
 * it easy to change icons or icon libraries in the future.
 * 
 * Available Icon Libraries:
 * - Ionicons: Modern, clean icons (recommended for most use cases)
 * - MaterialIcons: Google Material Design icons
 * - MaterialCommunityIcons: Extended Material Design icons
 * - Feather: Minimalist, elegant icons
 * - FontAwesome: Comprehensive icon library
 * - AntDesign: Ant Design icon library
 */

/**
 * Icon Names by Category
 * 
 * Organized by purpose for easy discovery and consistent usage.
 */
export const IconNames = {
  // Navigation & UI
  navigation: {
    home: 'home',
    search: 'search',
    menu: 'menu',
    back: 'arrow-back',
    forward: 'arrow-forward',
    close: 'close',
    add: 'add',
    edit: 'create',
    delete: 'trash',
    more: 'ellipsis-horizontal',
  },

  // Tab Bar Icons
  tabs: {
    home: 'home-outline',
    emergency: 'warning-outline',
    accountability: 'people-outline',
    truth: 'book-outline',
    progress: 'analytics-outline',
    menu: 'menu-outline',
  },

  // User & Profile
  user: {
    profile: 'person',
    avatar: 'person-circle',
    edit: 'create',
    logout: 'log-out-outline',
    login: 'log-in-outline',
    signup: 'person-add-outline',
  },

  // Actions
  actions: {
    like: 'heart-outline',
    liked: 'heart',
    bookmark: 'bookmark-outline',
    bookmarked: 'bookmark',
    share: 'share-outline',
    comment: 'chatbubble-outline',
    send: 'send',
    copy: 'copy-outline',
    download: 'download-outline',
  },

  // Social
  social: {
    google: 'logo-google',
    apple: 'logo-apple',
    facebook: 'logo-facebook',
    twitter: 'logo-twitter',
    instagram: 'logo-instagram',
    linkedin: 'logo-linkedin',
  },

  // Status & Feedback
  status: {
    success: 'checkmark-circle',
    error: 'close-circle',
    warning: 'warning',
    info: 'information-circle',
    loading: 'reload',
  },

  // Media & Content
  media: {
    image: 'image-outline',
    video: 'videocam-outline',
    camera: 'camera-outline',
    gallery: 'images-outline',
    music: 'musical-notes-outline',
    file: 'document-outline',
  },

  // Communication
  communication: {
    email: 'mail-outline',
    phone: 'call-outline',
    message: 'chatbubble-outline',
    notification: 'notifications-outline',
    bell: 'notifications',
  },

  // Settings & Controls
  settings: {
    gear: 'settings',
    toggle: 'toggle',
    filter: 'filter',
    sort: 'funnel',
    refresh: 'refresh',
    sync: 'sync',
  },

  // Security
  security: {
    lock: 'lock-closed',
    unlock: 'lock-open',
    key: 'key',
    shield: 'shield-checkmark',
    eye: 'eye',
    eyeOff: 'eye-off',
  },

  // Time & Calendar
  time: {
    clock: 'time-outline',
    calendar: 'calendar-outline',
    today: 'today-outline',
    schedule: 'calendar-clear-outline',
  },

  // Location
  location: {
    pin: 'location-outline',
    map: 'map-outline',
    navigate: 'navigate-outline',
    compass: 'compass-outline',
  },

  // Emergency Screen Specific
  emergency: {
    alert: 'alert-circle-outline',
    breathe: 'spa-outline',
    speakTruth: 'book-outline',
    call: 'call-outline',
    worship: 'musical-notes-outline',
    aiCompanion: 'sparkles-outline',
    partners: 'people-outline',
  },
} as const;

/**
 * Icon Library Mappings
 * 
 * Maps semantic icon names to specific library icons.
 * This makes it easy to switch icon libraries while maintaining
 * consistent naming throughout the app.
 */
export const Icons = {
  // Primary icon library (Ionicons)
  library: 'Ionicons',

  // Tab Navigation Icons
  tabs: {
    home: { name: IconNames.tabs.home, library: 'Ionicons' },
    emergency: { name: IconNames.tabs.emergency, library: 'Ionicons' },
    accountability: { name: IconNames.tabs.accountability, library: 'Ionicons' },
    truth: { name: IconNames.tabs.truth, library: 'Ionicons' },
    progress: { name: IconNames.tabs.progress, library: 'Ionicons' },
  },

  // Action Icons
  actions: {
    like: { name: IconNames.actions.like, library: 'Ionicons' },
    liked: { name: IconNames.actions.liked, library: 'Ionicons' },
    bookmark: { name: IconNames.actions.bookmark, library: 'Ionicons' },
    bookmarked: { name: IconNames.actions.bookmarked, library: 'Ionicons' },
    share: { name: IconNames.actions.share, library: 'Ionicons' },
    comment: { name: IconNames.actions.comment, library: 'Ionicons' },
    send: { name: IconNames.actions.send, library: 'Ionicons' },
    copy: { name: IconNames.actions.copy, library: 'Ionicons' },
    download: { name: IconNames.actions.download, library: 'Ionicons' },
  },

  // Social Icons
  social: {
    google: { name: IconNames.social.google, library: 'Ionicons' },
    apple: { name: IconNames.social.apple, library: 'Ionicons' },
  },

  // Navigation Icons
  navigation: {
    search: { name: IconNames.navigation.search, library: 'Ionicons' },
    add: { name: IconNames.navigation.add, library: 'Ionicons' },
    menu: { name: IconNames.navigation.menu, library: 'Ionicons' },
    back: { name: IconNames.navigation.back, library: 'Ionicons' },
    close: { name: IconNames.navigation.close, library: 'Ionicons' },
    more: { name: IconNames.navigation.more, library: 'Ionicons' },
    delete: { name: IconNames.navigation.delete, library: 'Ionicons' },
  },

  // User Icons
  user: {
    avatar: { name: IconNames.user.avatar, library: 'Ionicons' },
    edit: { name: IconNames.user.edit, library: 'Ionicons' },
    logout: { name: IconNames.user.logout, library: 'Ionicons' },
  },

  // Status Icons
  status: {
    success: { name: IconNames.status.success, library: 'Ionicons' },
    error: { name: IconNames.status.error, library: 'Ionicons' },
    warning: { name: IconNames.status.warning, library: 'Ionicons' },
    info: { name: IconNames.status.info, library: 'Ionicons' },
  },

  // Settings Icons
  settings: {
    gear: { name: IconNames.settings.gear, library: 'Ionicons' },
    toggle: { name: IconNames.settings.toggle, library: 'Ionicons' },
    refresh: { name: IconNames.settings.refresh, library: 'Ionicons' },
  },

  // Security Icons
  security: {
    eye: { name: IconNames.security.eye, library: 'Ionicons' },
    eyeOff: { name: IconNames.security.eyeOff, library: 'Ionicons' },
    lock: { name: IconNames.security.lock, library: 'Ionicons' },
    key: { name: IconNames.security.key, library: 'Ionicons' },
  },

  // Communication Icons
  communication: {
    email: { name: IconNames.communication.email, library: 'Ionicons' },
    phone: { name: IconNames.communication.phone, library: 'Ionicons' },
    message: { name: IconNames.communication.message, library: 'Ionicons' },
    notification: { name: IconNames.communication.notification, library: 'Ionicons' },
    bell: { name: IconNames.communication.bell, library: 'Ionicons' },
  },

  // Authentication Icons
  auth: {
    email: { name: IconNames.communication.email, library: 'Ionicons' },
    lock: { name: IconNames.security.lock, library: 'Ionicons' },
    shield: { name: IconNames.security.shield, library: 'Ionicons' },
  },

  // Emergency Screen Icons
  emergency: {
    alert: { name: IconNames.emergency.alert, library: 'Ionicons' },
    breathe: { name: IconNames.emergency.breathe, library: 'Ionicons' },
    speakTruth: { name: IconNames.emergency.speakTruth, library: 'Ionicons' },
    call: { name: IconNames.emergency.call, library: 'Ionicons' },
    worship: { name: IconNames.emergency.worship, library: 'Ionicons' },
    aiCompanion: { name: IconNames.emergency.aiCompanion, library: 'Ionicons' },
    partners: { name: IconNames.emergency.partners, library: 'Ionicons' },
  },
} as const;

/**
 * Icon Sizes
 * 
 * Standardized icon sizes for consistent UI.
 */
export const IconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  xxl: 32,
  xxxl: 40,
} as const;

/**
 * Default Icon Props
 * 
 * Common icon configurations used throughout the app.
 */
export const DefaultIconProps = {
  size: IconSizes.md,
  color: '#ffffff', // Will be overridden by theme
} as const;

/**
 * Type Definitions
 */
export type IconName = keyof typeof Icons;
export type IconLibrary = 'Ionicons' | 'MaterialIcons' | 'MaterialCommunityIcons' | 'Feather' | 'FontAwesome' | 'AntDesign';
export type IconSize = keyof typeof IconSizes;

export interface IconConfig {
  name: string;
  library: IconLibrary;
  size?: number;
  color?: string;
}