module.exports = {
  project: {
    ios: {
      automaticPodsInstallation: false, // Disable automatic pod install
    },
    android: {},
  },
  assets: [
    './assets/fonts/',
    './node_modules/react-native-vector-icons/Fonts/',
  ],
  dependencies: {
    // Disable autolinking for iOS
    'react-native-vector-icons': {
      platforms: {
        ios: null,
      },
    },
  },
};