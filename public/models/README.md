# 3D Models Directory

This directory contains 3D models for the Solo Leveling Dashboard.

## Directory Structure

- `weapons/` - Swords, shields, bows, etc.
- `characters/` - Character models and avatars
- `props/` - Items like chests, potions, scrolls
- `environment/` - Background elements and scenery
- `companions/` - Companion character models
- `items/` - Equipment and inventory items

## File Formats

- **GLTF/GLB** (Recommended) - Best compatibility with Three.js
- **OBJ** - Universal format, may need conversion
- **FBX** - Good for animations

## Usage

Place your 3D model files in the appropriate subdirectory, then reference them in your components:

```tsx
import Model3D from '@/components/Model3D';

<Model3D modelUrl="/models/weapons/sword.glb" />
```

## Optimization Tips

- Keep file sizes under 5MB for web use
- Use compressed textures
- Optimize polygon count
- Test on mobile devices

## Attribution

Remember to credit the original artists when using licensed models.
