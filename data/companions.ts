import { Companion } from '@/types';

export const companions: Companion[] = [
  {
    id: 'igris',
    name: 'Igris',
    description: 'A powerful shadow soldier with exceptional combat skills. Once a high-ranking knight, now serves as your loyal shadow.',
    imageUrl: '/companions/igris.png',
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
    requiredPoints: 50,
    unlocked: false,
    rarity: 'common',
    abilities: ['Track', 'Pack Tactics', 'Loyal Companion']
  }
]; 