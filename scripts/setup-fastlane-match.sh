#!/bin/bash

# Fastlane Match Setup Script - Optimized Version
# This script helps you set up automatic iOS certificate management

set -e

echo "🚀 Fastlane Match Setup - No More Manual Certificates!"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from your React Native project root directory"
    exit 1
fi

if [ ! -d "ios" ]; then
    print_error "iOS directory not found. Make sure you're in a React Native project."
    exit 1
fi

print_status "Setting up Fastlane Match for automatic iOS certificate management..."
echo ""

# 1. Install Fastlane (Optimized)
print_status "Installing Fastlane..."
cd ios

if ! command -v fastlane &> /dev/null; then
    print_status "Checking installation options..."
    
    # Option 1: Try Homebrew (fastest)
    if command -v brew &> /dev/null; then
        print_status "Installing Fastlane via Homebrew (faster)..."
        brew install fastlane
        print_success "Fastlane installed via Homebrew"
    else
        # Option 2: Use Bundler (project-specific, reliable)
        print_status "Homebrew not found. Using Bundler for project-specific installation..."
        
        if [ ! -f "Gemfile" ]; then
            print_status "Creating Gemfile..."
            cat > Gemfile << 'EOF'
source "https://rubygems.org"

gem "fastlane"
gem "cocoapods"
EOF
        fi
        
        # Install bundler if not present
        if ! command -v bundle &> /dev/null; then
            print_status "Installing Bundler..."
            gem install bundler --no-document
        fi
        
        print_status "Installing Fastlane via Bundler (this may take a few minutes)..."
        bundle install
        
        # Create a wrapper script for easier usage
        cat > fastlane_wrapper.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
bundle exec fastlane "$@"
EOF
        chmod +x fastlane_wrapper.sh
        
        print_success "Fastlane installed via Bundler. Use 'bundle exec fastlane' or './fastlane_wrapper.sh'"
        FASTLANE_CMD="bundle exec fastlane"
    fi
else
    print_success "Fastlane already installed"
    FASTLANE_CMD="fastlane"
fi

# Set default if not set
FASTLANE_CMD=${FASTLANE_CMD:-"fastlane"}

# 2. Initialize Fastlane if needed
if [ ! -d "fastlane" ]; then
    print_status "Initializing Fastlane..."
    $FASTLANE_CMD init --skip_git_init
fi

# 3. Set up Match
print_status "Setting up Fastlane Match..."

if [ ! -f "fastlane/Matchfile" ]; then
    print_status "Initializing Match..."
    $FASTLANE_CMD match init
else
    print_success "Match already initialized"
fi

# 4. Create or update Fastfile
print_status "Creating Fastfile with Match configuration..."

cat > fastlane/Fastfile << 'EOF'
default_platform(:ios)

platform :ios do
  desc "Fetch certificates and provisioning profiles"
  lane :certificates do
    setup_ci if ENV['CI']
    match(type: "appstore", readonly: true)
  end
  
  desc "Build and upload to TestFlight"
  lane :beta do
    setup_ci if ENV['CI']
    certificates
    increment_build_number(xcodeproj: "PureHeart.xcodeproj")
    build_app(
      workspace: "PureHeart.xcworkspace",
      scheme: "PureHeart",
      configuration: "Release",
      export_method: "app-store",
      export_options: {
        method: "app-store",
        uploadBitcode: false,
        uploadSymbols: true,
        compileBitcode: false
      }
    )
    upload_to_testflight(
      skip_waiting_for_build_processing: true,
      distribute_external: false,
      notify_external_testers: false
    )
  end
  
  desc "Generate new certificates and profiles"
  lane :generate_certs do
    match(type: "appstore", force_for_new_devices: true)
  end
  
  desc "Sync certificates for development"
  lane :sync_certs do
    setup_ci if ENV['CI']
    match(type: "development", readonly: true)
    match(type: "appstore", readonly: true)
  end
  
  desc "Register new device and regenerate profiles"
  lane :add_device do |options|
    device_name = options[:name] || prompt(text: "Device Name: ")
    device_udid = options[:udid] || prompt(text: "Device UDID: ")
    
    register_devices(
      devices: {
        device_name => device_udid
      }
    )
    
    match(type: "development", force_for_new_devices: true)
  end
end
EOF

print_success "Created Fastfile with Match lanes"

# 5. Create App Store Connect API key info
echo ""
print_status "You'll need to set up App Store Connect API key..."
print_status "1. Go to https://appstoreconnect.apple.com"
print_status "2. Users and Access > Keys"
print_status "3. Create a new key with Developer access"
print_status "4. Download the .p8 file and note the Key ID and Issuer ID"

echo ""
read -p "Press Enter when you have your API key ready..."

