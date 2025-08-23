import { Companion } from '@/types';

export const companions: Companion[] = [
  {
    id: 'igris',
    name: 'Igris',
    description: 'A powerful shadow soldier with exceptional combat skills. Once a high-ranking knight, now serves as your loyal shadow.',
    imageUrl: '/companions/igris.png',
    modelPath: '/images/companions/igris.png', // Updated to use actual image
    requiredPoints: 150,
    unlocked: false,
    rarity: 'epic',
    abilities: ['Shadow Strike', 'Knight\'s Honor', 'Dark Aura']
  },
  {
    id: 'beru',
    name: 'Beru',
    description: 'A fearsome ant-like shadow soldier with incredible strength and regeneration abilities.',
    imageUrl: '/companions/beru.png',
    modelPath: '/images/companions/beru-1.png', // Using beru-1.png from uploaded files
    requiredPoints: 300,
    unlocked: false,
    rarity: 'epic',
    abilities: ['Regeneration', 'Ant Colony', 'Toxic Bite']
  },
  {
    id: 'bellion',
    name: 'Bellion',
    description: 'The strongest shadow soldier, a former demon king with overwhelming power.',
    imageUrl: '/companions/bellion.png',
    modelPath: '/images/companions/monarch-1.png', // Using monarch-1.png for legendary status
    requiredPoints: 500,
    unlocked: false,
    rarity: 'legendary',
    abilities: ['Demon King\'s Wrath', 'Shadow Army', 'Infernal Power']
  },
  {
    id: 'iron',
    name: 'Iron',
    description: 'A sturdy shadow soldier with excellent defensive capabilities.',
    imageUrl: '/companions/iron.png',
    modelPath: '/images/companions/tank.png', // Using tank.png for defensive companion
    requiredPoints: 75,
    unlocked: false,
    rarity: 'rare',
    abilities: ['Iron Defense', 'Shield Wall', 'Steel Body']
  },
  {
    id: 'tusk',
    name: 'Tusk',
    description: 'A swift shadow soldier with incredible speed and agility.',
    imageUrl: '/companions/tusk.png',
    modelPath: '/images/companions/tusk__solo_leveling_arise__by_nine0690_dj1bzv5.png', // Perfect match!
    requiredPoints: 100,
    unlocked: false,
    rarity: 'rare',
    abilities: ['Swift Strike', 'Shadow Step', 'Wind Walker']
  },
  {
    id: 'fang',
    name: 'Fang',
    description: 'A loyal shadow soldier with sharp instincts and tracking abilities.',
    imageUrl: '/companions/fang.png',
    modelPath: '/images/companions/cerebrus.png', // Using cerebrus.png for creature-like companion
    requiredPoints: 50,
    unlocked: false,
    rarity: 'common',
    abilities: ['Track', 'Pack Tactics', 'Loyal Companion']
  },
  {
    id: 'jin_woo',
    name: 'Shadow Monarch',
    description: 'The Shadow Monarch himself - ultimate power incarnate.',
    imageUrl: '/companions/sung_jin_woo.png',
    modelPath: '/images/companions/sung-jin-woo-1.png', // Adding Jin Woo as special companion
    requiredPoints: 1000,
    unlocked: false,
    rarity: 'legendary',
    abilities: ['Monarch\'s Domain', 'Shadow Army Command', 'Arise']
  }
]; 