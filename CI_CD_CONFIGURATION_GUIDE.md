# CI/CD Configuration Guide

This guide covers all the configuration you need for your React Native CI/CD pipeline.

## 📱 **Android Configuration**

### 1. **Java Version Compatibility**
Your current React Native 0.80.2 setup uses:
- **Recommended Java Version**: **Java 17** (already configured in workflows)
- **Android Gradle Plugin**: 8.x (compatible with Java 17)
- **Target SDK**: 35 (latest Android 14)

### 2. **Android Keystore Setup**

#### **Generate Android Keystore** (if you don't have one):
```bash
# Navigate to android/app directory
cd android/app

# Generate keystore
keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore -alias release-key -keyalg RSA -keysize 2048 -validity 10000

# Follow prompts to set passwords and details
```

#### **Required Information**:
- **Keystore Password**: Password you set for the keystore file
- **Key Password**: Password you set for the release-key
- **Key Alias**: Usually "release-key" or your app name
- **Package Name**: `com.pureheart` (from your build.gradle)

### 3. **Update Android build.gradle**

Add release signing configuration to `android/app/build.gradle`:

```groovy
android {
    // ... existing config

    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            signingConfig signingConfigs.release  // Changed from debug
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}
```

## 🍎 **iOS Configuration**

### 1. **Required Certificates & Profiles**

#### **Distribution Certificate**:
1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Create/download **iOS Distribution Certificate**
4. Export as `.p12` file from Keychain Access

#### **Provisioning Profile**:
1. Create **App Store** provisioning profile
2. Associate with your app's bundle ID: `com.pureheart`
3. Include your distribution certificate
4. Download the `.mobileprovision` file

#### **App Store Connect API Key**:
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to **Users and Access > Keys**
3. Create new API key with **Developer** access
4. Download the `.p8` file
5. Note the **Key ID** and **Issuer ID**

### 2. **Required iOS Information**:
- **Bundle ID**: Your app's bundle identifier
- **Team ID**: Found in Apple Developer account
- **Certificate Password**: Password used when exporting .p12
- **Provisioning Profile Name**: Name of your App Store profile

## 🔐 **GitHub Secrets Configuration**

Add these secrets to your GitHub repository (`Settings > Secrets and variables > Actions`):

### **Android Secrets**
```
ANDROID_KEYSTORE_BASE64       # Base64 encoded keystore file
ANDROID_KEYSTORE_PASSWORD     # Keystore password
ANDROID_KEY_PASSWORD          # Key password  
ANDROID_KEY_ALIAS            # Key alias (usually "release-key")
ANDROID_PACKAGE_NAME         # com.pureheart
```

### **iOS Secrets**
```
IOS_DIST_SIGNING_KEY         # Base64 encoded .p12 certificate
IOS_DIST_SIGNING_KEY_PASSWORD # Certificate password
IOS_BUNDLE_ID                # Your app's bundle ID
IOS_TEAM_ID                  # Apple Developer Team ID
IOS_PROVISIONING_PROFILE_NAME # Provisioning profile name
APPSTORE_ISSUER_ID          # App Store Connect API issuer ID
APPSTORE_KEY_ID             # App Store Connect API key ID
APPSTORE_PRIVATE_KEY        # Base64 encoded .p8 API key
```

### **Google Play Console (Optional)**
```
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON # Service account JSON for Play Store uploads
```

## 🛠️ **Environment Variables (.env)**

You **don't need** to add CI/CD secrets to your `.env` file. The workflows use GitHub secrets directly.

However, you may want these for local development:

```bash
# .env (for local development only)
ANDROID_KEYSTORE_PATH=android/app/release.keystore
ANDROID_KEYSTORE_PASSWORD=your_keystore_password
ANDROID_KEY_ALIAS=release-key
ANDROID_KEY_PASSWORD=your_key_password

# iOS (if building locally)
IOS_BUNDLE_ID=com.pureheart
IOS_TEAM_ID=your_team_id
```

## 📋 **Encoding Files to Base64**

Use these commands to encode your files:

### **Android Keystore**:
```bash
base64 -i android/app/release.keystore | pbcopy
```

### **iOS Certificate**:
```bash
base64 -i YourDistributionCert.p12 | pbcopy
```

### **iOS API Key**:
```bash
base64 -i AuthKey_XXXXXXXXXX.p8 | pbcopy
```

## 🔧 **Quick Setup Script**

Run the setup script for guided configuration:
```bash
./scripts/setup-ci-cd.sh
```

## ⚠️ **Common Issues & Solutions**

### **1. "At least one of p12-filepath or p12-file-base64 must be provided"**
- **Cause**: Missing iOS distribution certificate in GitHub secrets
- **Solution**: Add `IOS_DIST_SIGNING_KEY` secret with base64 encoded .p12 file

### **2. Android signing errors**
- **Cause**: Missing keystore or incorrect passwords
- **Solution**: Verify all Android secrets are correctly set

### **3. Java version conflicts**
- **Cause**: Wrong Java version for your Android Gradle Plugin
- **Solution**: Use Java 17 (already configured in workflows)

### **4. Provisioning profile errors**
- **Cause**: Profile doesn't match bundle ID or certificate
- **Solution**: Recreate provisioning profile with correct settings

## 🚀 **Testing Your Setup**

1. **Commit your changes** to a feature branch
2. **Push to develop** to trigger TestFlight build
3. **Check GitHub Actions** for build status
4. **Verify in TestFlight** that build appears
5. **Test Play Store build** by pushing to any branch

## 📞 **Support**

If you encounter issues:
1. Check GitHub Actions logs for specific error messages
2. Verify all secrets are correctly configured
3. Ensure certificates haven't expired
4. Test locally first when possible

---

*This guide should cover all the configuration needed for your CI/CD pipeline!*
