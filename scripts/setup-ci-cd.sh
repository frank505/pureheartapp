#!/bin/bash

# CI/CD Setup Helper Script
# This script helps you prepare the necessary files and information for GitHub Actions

set -e

echo "🚀 PureHeart iOS CI/CD Setup Helper"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script must be run on macOS"
    exit 1
fi

# Create setup directory
SETUP_DIR="./ci-cd-setup"
mkdir -p "$SETUP_DIR"

print_status "Created setup directory: $SETUP_DIR"

# Function to encode file to base64
encode_file() {
    local file_path="$1"
    local output_name="$2"
    
    if [ -f "$file_path" ]; then
        base64 -i "$file_path" > "$SETUP_DIR/${output_name}.base64"
        print_success "Encoded $file_path to $SETUP_DIR/${output_name}.base64"
        echo "Copy this value to GitHub secret: $output_name"
        echo "----------------------------------------"
        cat "$SETUP_DIR/${output_name}.base64"
        echo ""
        echo "----------------------------------------"
    else
        print_warning "File not found: $file_path"
    fi
}

print_status "Starting CI/CD setup process..."
echo ""

# 1. Check iOS project configuration
print_status "Checking iOS project configuration..."

if [ -f "ios/PureHeart.xcworkspace" ]; then
    print_success "Found Xcode workspace"
else
    print_error "Xcode workspace not found at ios/PureHeart.xcworkspace"
fi

