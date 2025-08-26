#!/bin/bash

# Android Build Troubleshooting Script
# This script helps fix common Android build issues including CMake errors

set -e

echo "🔧 Android Build Troubleshooting"
echo "================================"
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

if [ ! -d "android" ]; then
    print_error "Android directory not found. Make sure you're in a React Native project."
    exit 1
fi

print_status "Diagnosing Android build environment..."

# 1. Check Java version
echo ""
print_status "Checking Java version..."
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
    echo "Current Java version: $JAVA_VERSION"
    if [ "$JAVA_VERSION" != "17" ] && [ "$JAVA_VERSION" != "11" ]; then
        print_warning "Java $JAVA_VERSION detected. React Native 0.80.x works best with Java 17 or 11"
        print_status "Consider installing Java 17: brew install openjdk@17"
    else
        print_success "Java version is compatible"
    fi
else
    print_error "Java not found. Please install Java 17: brew install openjdk@17"
fi

# 2. Check Android SDK
echo ""
print_status "Checking Android SDK..."
if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
    print_error "ANDROID_HOME or ANDROID_SDK_ROOT not set"
    print_status "Add to your ~/.zshrc or ~/.bash_profile:"
    echo "export ANDROID_HOME=\$HOME/Library/Android/sdk"
    echo "export PATH=\$PATH:\$ANDROID_HOME/emulator"
    echo "export PATH=\$PATH:\$ANDROID_HOME/tools"
    echo "export PATH=\$PATH:\$ANDROID_HOME/tools/bin"
    echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
else
    print_success "Android SDK path configured"
    SDK_PATH=${ANDROID_HOME:-$ANDROID_SDK_ROOT}
    echo "SDK Path: $SDK_PATH"
fi

# 3. Check NDK installation
echo ""
print_status "Checking Android NDK..."
if [ -n "$SDK_PATH" ] && [ -d "$SDK_PATH/ndk" ]; then
    NDK_VERSIONS=$(ls "$SDK_PATH/ndk" 2>/dev/null || echo "none")
    echo "Installed NDK versions: $NDK_VERSIONS"
    
    # Check for compatible NDK version
    if [ -d "$SDK_PATH/ndk/25.1.8937393" ]; then
        print_success "Compatible NDK version 25.1.8937393 found"
    else
        print_warning "NDK 25.1.8937393 not found. This version is more stable for React Native 0.80.x"
        print_status "Install with: \$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager \"ndk;25.1.8937393\""
    fi
else
    print_warning "NDK not found or SDK path not available"
fi

# 4. Check CMake
echo ""
print_status "Checking CMake..."
if command -v cmake &> /dev/null; then
    CMAKE_VERSION=$(cmake --version | head -n 1 | cut -d' ' -f3)
    echo "System CMake version: $CMAKE_VERSION"
    print_success "CMake found"
else
    print_warning "System CMake not found"
fi

if [ -n "$SDK_PATH" ] && [ -d "$SDK_PATH/cmake" ]; then
    CMAKE_VERSIONS=$(ls "$SDK_PATH/cmake" 2>/dev/null || echo "none")
    echo "Android SDK CMake versions: $CMAKE_VERSIONS"
    
    if [ -d "$SDK_PATH/cmake/3.18.1" ]; then
        print_success "Compatible CMake version 3.18.1 found in Android SDK"
    else
        print_warning "CMake 3.18.1 not found in Android SDK"
        print_status "Install with: \$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager \"cmake;3.18.1\""
    fi
fi

# 5. Clean and optimize Android build
echo ""
print_status "Cleaning Android build cache..."

cd android

# Clean Gradle cache
if [ -d "~/.gradle/caches" ]; then
    print_status "Cleaning Gradle caches..."
    rm -rf ~/.gradle/caches/
fi

# Clean project
print_status "Cleaning project..."
./gradlew clean

# Clean node_modules native builds
cd ..
print_status "Cleaning node_modules native builds..."
rm -rf node_modules/react-native/ReactAndroid/build
rm -rf node_modules/react-native/ReactCommon/build
rm -rf node_modules/@react-native/*/android/build 2>/dev/null || true

# 6. Apply recommended fixes
echo ""
print_status "Applying recommended fixes..."

# Update gradle.properties with optimizations
GRADLE_PROPS="android/gradle.properties"
if ! grep -q "org.gradle.jvmargs=-Xmx4096m" "$GRADLE_PROPS"; then
    print_status "Updating Gradle JVM args for better memory allocation..."
    sed -i.bak 's/org.gradle.jvmargs=.*/org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError/' "$GRADLE_PROPS"
fi

if ! grep -q "org.gradle.parallel=true" "$GRADLE_PROPS"; then
    echo "org.gradle.parallel=true" >> "$GRADLE_PROPS"
fi

if ! grep -q "org.gradle.configureondemand=true" "$GRADLE_PROPS"; then
    echo "org.gradle.configureondemand=true" >> "$GRADLE_PROPS"
fi

if ! grep -q "android.enableR8.fullMode=false" "$GRADLE_PROPS"; then
    echo "android.enableR8.fullMode=false" >> "$GRADLE_PROPS"
fi

print_success "Applied Gradle optimizations"

# 7. Test build
echo ""
print_status "Testing Android build..."
print_warning "This may take several minutes..."

cd android

# Try a test build with optimized settings
if ./gradlew assembleDebug \
    --no-daemon \
    --max-workers=2 \
    -Dorg.gradle.jvmargs="-Xmx4096m -XX:MaxMetaspaceSize=1024m" \
    --warning-mode=summary; then
    print_success "✅ Android build test successful!"
    print_status "Your Android build environment is properly configured"
else
    print_error "❌ Android build test failed"
    print_status "Common solutions:"
    echo "  1. Restart your terminal to reload environment variables"
    echo "  2. Install missing SDK components"
    echo "  3. Check that NDK version 25.1.8937393 is installed"
    echo "  4. Try building with: cd android && ./gradlew assembleDebug --stacktrace"
fi

echo ""
print_status "🎉 Android troubleshooting completed!"
print_status "If issues persist, check the full error logs with: cd android && ./gradlew assembleDebug --stacktrace --debug"
