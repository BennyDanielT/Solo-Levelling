'use client';

import SketchfabHero3D from './SketchfabHero3D';
// import LocalModel3D from './LocalModel3D';        // For local models
// import CSS3DCharacter from './CSS3DCharacter';    // CSS fallback

export default function Hero3D() {
  // Option 1: Sketchfab Embed (Online models)
  // return (
  //   <SketchfabHero3D
  //     modelId='d819c8d0c2e147e98996260b97c56065' // ← Beru from Solo Leveling
  //     title='Beru'
  //     author='Julliani'
  //   />
  // );

  // Option 2: Local Model (Your downloaded models) - ACTIVE
  return (
    <LocalModel3D
      modelPath='/models/characters/your-model.glb' // ← Put your downloaded model here
      title='Your Character'
      scale={1.2}
      enableAnimation={true}
    />
  );

  // Option 3: CSS 3D Character (Fallback)
  // return <CSS3DCharacter />;
}