# 6. Get information from user
echo ""
print_status "Let's collect the information needed for GitHub secrets..."

read -p "App Store Connect API Key ID: " API_KEY_ID
read -p "App Store Connect Issuer ID: " ISSUER_ID
read -p "Path to your .p8 API key file: " API_KEY_PATH

# Encode API key
if [ -f "$API_KEY_PATH" ]; then
    if command -v base64 &> /dev/null; then
        # macOS/Linux compatible base64
        if [[ "$OSTYPE" == "darwin"* ]]; then
            API_KEY_BASE64=$(base64 -i "$API_KEY_PATH")
        else
            API_KEY_BASE64=$(base64 -w 0 "$API_KEY_PATH")
        fi
        print_success "API key encoded successfully"
    else
        print_error "base64 command not found"
        exit 1
    fi
else
    print_error "API key file not found: $API_KEY_PATH"
    exit 1
fi

read -p "Your Apple ID email: " APPLE_ID
read -p "Your Apple ID password (or app-specific password): " -s APPLE_PASSWORD
echo ""

read -p "Your Bundle ID (e.g., com.company.appname): " BUNDLE_ID
read -p "Your Apple Developer Team ID: " TEAM_ID

# 7. Match repository setup
echo ""
print_status "Setting up Match repository..."
print_status "You need a private Git repository to store certificates securely."
print_status "Options:"
echo "  1. Create a new private GitHub repository (recommended)"
echo "  2. Use an existing private repository"
echo "  3. Use Google Cloud Storage or Amazon S3"

read -p "Match repository URL (git): " MATCH_REPO
read -p "Match repository password/token: " -s MATCH_PASSWORD
echo ""

# 8. Create Match configuration
print_status "Creating Matchfile..."

cat > fastlane/Matchfile << EOF
git_url("$MATCH_REPO")
storage_mode("git")
type("development")
app_identifier(["$BUNDLE_ID"])
username("$APPLE_ID")
team_id("$TEAM_ID")

# For CI
keychain_name("fastlane_tmp_keychain") if ENV['CI']
keychain_password(SecureRandom.base64) if ENV['CI']
EOF

print_success "Created Matchfile"

# 9. Generate GitHub secrets
echo ""
print_status "Generating GitHub secrets..."

SECRETS_DIR="../fastlane-secrets"
mkdir -p "$SECRETS_DIR"

cat > "$SECRETS_DIR/github-secrets.txt" << EOF
# GitHub Secrets for Fastlane Match
# Add these to your GitHub repository: Settings > Secrets and variables > Actions

MATCH_PASSWORD=$MATCH_PASSWORD
MATCH_GIT_URL=$MATCH_REPO
FASTLANE_USER=$APPLE_ID
FASTLANE_PASSWORD=$APPLE_PASSWORD
APPSTORE_KEY_ID=$API_KEY_ID
APPSTORE_ISSUER_ID=$ISSUER_ID
IOS_BUNDLE_ID=$BUNDLE_ID
IOS_TEAM_ID=$TEAM_ID

# Base64 encoded API key (paste as single line):
APPSTORE_PRIVATE_KEY=$API_KEY_BASE64

EOF

# For git basic auth if using GitHub
if [[ $MATCH_REPO == *"github.com"* ]]; then
    read -p "GitHub username for Match repository: " GITHUB_USER
    read -p "GitHub personal access token: " -s GITHUB_TOKEN
    echo ""
    
    if command -v base64 &> /dev/null; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            GITHUB_AUTH=$(echo -n "$GITHUB_USER:$GITHUB_TOKEN" | base64)
        else
            GITHUB_AUTH=$(echo -n "$GITHUB_USER:$GITHUB_TOKEN" | base64 -w 0)
        fi
        echo "MATCH_GIT_BASIC_AUTHORIZATION=$GITHUB_AUTH" >> "$SECRETS_DIR/github-secrets.txt"
    fi
fi

print_success "Created GitHub secrets file: $SECRETS_DIR/github-secrets.txt"

# 10. Create GitHub Actions workflow
print_status "Creating GitHub Actions workflow..."
mkdir -p ../.github/workflows

