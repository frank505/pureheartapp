#!/bin/bash

# CI/CD Setup Verification Script
# This script helps verify that your GitHub secrets are properly configured

echo "🔍 CI/CD Setup Verification"
echo "=========================="
echo

required_secrets=(
    "APPSTORE_ISSUER_ID"
    "APPSTORE_KEY_ID" 
    "APPSTORE_PRIVATE_KEY"
    "FASTLANE_PASSWORD"
    "FASTLANE_USER"
    "IOS_BUNDLE_ID"
    "IOS_TEAM_ID"
    "MATCH_GIT_TOKEN"
    "MATCH_GIT_URL"
    "MATCH_PASSWORD"
    "NODE_VERSION"
    "RUBY_VERSION"
)

echo "Required GitHub Secrets:"
echo "----------------------"
for secret in "${required_secrets[@]}"; do
    echo "• $secret"
done

echo
echo "📋 Setup Checklist:"
echo "==================="
echo "□ All GitHub secrets configured in repository settings"
echo "□ App Store Connect API key created and configured"
echo "□ Match repository set up for certificate management"
echo "□ iOS bundle identifier matches your app"
echo "□ Apple Developer Team ID is correct"
echo "□ Fastlane user has appropriate permissions"
echo
echo "🚀 To trigger deployment:"
echo "========================"
echo "• Push to main branch"
echo "• Merge PR to main branch"  
echo "• Manually trigger via GitHub Actions"
echo
echo "📖 For detailed setup instructions, see CI_CD_README.md"
echo
echo "✅ Once configured, your app will automatically deploy to TestFlight!"
