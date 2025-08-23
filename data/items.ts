import { Item } from '@/types';

export const items: Item[] = [
  {
    id: 'demon_king_dagger',
    name: 'Demon King\'s Dagger',
    description: 'A legendary dagger that once belonged to the Demon King. Imbued with dark power.',
    imageUrl: '/items/demon_king_dagger.png',
    modelPath: '/images/items/sword.png', // Using sword.png for now (closest match)
    requiredPoints: 400,
    unlocked: false,
    rarity: 'legendary',
    type: 'weapon'
  },
  {
    id: 'shadow_armor',
    name: 'Shadow Armor',
    description: 'Armor crafted from pure shadows, providing excellent protection and stealth.',
    imageUrl: '/items/shadow_armor.png',
    modelPath: '/images/items/sword.png', // Fallback to available image
    requiredPoints: 250,
    unlocked: false,
    rarity: 'epic',
    type: 'armor'
  },
  {
    id: 'necromancer_staff',
    name: 'Necromancer\'s Staff',
    description: 'A powerful staff that enhances shadow magic and summoning abilities.',
    imageUrl: '/items/necromancer_staff.png',
    modelPath: '/images/items/sword.png', // Using available sword.png
    requiredPoints: 350,
    unlocked: false,
    rarity: 'epic',
    type: 'weapon'
  },
  {
    id: 'shadow_crown',
    name: 'Shadow Crown',
    description: 'A crown that symbolizes the ruler of shadows. Grants authority over shadow soldiers.',
    imageUrl: '/items/shadow_crown.png',
    modelPath: '/images/items/sword.png', // Fallback image
    requiredPoints: 600,
    unlocked: false,
    rarity: 'legendary',
    type: 'accessory'
  },
  {
    id: 'healing_potion',
    name: 'Shadow Healing Potion',
    description: 'A potion that restores health using shadow energy.',
    imageUrl: '/items/healing_potion.png',
    modelPath: '/images/items/sword.png', // Using available image (will show sword until you add potion image)
    requiredPoints: 25,
    unlocked: false,
    rarity: 'common',
    type: 'consumable'
  },
  {
    id: 'shadow_sword',
    name: 'Shadow Sword',
    description: 'A sword forged from shadow essence, cutting through enemies like darkness.',
    imageUrl: '/items/shadow_sword.png',
    modelPath: '/images/items/sword.png', // Perfect match with uploaded sword.png!
    requiredPoints: 125,
    unlocked: false,
    rarity: 'rare',
    type: 'weapon'
  },
  {
    id: 'shadow_boots',
    name: 'Shadow Boots',
    description: 'Boots that allow silent movement and enhanced agility.',
    imageUrl: '/items/shadow_boots.png',
    modelPath: '/images/items/sword.png', // Fallback to available image
    requiredPoints: 80,
    unlocked: false,
    rarity: 'rare',
    type: 'armor'
  },
  {
    id: 'mana_crystal',
    name: 'Shadow Mana Crystal',
    description: 'A crystal that stores and amplifies shadow magic.',
    imageUrl: '/items/mana_crystal.png',
    modelPath: '/images/items/sword.png', // Using available image
    requiredPoints: 45,
    unlocked: false,
    rarity: 'common',
    type: 'accessory'
  }
]; 