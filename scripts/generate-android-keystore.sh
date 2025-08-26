#!/bin/bash

# Android Keystore Generation Script
# This script helps you generate an Android keystore for release builds

set -e

echo "🔑 Android Keystore Generation Helper"
echo "===================================="
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

if [ ! -d "android/app" ]; then
    print_error "Android app directory not found. Make sure you're in a React Native project."
    exit 1
fi

print_status "Checking for existing keystore..."

# Check if keystore already exists
if [ -f "android/app/release.keystore" ]; then
    print_warning "A release keystore already exists at android/app/release.keystore"
    read -p "Do you want to create a new one? This will overwrite the existing keystore (y/N): " overwrite
    if [[ ! $overwrite =~ ^[Yy]$ ]]; then
        print_status "Keeping existing keystore."
        exit 0
    fi
fi

print_status "Generating new Android release keystore..."

# Navigate to android/app directory
cd android/app

# Get information from user
echo ""
print_status "Please provide the following information for your keystore:"
echo ""

read -p "Key alias (default: release-key): " KEY_ALIAS
KEY_ALIAS=${KEY_ALIAS:-release-key}

read -p "Keystore password: " -s KEYSTORE_PASSWORD
echo ""

read -p "Key password (or press Enter to use same as keystore): " -s KEY_PASSWORD
echo ""
if [ -z "$KEY_PASSWORD" ]; then
    KEY_PASSWORD=$KEYSTORE_PASSWORD
fi

read -p "Your first and last name: " FULL_NAME
read -p "Your organization unit (e.g., Development Team): " ORG_UNIT
read -p "Your organization (e.g., Your Company): " ORGANIZATION
read -p "Your city or locality: " CITY
read -p "Your state or province: " STATE
read -p "Your country code (e.g., US): " COUNTRY

echo ""
print_status "Generating keystore with the following details:"
echo "  Alias: $KEY_ALIAS"
echo "  Name: $FULL_NAME"
echo "  Organization: $ORGANIZATION"
echo "  City: $CITY, $STATE"
echo "  Country: $COUNTRY"
echo ""

# Generate the keystore
keytool -genkeypair -v \
    -storetype PKCS12 \
    -keystore release.keystore \
    -alias "$KEY_ALIAS" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass "$KEYSTORE_PASSWORD" \
    -keypass "$KEY_PASSWORD" \
    -dname "CN=$FULL_NAME, OU=$ORG_UNIT, O=$ORGANIZATION, L=$CITY, ST=$STATE, C=$COUNTRY"

if [ $? -eq 0 ]; then
    print_success "Keystore generated successfully!"
    echo ""
    
    # Go back to project root
    cd ../..
    
    # Generate base64 for GitHub secrets
    print_status "Generating base64 encoded keystore for GitHub secrets..."
    
    BASE64_KEYSTORE=$(base64 -i android/app/release.keystore)
    
    # Create a secrets file
    cat > android-keystore-secrets.txt << EOF
# GitHub Secrets for Android Release
# Add these to your GitHub repository secrets:

ANDROID_KEYSTORE_BASE64:
$BASE64_KEYSTORE

ANDROID_KEYSTORE_PASSWORD: $KEYSTORE_PASSWORD
ANDROID_KEY_PASSWORD: $KEY_PASSWORD
ANDROID_KEY_ALIAS: $KEY_ALIAS
ANDROID_PACKAGE_NAME: com.pureheart

EOF

    print_success "Created android-keystore-secrets.txt with your GitHub secrets!"
    echo ""
    print_warning "Important Security Notes:"
    echo "  1. Keep your keystore file (android/app/release.keystore) safe and backed up"
    echo "  2. Never commit the keystore file to your repository"
    echo "  3. Add android-keystore-secrets.txt to your .gitignore"
    echo "  4. Delete android-keystore-secrets.txt after copying secrets to GitHub"
    echo ""
    print_status "Next steps:"
    echo "  1. Copy the secrets from android-keystore-secrets.txt to GitHub"
    echo "  2. Go to: Settings > Secrets and variables > Actions"
    echo "  3. Add each secret individually"
    echo "  4. Delete android-keystore-secrets.txt for security"
    echo "  5. Test your CI/CD pipeline"
    
    # Add to .gitignore if it exists
    if [ -f ".gitignore" ]; then
        if ! grep -q "android-keystore-secrets.txt" .gitignore; then
            echo "android-keystore-secrets.txt" >> .gitignore
            print_status "Added android-keystore-secrets.txt to .gitignore"
        fi
        
        if ! grep -q "android/app/release.keystore" .gitignore; then
            echo "android/app/release.keystore" >> .gitignore
            print_status "Added android/app/release.keystore to .gitignore"
        fi
    fi
    
else
    print_error "Failed to generate keystore. Please check the error messages above."
    exit 1
fi

echo ""
print_success "🎉 Android keystore setup completed successfully!"
