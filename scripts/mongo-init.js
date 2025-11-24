// MongoDB initialization script for Solo Leveling Dashboard
// This script runs when the MongoDB container starts for the first time

// Switch to the application database
db = db.getSiblingDB('solo-leveling-db');

// Create application user with read/write permissions
db.createUser({
  user: 'soloapp',
  pwd: 'solo-app-password-2024',
  roles: [
    {
      role: 'readWrite',
      db: 'solo-leveling-db',
    },
  ],
});

// Create initial collections with indexes for better performance
db.createCollection('users');
db.createCollection('goals');
db.createCollection('achievements');
db.createCollection('accounts');
db.createCollection('sessions');
db.createCollection('verification_tokens');

// Add indexes for better query performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { sparse: true, unique: true });
db.users.createIndex({ platformId: 1 });
db.users.createIndex({ loginPlatform: 1 });

db.goals.createIndex({ userId: 1 });
db.goals.createIndex({ completed: 1 });
db.goals.createIndex({ category: 1 });
db.goals.createIndex({ priority: 1 });
db.goals.createIndex({ createdAt: -1 });

db.achievements.createIndex({ userId: 1 });
db.achievements.createIndex({ type: 1 });
db.achievements.createIndex({ rarity: 1 });

// NextAuth.js indexes
db.accounts.createIndex({ userId: 1 });
db.accounts.createIndex(
  { provider: 1, providerAccountId: 1 },
  { unique: true },
);

db.sessions.createIndex({ sessionToken: 1 }, { unique: true });
db.sessions.createIndex({ expires: 1 }, { expireAfterSeconds: 0 });

db.verification_tokens.createIndex({ token: 1 }, { unique: true });
db.verification_tokens.createIndex({ expires: 1 }, { expireAfterSeconds: 0 });

print('✅ Solo Leveling Database initialized successfully!');
print('📊 Collections created with performance indexes');
print('👤 Application user "soloapp" created with readWrite permissions');
