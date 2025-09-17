const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if ImageMagick is installed
function checkImageMagick() {
  try {
    execSync('magick -version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Install ImageMagick via Homebrew if not present
function installImageMagick() {
  console.log('Installing ImageMagick via Homebrew...');
  try {
    execSync('brew install imagemagick', { stdio: 'inherit' });
    console.log('ImageMagick installed successfully!');
    return true;
  } catch (error) {
    console.error('Failed to install ImageMagick:', error.message);
    return false;
  }
}

// Android icon sizes and directories
const androidSizes = [
  { size: 36, density: 'ldpi' },
  { size: 48, density: 'mdpi' },
  { size: 72, density: 'hdpi' },
  { size: 96, density: 'xhdpi' },
  { size: 144, density: 'xxhdpi' },
  { size: 192, density: 'xxxhdpi' }
];

function generateAndroidIcons() {
  const sourceLogo = path.join(__dirname, '../assets/bootsplash/logo.png');
  const androidResPath = path.join(__dirname, '../android/app/src/main/res');
  
  console.log('Generating Android app icons...');
  
  // Check if source logo exists
  if (!fs.existsSync(sourceLogo)) {
    console.error('Source logo not found at:', sourceLogo);
    return false;
  }
  
  try {
    // Generate icons for each density
    androidSizes.forEach(({ size, density }) => {
      const outputDir = path.join(androidResPath, `mipmap-${density}`);
      
      // Ensure directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Generate launcher icon
      const launcherIcon = path.join(outputDir, 'ic_launcher.png');
      execSync(`magick "${sourceLogo}" -resize ${size}x${size} "${launcherIcon}"`);
      
      // Generate round launcher icon (same image but will be clipped by system)
      const roundIcon = path.join(outputDir, 'ic_launcher_round.png');
      execSync(`magick "${sourceLogo}" -resize ${size}x${size} "${roundIcon}"`);
      
      // Generate foreground icon for adaptive icons
      const foregroundIcon = path.join(outputDir, 'ic_launcher_foreground.png');
      // Make the foreground icon slightly smaller to account for the safe zone
      const foregroundSize = Math.round(size * 0.6);
      const padding = Math.round((size - foregroundSize) / 2);
      execSync(`magick -size ${size}x${size} xc:transparent \\( "${sourceLogo}" -resize ${foregroundSize}x${foregroundSize} \\) -gravity center -composite "${foregroundIcon}"`);
      
      console.log(`Generated ${density} icons (${size}x${size})`);
    });
    
    // Generate adaptive icon XML files
    generateAdaptiveIconXML();
    
    console.log('✅ Android app icons generated successfully!');
    return true;
    
  } catch (error) {
    console.error('Error generating Android icons:', error.message);
    return false;
  }
}

function generateAdaptiveIconXML() {
  const adaptiveIconXML = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`;

  const roundAdaptiveIconXML = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`;

  const valuesDir = path.join(__dirname, '../android/app/src/main/res/values');
  const anydpiDir = path.join(__dirname, '../android/app/src/main/res/mipmap-anydpi-v26');
  
  // Ensure directories exist
  if (!fs.existsSync(valuesDir)) {
    fs.mkdirSync(valuesDir, { recursive: true });
  }
  if (!fs.existsSync(anydpiDir)) {
    fs.mkdirSync(anydpiDir, { recursive: true });
  }
  
  // Write adaptive icon XML files
  fs.writeFileSync(path.join(anydpiDir, 'ic_launcher.xml'), adaptiveIconXML);
  fs.writeFileSync(path.join(anydpiDir, 'ic_launcher_round.xml'), roundAdaptiveIconXML);
  
  // Check if colors.xml exists and update it carefully
  const colorsPath = path.join(valuesDir, 'colors.xml');
  let colorsContent = '';
  
  if (fs.existsSync(colorsPath)) {
    // Read existing colors.xml
    colorsContent = fs.readFileSync(colorsPath, 'utf8');
    
    // Check if ic_launcher_background already exists
    if (!colorsContent.includes('ic_launcher_background')) {
      // Add the ic_launcher_background color before the closing </resources> tag
      colorsContent = colorsContent.replace(
        '</resources>',
        '    <color name="ic_launcher_background">#FFFFFF</color>\n</resources>'
      );
      fs.writeFileSync(colorsPath, colorsContent);
    }
  } else {
    // Create new colors.xml with both colors
    const colorsXML = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FFFFFF</color>
    <color name="bootsplash_background">#FFFFFF</color>
</resources>`;
    fs.writeFileSync(colorsPath, colorsXML);
  }
  
  console.log('Generated adaptive icon XML files');
}

function main() {
  console.log('🚀 Starting Android app icon generation...');
  
  // Check if ImageMagick is available
  if (!checkImageMagick()) {
    console.log('ImageMagick not found. Attempting to install...');
    if (!installImageMagick()) {
      console.error('❌ Could not install ImageMagick. Please install it manually:');
      console.error('Run: brew install imagemagick');
      process.exit(1);
    }
  }
  
  if (generateAndroidIcons()) {
    console.log('🎉 All done! Your Android app icons have been updated.');
    console.log('💡 You may need to clean and rebuild your Android project:');
    console.log('   cd android && ./gradlew clean && cd .. && npx react-native run-android');
  } else {
    console.error('❌ Failed to generate icons');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateAndroidIcons };
