#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Test if 3D models exist and are accessible
const testModels = () => {
  console.log('🧪 Testing 3D Character Models...\n');

  const modelsDir = path.join(
    __dirname,
    '..',
    'public',
    'models',
    'characters',
  );

  if (!fs.existsSync(modelsDir)) {
    console.log('❌ Characters directory does not exist');
    console.log('📁 Creating directory: /public/models/characters/');
    fs.mkdirSync(modelsDir, { recursive: true });
    console.log('✅ Directory created successfully\n');
  }

  const files = fs.readdirSync(modelsDir);
  const modelFiles = files.filter(
    (file) => file.endsWith('.glb') || file.endsWith('.gltf'),
  );

  if (modelFiles.length === 0) {
    console.log('⚠️  No 3D models found in /public/models/characters/');
    console.log('\n📋 To add models:');
    console.log(
      '1. Download from Sketchfab: https://sketchfab.com/3d-models?features=downloadable',
    );
    console.log('2. Convert to GLB format if needed');
    console.log('3. Place in /public/models/characters/');
    console.log('4. Update Hero3D component with model path\n');

    console.log('🎯 Recommended searches:');
    console.log('- "anime warrior"');
    console.log('- "dark knight"');
    console.log('- "fantasy character low poly"');
    console.log('- "medieval warrior"\n');

    return;
  }

  console.log(`✅ Found ${modelFiles.length} model(s):\n`);

  modelFiles.forEach((file, index) => {
    const filePath = path.join(modelsDir, file);
    const stats = fs.statSync(filePath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`${index + 1}. ${file}`);
    console.log(`   📏 Size: ${sizeInMB} MB`);
    console.log(`   🔗 URL: /models/characters/${file}`);

    if (stats.size > 10 * 1024 * 1024) {
      console.log('   ⚠️  Warning: File is large (>10MB), may slow loading');
    }

    console.log('');
  });

  // Show how to use the models
  console.log('🎮 To use in your component:');
  modelFiles.forEach((file, index) => {
    if (index < 3) {
      // Show first 3 examples
      console.log(`\n<Character3D`);
      console.log(`  modelPath="/models/characters/${file}"`);
      console.log(`  characterName="Your Character Name"`);
      console.log(`/>`);
    }
  });

  console.log(
    '\n🔧 Need help? Check CHARACTER_SETUP_GUIDE.md for detailed instructions',
  );
};

// Test model accessibility via HTTP
const testModelAccess = async () => {
  const modelsDir = path.join(
    __dirname,
    '..',
    'public',
    'models',
    'characters',
  );

  if (!fs.existsSync(modelsDir)) {
    return;
  }

  const files = fs.readdirSync(modelsDir);
  const modelFiles = files.filter(
    (file) => file.endsWith('.glb') || file.endsWith('.gltf'),
  );

  if (modelFiles.length === 0) {
    return;
  }

  console.log('\n🌐 Testing model accessibility...');
  console.log('💡 Make sure your dev server is running (npm run dev)\n');

  modelFiles.forEach((file) => {
    const url = `http://localhost:3001/models/characters/${file}`;
    console.log(`📡 Test URL: ${url}`);
  });

  console.log('\n✅ If dev server is running, these URLs should be accessible');
  console.log('❌ If you get 404 errors, check file paths and spelling');
};

// Main execution
try {
  testModels();
  testModelAccess();
} catch (error) {
  console.error('❌ Error testing models:', error.message);
}
