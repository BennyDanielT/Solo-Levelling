'use client';

import SketchfabHero3D from './SketchfabHero3D';
import LocalModel3D from './LocalModel3D'; // For local models
import CSS3DCharacter from './CSS3DCharacter'; // CSS fallback

export default function Hero3D() {
  // 🎯 FUTURE 3D OPTIONS (packages already installed!):

  // Option 1: Sketchfab Embed (No downloads needed)
  // return (
  //   <SketchfabHero3D
  //     modelId='d819c8d0c2e147e98996260b97c56065' // ← Beru from Solo Leveling
  //     title='Beru'
  //     author='Julliani'
  //   />
  // );

  // Option 2: Local Model (Your .glb files work perfectly!)
  // return (
  //   <LocalModel3D
  //     modelPath='/models/characters/warrior.glb' // ← Your existing models
  //     title='Epic Warrior'
  //     scale={1.0}
  //     enableAnimation={true}
  //   />
  // );

  // Option 3: CSS 3D Character (Current - reliable & beautiful)
  return <CSS3DCharacter />;
}
