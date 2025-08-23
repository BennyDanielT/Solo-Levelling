#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create directory structure for 3D models
const createModelDirectories = () => {
  const baseDir = path.join(__dirname, '..', 'public', 'models');
  const directories = [
    'weapons',
    'characters',
    'props',
    'environment',
    'companions',
    'items',
  ];

  directories.forEach((dir) => {
    const fullPath = path.join(baseDir, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    } else {
      console.log(`📁 Directory already exists: ${dir}`);
    }
  });
};

// Create a README file for the models directory
const createModelsReadme = () => {
  const readmePath = path.join(
    __dirname,
    '..',
    'public',
    'models',
    'README.md',
  );
  const readmeContent = `# 3D Models Directory

This directory contains 3D models for the Solo Leveling Dashboard.

## Directory Structure

- \`weapons/\` - Swords, shields, bows, etc.
- \`characters/\` - Character models and avatars
- \`props/\` - Items like chests, potions, scrolls
- \`environment/\` - Background elements and scenery
- \`companions/\` - Companion character models
- \`items/\` - Equipment and inventory items

## File Formats

- **GLTF/GLB** (Recommended) - Best compatibility with Three.js
- **OBJ** - Universal format, may need conversion
- **FBX** - Good for animations

## Usage

Place your 3D model files in the appropriate subdirectory, then reference them in your components:

\`\`\`tsx
import Model3D from '@/components/Model3D';

<Model3D modelUrl="/models/weapons/sword.glb" />
\`\`\`

## Optimization Tips

- Keep file sizes under 5MB for web use
- Use compressed textures
- Optimize polygon count
- Test on mobile devices

## Attribution

Remember to credit the original artists when using licensed models.
`;

  fs.writeFileSync(readmePath, readmeContent);
  console.log('✅ Created models README.md');
};

// Create a sample model configuration file
const createModelConfig = () => {
  const configPath = path.join(
    __dirname,
    '..',
    'public',
    'models',
    'models.json',
  );
  const configContent = {
    weapons: {
      sword: {
        path: '/models/weapons/sword.glb',
        name: 'Fantasy Sword',
        description: 'A powerful magical sword',
        scale: 1.5,
        position: [0, -1, 0],
        rotation: [0, 0, 0],
      },
    },
    characters: {
      warrior: {
        path: '/models/characters/warrior.glb',
        name: 'Warrior',
        description: 'A brave warrior companion',
        scale: 1.0,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
      },
    },
    props: {
      chest: {
        path: '/models/props/chest.glb',
        name: 'Treasure Chest',
        description: 'A mysterious treasure chest',
        scale: 1.2,
        position: [0, -0.5, 0],
        rotation: [0, 0, 0],
      },
    },
  };

  fs.writeFileSync(configPath, JSON.stringify(configContent, null, 2));
  console.log('✅ Created models.json configuration file');
};

// Main execution
console.log('🚀 Setting up 3D models directory structure...\n');

try {
  createModelDirectories();
  createModelsReadme();
  createModelConfig();

  console.log('\n✅ 3D models setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Download 3D models from recommended sources');
  console.log('2. Place them in the appropriate subdirectories');
  console.log('3. Update the models.json configuration file');
  console.log('4. Reference models in your components');
  console.log('\n📖 See 3D_ASSETS_GUIDE.md for detailed instructions');
} catch (error) {
  console.error('❌ Error setting up 3D models:', error.message);
  process.exit(1);
}
