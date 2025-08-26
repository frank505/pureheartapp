# CI/CD Pipeline for iOS TestFlight Deployment

This repository includes an automated CI/CD pipeline that deploys your React Native app to TestFlight whenever you push to the main branch or merge a pull request.

## Required GitHub Secrets

The following secrets must be configured in your GitHub repository settings (Settings > Secrets and variables > Actions):

### App Store Connect API
- `APPSTORE_ISSUER_ID` - Your App Store Connect API issuer ID
- `APPSTORE_KEY_ID` - Your App Store Connect API key ID  
- `APPSTORE_PRIVATE_KEY` - Your App Store Connect API private key (content of the .p8 file)

### Fastlane Configuration
- `FASTLANE_USER` - Your Apple Developer account email
- `FASTLANE_PASSWORD` - Your Apple Developer account app-specific password

### iOS Configuration
- `IOS_BUNDLE_ID` - Your app's bundle identifier
- `IOS_TEAM_ID` - Your Apple Developer Team ID

### Match (Certificate Management)
- `MATCH_GIT_URL` - Git repository URL for storing certificates
- `MATCH_GIT_TOKEN` - Git access token for the certificates repository
- `MATCH_PASSWORD` - Password for encrypting certificates

### Environment
- `NODE_VERSION` - Node.js version to use (e.g., "18")
- `RUBY_VERSION` - Ruby version to use (e.g., "3.2")

## Pipeline Features

✅ **Fully Automated** - No manual steps required  
✅ **Smart Triggering** - Runs on main branch pushes and merged PRs  
✅ **Manual Trigger** - Can be triggered manually via GitHub Actions  
✅ **Caching** - Caches Node modules and Pods for faster builds  
✅ **Error Handling** - Comprehensive error handling and cleanup  
✅ **Artifact Upload** - Uploads build logs on failure for debugging  

## How It Works

1. **Trigger**: Pipeline runs automatically on:
   - Push to main branch
   - Merged pull requests to main branch
   - Manual workflow dispatch

2. **Build Process**:
   - Sets up Node.js and Ruby environments
   - Installs dependencies with caching
   - Configures certificates using Match
   - Builds the iOS app using Fastlane
   - Uploads to TestFlight

3. **Security**:
   - Creates temporary keychain for certificates
   - Cleans up sensitive files after build
   - Uses secure environment variables

## Triggering Builds

### Automatic Triggers
- Push commits to the `main` branch
- Merge pull requests into the `main` branch

### Manual Trigger
1. Go to Actions tab in your GitHub repository
2. Select "iOS TestFlight Deployment" workflow
3. Click "Run workflow"
4. Choose the branch and click "Run workflow"

## Troubleshooting

### Build Failures
- Check the Actions tab for detailed logs
- Build artifacts (logs) are automatically uploaded for failed builds
- Ensure all required secrets are properly configured

### Common Issues
1. **Certificate Issues**: Verify Match configuration and credentials
2. **Missing Dependencies**: Check if all npm packages are properly listed
3. **Xcode Version**: Pipeline uses latest macOS runner with recent Xcode

### Getting Build Status
The pipeline provides clear success/failure notifications:
- ✅ Success: App deployed to TestFlight
- ❌ Failure: Check build logs for details

## Files Structure

```
.github/workflows/ios-testflight.yml  # Main CI/CD pipeline
fastlane/Fastfile                    # Fastlane configuration
fastlane/Gemfile                     # Ruby dependencies
```

## Next Steps

1. Ensure all GitHub secrets are configured
2. Push a commit to main branch or create a PR
3. Monitor the build in the Actions tab
4. Check TestFlight for your new build!

The pipeline is designed to be zero-maintenance once configured. Happy deploying! 🚀