cat > ../.github/workflows/ios-deploy.yml << 'EOF'
name: iOS Build and Deploy

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: macos-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Ruby
      uses: ruby/setup-ruby@v1
      with:
        ruby-version: 3.0
        bundler-cache: true
        working-directory: ios
        
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm install
      
    - name: Install iOS dependencies
      run: |
        cd ios
        bundle install
        pod install
        
    - name: Build and Deploy to TestFlight
      env:
        MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
        MATCH_GIT_URL: ${{ secrets.MATCH_GIT_URL }}
        MATCH_GIT_BASIC_AUTHORIZATION: ${{ secrets.MATCH_GIT_BASIC_AUTHORIZATION }}
        FASTLANE_USER: ${{ secrets.FASTLANE_USER }}
        FASTLANE_PASSWORD: ${{ secrets.FASTLANE_PASSWORD }}
        APPSTORE_KEY_ID: ${{ secrets.APPSTORE_KEY_ID }}
        APPSTORE_ISSUER_ID: ${{ secrets.APPSTORE_ISSUER_ID }}
        APPSTORE_PRIVATE_KEY: ${{ secrets.APPSTORE_PRIVATE_KEY }}
      run: |
        cd ios
        bundle exec fastlane beta
      if: github.ref == 'refs/heads/main'
EOF

print_success "Created GitHub Actions workflow"

# 11. Initial certificate generation
echo ""
print_status "Generating initial certificates..."
print_warning "This will create certificates in your Match repository"

read -p "Proceed with certificate generation? (y/N): " generate_certs
if [[ $generate_certs =~ ^[Yy]$ ]]; then
    export MATCH_PASSWORD="$MATCH_PASSWORD"
    export FASTLANE_USER="$APPLE_ID"
    export FASTLANE_PASSWORD="$APPLE_PASSWORD"
    
    # Generate both development and appstore certificates
    print_status "Generating development certificates..."
    $FASTLANE_CMD match development --force_for_new_devices
    
    print_status "Generating app store certificates..."
    $FASTLANE_CMD match appstore --force_for_new_devices
    
    if [ $? -eq 0 ]; then
        print_success "✅ Certificates generated successfully!"
    else
        print_error "❌ Certificate generation failed. Check the errors above."
    fi
else
    print_status "Skipping certificate generation. You can run it later with:"
    echo "cd ios && $FASTLANE_CMD match development"
    echo "cd ios && $FASTLANE_CMD match appstore"
fi

# 12. Update .gitignore
cd ..
if [ -f ".gitignore" ]; then
    # Add fastlane-specific ignores
    GITIGNORE_ADDITIONS=(
        "fastlane-secrets/"
        "ios/fastlane/report.xml"
        "ios/fastlane/Preview.html"
        "ios/fastlane/timeline.html"
        "ios/fastlane/test_output"
        "ios/fastlane/.env*"
        "*.mobileprovision"
        "*.cer"
        "*.p12"
        "*.p8"
    )
    
    for item in "${GITIGNORE_ADDITIONS[@]}"; do
        if ! grep -Fq "$item" .gitignore; then
            echo "$item" >> .gitignore
        fi
    done
    
    print_status "Updated .gitignore with Fastlane-specific files"
fi

# 13. Create useful scripts
print_status "Creating helper scripts..."

# iOS deployment script
cat > deploy-ios.sh << EOF
#!/bin/bash
cd ios
$FASTLANE_CMD beta
EOF
chmod +x deploy-ios.sh

# Certificate sync script
cat > sync-certs.sh << EOF
#!/bin/bash
cd ios
$FASTLANE_CMD sync_certs
EOF
chmod +x sync-certs.sh

print_success "Created helper scripts: deploy-ios.sh, sync-certs.sh"

# 14. Final instructions
echo ""
print_success "🎉 Fastlane Match setup completed!"
echo ""
print_status "Next steps:"
echo "1. Copy secrets from $SECRETS_DIR/github-secrets.txt to GitHub"
echo "2. Go to: Settings > Secrets and variables > Actions"
echo "3. Add each secret individually"
echo "4. Delete the secrets file: rm -rf $SECRETS_DIR"
echo "5. Commit and push your changes"
echo "6. Test the workflow!"

echo ""
print_status "Testing commands:"
echo "cd ios"
echo "$FASTLANE_CMD certificates      # Test certificate fetching"
echo "$FASTLANE_CMD beta              # Build and upload to TestFlight"
echo "$FASTLANE_CMD add_device        # Add new device UDID"

echo ""
print_status "Helper scripts:"
echo "./deploy-ios.sh                 # Quick iOS deployment"
echo "./sync-certs.sh                 # Sync certificates"

echo ""
print_warning "Security reminders:"
echo "- Keep your Match repository private"
echo "- Use strong passwords"
echo "- Regularly rotate API keys"
echo "- Delete the secrets file after copying to GitHub"
echo "- Never commit .p8, .p12, or .mobileprovision files"

echo ""
if [ "$FASTLANE_CMD" == "bundle exec fastlane" ]; then
    print_status "📝 Note: Using Bundler installation"
    print_status "Always use 'bundle exec fastlane' or the helper scripts"
fi

echo ""
print_success "✨ No more manual certificate management! ✨"