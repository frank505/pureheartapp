# PureHeart CI/CD Pipeline

Automated deployment pipelines for React Native app to iOS TestFlight, App Store, and Android Play Store.

## 🚀 Workflows Overview

### iOS Workflows

1. **TestFlight Deployment** (`ios-testflight.yml`)
   - **Triggers**: Push to `develop`/`staging` branches or manual trigger
   - **Purpose**: Deploy builds to TestFlight for internal testing
   - **Artifacts**: IPA file, build logs

2. **App Store Review** (`ios-appstore.yml`)
   - **Triggers**: Push to `main` branch, version tags, or manual trigger
   - **Purpose**: Submit builds to App Store for review
   - **Features**: Version management, GitHub releases, review submission

### Android Workflow

3. **Android Release** (`android-release.yml`)
   - **Triggers**: Push to any main branch or manual trigger
   - **Purpose**: Build signed APK/AAB and optionally deploy to Play Store
   - **Artifacts**: APK and AAB files

## 🔧 Required GitHub Secrets

### iOS Secrets
```
IOS_DIST_SIGNING_KEY              # Base64 encoded distribution certificate (.p12)
IOS_DIST_SIGNING_KEY_PASSWORD     # Password for distribution certificate
IOS_BUNDLE_ID                     # App bundle identifier
IOS_TEAM_ID                       # Apple Developer Team ID
IOS_PROVISIONING_PROFILE_NAME     # Name of App Store provisioning profile
APPSTORE_ISSUER_ID               # App Store Connect API issuer ID
APPSTORE_KEY_ID                  # App Store Connect API key ID
APPSTORE_PRIVATE_KEY             # Base64 encoded App Store Connect API private key
```

### Android Secrets
```
ANDROID_KEYSTORE_BASE64          # Base64 encoded Android keystore file
ANDROID_KEYSTORE_PASSWORD        # Keystore password
ANDROID_KEY_PASSWORD             # Key password
ANDROID_KEY_ALIAS                # Key alias
ANDROID_PACKAGE_NAME             # Android package name
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON # Google Play Console service account JSON
```

### Optional
```
### **Optional**
```
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON # Service account JSON for Play Store uploads
```
```

## 📋 Setup Instructions

### Quick Setup
Run the automated setup script:
```bash
./scripts/setup-ci-cd.sh
```

### Manual Setup
See [CI_CD_SETUP_GUIDE.md](./CI_CD_SETUP_GUIDE.md) for detailed instructions.

## 🎯 **Branching Strategy & Deployment Flow:**

### **iOS Deployment Strategy**
- **`develop/staging`** → TestFlight (internal testing)
- **`main/master`** → TestFlight (production-ready testing)  
- **`production`** → App Store Connect (for App Store review)

### **Android Deployment Strategy**
- **`develop/staging`** → Build production-level APK/AAB (artifacts only)
- **`main/master`** → Build production-level APK/AAB (artifacts only)
- **`production`** → Build + Deploy to Google Play Store (internal track)

### **Key Benefits**
- ✅ **Safe Testing**: Main/master builds go to TestFlight for final validation
- ✅ **Production Control**: Only `production` branch triggers store submissions
- ✅ **Artifact Generation**: All branches create production-ready builds
- ✅ **Environment Isolation**: Clear separation between testing and production

## 📊 Monitoring & Notifications

- **GitHub Actions**: Check the Actions tab for build status and logs
- **App Store Connect**: Monitor upload and review status
- **Google Play Console**: Check Android app status

## 🔍 Troubleshooting

### Common Issues

1. **Code Signing Errors (iOS)**
   - Verify distribution certificate is valid
   - Check provisioning profile matches bundle ID
   - Ensure team ID is correct

2. **Build Failures**
   - Check dependency versions
   - Verify Node.js/React Native compatibility
   - Review build logs in GitHub Actions

3. **Upload Failures**
   - Verify API credentials
   - Check app configuration in stores
   - Ensure version numbers are incremented

### Debug Steps

1. Check build logs in GitHub Actions
2. Verify all secrets are correctly configured
3. Test builds locally first
4. Ensure certificates haven't expired

## 🔐 Security Best Practices

- ✅ All sensitive data stored as GitHub secrets
- ✅ Certificates and keys are base64 encoded
- ✅ Temporary files cleaned up after builds
- ✅ No sensitive data in logs or artifacts
- ✅ Regular rotation of API keys recommended

## 📁 File Structure

```
.github/
  workflows/
    ├── ios-testflight.yml      # TestFlight deployment
    ├── ios-appstore.yml        # App Store review submission
    └── android-release.yml     # Android release build

scripts/
  └── setup-ci-cd.sh           # Automated setup script

CI_CD_SETUP_GUIDE.md           # Detailed setup guide
README.md                      # This file
```

## 🌟 Features

- ✅ Automated version and build number management
- ✅ Code signing and provisioning profile handling
- ✅ Multi-environment support (staging/production)
- ✅ Slack notifications
- ✅ Artifact storage
- ✅ GitHub releases creation
- ✅ Error handling and cleanup
- ✅ Support for manual triggers
- ✅ Cross-platform (iOS and Android)

## 🔄 Workflow States

### iOS TestFlight
- **develop/staging** → TestFlight (internal testing)
- **main/master** → TestFlight (production-ready testing)
- **Manual trigger** → TestFlight with environment selection

### iOS App Store
- **production branch** → App Store Connect (ready for review)
- **version tags** → App Store Connect + GitHub release
- **Manual trigger** → App Store Connect with custom version/notes

### Android
- **develop/staging/main/master** → Build production APK/AAB (artifacts only)
- **production** → Build + Deploy to Google Play Console (internal track)
- **Manual trigger** → Build with optional Play Store deployment

## 🎯 Usage Examples

### Deploy to TestFlight (iOS)
```bash
# Development testing
git push origin develop

# Production-ready testing  
git push origin main

# Manual trigger
# Go to Actions tab > iOS TestFlight Deployment > Run workflow
```

### Submit to App Store (iOS)
```bash
# Production deployment
git push origin production

# Version release
git tag v1.0.0
git push origin v1.0.0

# Manual trigger
# Go to Actions tab > iOS App Store Review > Run workflow
```

### Build/Deploy Android
```bash
# Build only (any branch)
git push origin main

# Build + Deploy to Play Store
git push origin production

# Manual trigger
# Go to Actions tab > Android Release Build > Run workflow
```

## 📈 Version Management

- **Build Number**: Automatically incremented using `github.run_number`
- **Version Name**: Extracted from `package.json` or provided manually
- **Git Tags**: Automatically create GitHub releases for version tags

## 🚨 Important Notes

1. **First-time setup** requires manual configuration of App Store Connect and Google Play Console
2. **Certificates** must be renewed before expiration
3. **API keys** should be rotated regularly for security
4. **Test locally** before relying on CI/CD for production releases
5. **Monitor quotas** for GitHub Actions minutes and storage

## 📞 Support

For issues with the CI/CD pipeline:
1. Check GitHub Actions logs
2. Verify secrets configuration
3. Review setup guide
4. Test build process locally
5. Contact team lead if issues persist

---

*Happy deploying! 🚀*
