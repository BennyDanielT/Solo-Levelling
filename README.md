# Solo Leveling Dashboard

A gamified goal tracking dashboard inspired by the Solo Leveling manhwa/anime. Track your goals, earn points, and unlock powerful companions and items as you progress!

## Features

### 🎯 Goal Management

- **Weight-based Goal System**: Each goal has a percentage weight that adds up to 100%
- **Automatic Weight Redistribution**: When adding new goals, weights are automatically redistributed
- **Difficulty Levels**: Choose from Easy, Medium, or Hard difficulty for each goal
- **Point Rewards**: Earn points based on goal weight and difficulty
- **Progress Tracking**: Visual progress indicators and completion dates

### 🏆 Gamification

- **Level System**: Gain levels every 100 points earned
- **Companion Unlocks**: Unlock Solo Leveling themed companions at different point thresholds
- **Item Collection**: Collect weapons, armor, and accessories
- **Rarity System**: Common, Rare, Epic, and Legendary items/companions
- **Fancy Unlock Animations**: Celebratory animations when unlocking new content

### 🎨 Beautiful UI/UX

- **Solo Leveling Theme**: Dark theme with gold accents
- **Glass Morphism**: Modern glass-effect cards and components
- **Smooth Animations**: Framer Motion powered animations throughout
- **Responsive Design**: Works perfectly on desktop and mobile
- **Real-time Updates**: Instant feedback and progress updates

## Companions

Unlock these powerful shadow soldiers as you progress:

- **Fang** (50 points) - Common - Loyal tracking companion
- **Iron** (75 points) - Rare - Defensive specialist
- **Tusk** (100 points) - Rare - Swift attacker
- **Igris** (150 points) - Epic - Former knight with combat skills
- **Beru** (300 points) - Epic - Ant-like regenerator
- **Bellion** (500 points) - Legendary - Former demon king

## Items

Collect powerful equipment:

- **Shadow Healing Potion** (25 points) - Common consumable
- **Mana Crystal** (45 points) - Common accessory
- **Shadow Boots** (80 points) - Rare armor
- **Shadow Sword** (125 points) - Rare weapon
- **Shadow Armor** (250 points) - Epic armor
- **Necromancer's Staff** (350 points) - Epic weapon
- **Demon King's Dagger** (400 points) - Legendary weapon
- **Shadow Crown** (600 points) - Legendary accessory

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Solo-Levelling
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Hooks + localStorage

## Project Structure

```
├── app/
│   ├── globals.css          # Global styles and Tailwind config
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main dashboard page
├── components/
│   ├── AddGoalModal.tsx     # Modal for adding new goals
│   ├── CompanionCard.tsx    # Individual companion display
│   ├── GoalCard.tsx         # Individual goal display
│   ├── ItemCard.tsx         # Individual item display
│   ├── ProgressCard.tsx     # Progress overview card
│   └── UnlockNotification.tsx # Fancy unlock animations
├── data/
│   ├── companions.ts        # Companion data
│   └── items.ts            # Item data
├── types/
│   └── index.ts            # TypeScript type definitions
├── utils/
│   └── progress.ts         # Progress calculation utilities
└── package.json
```

## How It Works

### Goal Weight System

- Each goal has a weight percentage (0-100%)
- Total weight of all goals must equal 100%
- When adding a new goal, existing weights are automatically redistributed
- Points are calculated based on weight × difficulty multiplier

### Point System

- **Easy**: Weight × 1.6 points
- **Medium**: Weight × 2 points
- **Hard**: Weight × 3 points
- Every 100 points = 1 level

### Unlock System

- Companions and items unlock at specific point thresholds
- Fancy animations play when unlocking new content
- Progress is saved to localStorage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the Solo Leveling manhwa/anime
- Built with modern web technologies
- Designed for optimal user experience

---

**Ready to start your Solo Leveling journey? Add your first goal and begin unlocking powerful companions!** 🎮⚔️