if [ -f "ios/PureHeart/Info.plist" ]; then
    print_success "Found Info.plist"
    
    # Extract bundle ID
    BUNDLE_ID=$(/usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" ios/PureHeart/Info.plist 2>/dev/null || echo "Not found")
    print_status "Current Bundle ID: $BUNDLE_ID"
    
    # Extract version
    VERSION=$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" ios/PureHeart/Info.plist 2>/dev/null || echo "Not found")
    print_status "Current Version: $VERSION"
else
    print_error "Info.plist not found at ios/PureHeart/Info.plist"
fi

echo ""

# 2. Check for certificates and provisioning profiles
print_status "Checking for certificates and provisioning profiles..."

# Look for distribution certificates in Keychain
DIST_CERTS=$(security find-certificate -a -c "iPhone Distribution" -p | grep -c "BEGIN CERTIFICATE" || echo "0")
print_status "Found $DIST_CERTS iPhone Distribution certificate(s) in Keychain"

# Look for provisioning profiles
PROFILES_DIR="$HOME/Library/MobileDevice/Provisioning Profiles"
if [ -d "$PROFILES_DIR" ]; then
    PROFILE_COUNT=$(ls -1 "$PROFILES_DIR"/*.mobileprovision 2>/dev/null | wc -l || echo "0")
    print_status "Found $PROFILE_COUNT provisioning profile(s)"
else
    print_warning "Provisioning profiles directory not found"
fi

echo ""

# 3. Interactive setup
print_status "Interactive setup - Please provide the following information:"
echo ""

# Get file paths from user
read -p "Path to your distribution certificate (.p12 file): " CERT_PATH
if [ -f "$CERT_PATH" ]; then
    encode_file "$CERT_PATH" "IOS_DIST_SIGNING_KEY"
else
    print_warning "Certificate file not found: $CERT_PATH"
fi

read -p "Path to your App Store Connect API private key (.p8 file): " API_KEY_PATH
if [ -f "$API_KEY_PATH" ]; then
    encode_file "$API_KEY_PATH" "APPSTORE_PRIVATE_KEY"
else
    print_warning "API key file not found: $API_KEY_PATH"
fi

read -p "Path to your provisioning profile (.mobileprovision file): " PROFILE_PATH
if [ -f "$PROFILE_PATH" ]; then
    encode_file "$PROFILE_PATH" "IOS_PROVISIONING_PROFILE"
else
    print_warning "Provisioning profile not found: $PROFILE_PATH"
fi

echo ""

# 4. Collect other required information
print_status "Please provide the following information for GitHub secrets:"
echo ""

read -p "Distribution certificate password: " -s CERT_PASSWORD
echo ""
echo "IOS_DIST_SIGNING_KEY_PASSWORD: $CERT_PASSWORD" > "$SETUP_DIR/secrets.txt"

read -p "iOS Bundle ID (e.g., com.yourcompany.pureheart): " BUNDLE_ID_INPUT
echo "IOS_BUNDLE_ID: $BUNDLE_ID_INPUT" >> "$SETUP_DIR/secrets.txt"

read -p "iOS Team ID: " TEAM_ID
echo "IOS_TEAM_ID: $TEAM_ID" >> "$SETUP_DIR/secrets.txt"

read -p "Provisioning profile name: " PROFILE_NAME
echo "IOS_PROVISIONING_PROFILE_NAME: $PROFILE_NAME" >> "$SETUP_DIR/secrets.txt"

read -p "App Store Connect Issuer ID: " ISSUER_ID
echo "APPSTORE_ISSUER_ID: $ISSUER_ID" >> "$SETUP_DIR/secrets.txt"

read -p "App Store Connect Key ID: " KEY_ID
echo "APPSTORE_KEY_ID: $KEY_ID" >> "$SETUP_DIR/secrets.txt"

read -p "Slack webhook URL (optional, press Enter to skip): " SLACK_WEBHOOK
if [ ! -z "$SLACK_WEBHOOK" ]; then
    echo "SLACK_WEBHOOK_URL: $SLACK_WEBHOOK" >> "$SETUP_DIR/secrets.txt"
fi

echo ""

# 5. Generate summary
print_success "Setup complete! Here's what you need to do next:"
echo ""
print_status "1. Add the following secrets to your GitHub repository:"
print_status "   Go to: Settings > Secrets and variables > Actions"
echo ""

cat "$SETUP_DIR/secrets.txt"

echo ""
print_status "2. For base64 encoded files, use the content from:"
for file in "$SETUP_DIR"/*.base64; do
    if [ -f "$file" ]; then
        print_status "   - $(basename "$file")"
    fi
done

echo ""
print_status "3. Commit and push your changes to trigger the CI/CD pipeline"
echo ""
print_status "4. Check the CI_CD_SETUP_GUIDE.md for detailed instructions"
echo ""

# 6. Create a quick reference card
cat > "$SETUP_DIR/quick-reference.md" << EOF
# Quick Reference

## GitHub Secrets Required

\`\`\`
IOS_DIST_SIGNING_KEY=<base64-encoded-p12-certificate>
IOS_DIST_SIGNING_KEY_PASSWORD=<certificate-password>
IOS_BUNDLE_ID=$BUNDLE_ID_INPUT
IOS_TEAM_ID=$TEAM_ID
IOS_PROVISIONING_PROFILE_NAME=$PROFILE_NAME
APPSTORE_ISSUER_ID=$ISSUER_ID
APPSTORE_KEY_ID=$KEY_ID
APPSTORE_PRIVATE_KEY=<base64-encoded-p8-key>
SLACK_WEBHOOK_URL=$SLACK_WEBHOOK
\`\`\`

## Workflow Triggers

### TestFlight (ios-testflight.yml)
- Push to \`develop\` or \`staging\` branches
- Manual trigger with environment selection

### App Store (ios-appstore.yml)
- Push to \`main\` branch
- Version tags (v1.0.0, v1.1.0, etc.)
- Manual trigger with version and release notes

## Commands

\`\`\`bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0

# Manual trigger via GitHub Actions UI
# Go to Actions tab > Select workflow > Run workflow
\`\`\`
EOF

print_success "Created quick reference: $SETUP_DIR/quick-reference.md"
print_success "All setup files are in: $SETUP_DIR/"
print_warning "Remember to keep your certificates and keys secure!"

echo ""
print_status "🎉 Setup helper completed successfully!"
