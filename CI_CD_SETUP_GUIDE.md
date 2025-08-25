# iOS CI/CD Pipeline Setup Guide

This guide will help you set up automated CI/CD pipelines for your React Native app to deploy to TestFlight and submit to the App Store for review.

## Prerequisites

1. **Apple Developer Account** with App Store Connect access
2. **GitHub repository** with admin access
3. **Xcode project** properly configured
4. **App Store Connect app** created

## Required GitHub Secrets

You need to configure the following secrets in your GitHub repository (`Settings > Secrets and variables > Actions`):

### iOS Code Signing
- `IOS_DIST_SIGNING_KEY`: Base64 encoded distribution certificate (.p12 file)
- `IOS_DIST_SIGNING_KEY_PASSWORD`: Password for the distribution certificate
- `IOS_PROVISIONING_PROFILE_NAME`: Name of your App Store provisioning profile
- `IOS_BUNDLE_ID`: Your app's bundle identifier (e.g., com.yourcompany.pureheart)
- `IOS_TEAM_ID`: Your Apple Developer Team ID

### App Store Connect API
- `APPSTORE_ISSUER_ID`: App Store Connect API issuer ID
- `APPSTORE_KEY_ID`: App Store Connect API key ID
- `APPSTORE_PRIVATE_KEY`: App Store Connect API private key (base64 encoded)

### Optional Notifications
- `SLACK_WEBHOOK_URL`: Slack webhook URL for notifications (optional)

## Step-by-Step Setup

### 1. Generate App Store Connect API Key

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to Users and Access > Keys
3. Click the "+" button to create a new key
4. Give it a name (e.g., "GitHub Actions")
5. Select "Developer" access
6. Download the private key file (.p8)
7. Note the Key ID and Issuer ID

### 2. Export Distribution Certificate

1. Open Keychain Access on macOS
2. Find your "iPhone Distribution" certificate
3. Right-click and select "Export..."
4. Choose "Personal Information Exchange (.p12)"
5. Set a password and export

### 3. Create Provisioning Profile

1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Navigate to Certificates, Identifiers & Profiles
3. Create a new provisioning profile for "App Store"
4. Select your app ID and distribution certificate
5. Download the provisioning profile

### 4. Encode Files to Base64

Run these commands in your terminal:

```bash
# Encode distribution certificate
base64 -i YourDistributionCert.p12 | pbcopy

# Encode App Store Connect private key
base64 -i AuthKey_XXXXXXXXXX.p8 | pbcopy

# Encode provisioning profile (if needed)
base64 -i YourApp_AppStore.mobileprovision | pbcopy
```

### 5. Configure GitHub Secrets

Add all the encoded values and IDs as secrets in your GitHub repository.

### 6. Verify iOS Project Configuration

Make sure your iOS project has:
- Correct bundle identifier
- Valid provisioning profile
- Distribution certificate configured
- Info.plist with correct app information

## Workflow Triggers

### TestFlight Deployment (`ios-testflight.yml`)
- **Automatic**: Pushes to `develop` or `staging` branches
- **Manual**: Via GitHub Actions UI with environment selection

### App Store Review (`ios-appstore.yml`)
- **Automatic**: Pushes to `main` branch or version tags (`v*`)
- **Manual**: Via GitHub Actions UI with version and release notes

## Usage

### For TestFlight Deployment
1. Push code to `develop` or `staging` branch
2. Or manually trigger via GitHub Actions with environment selection
3. The app will be built and uploaded to TestFlight automatically

### For App Store Review
1. Create a version tag: `git tag v1.0.0 && git push origin v1.0.0`
2. Or push to `main` branch
3. Or manually trigger with version and release notes
4. The app will be built, uploaded, and prepared for review

## Monitoring

- Check GitHub Actions tab for build status
- Monitor Slack notifications (if configured)
- Check App Store Connect for upload status
- Review build logs in case of failures

## Troubleshooting

### Common Issues

1. **Code signing errors**: Verify certificates and provisioning profiles
2. **Build failures**: Check Xcode project configuration
3. **Upload failures**: Verify App Store Connect API credentials
4. **Permission errors**: Ensure GitHub secrets are properly configured

### Debug Tips

1. Check the build logs in GitHub Actions
2. Verify all secrets are correctly set
3. Test builds locally with the same configuration
4. Ensure all dependencies are properly installed

## Security Notes

- Never commit certificates or private keys to your repository
- Regularly rotate your App Store Connect API keys
- Use environment-specific configurations
- Monitor access to your GitHub repository and secrets

## Next Steps

1. Test the pipelines with a simple commit
2. Configure additional environments if needed
3. Set up proper branching strategy
4. Configure notifications and monitoring
5. Document your deployment process for your team

## Support

If you encounter issues:
1. Check the GitHub Actions logs
2. Verify your App Store Connect settings
3. Ensure all certificates are valid and not expired
4. Test the build process locally first
