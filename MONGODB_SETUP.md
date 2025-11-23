# 🍃 MongoDB Setup Guide for Solo Leveling Dashboard

## 📋 **Quick Setup Options**

### **Option 1: MongoDB Atlas (Recommended - Free)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier)
4. Get your connection string
5. Replace `<password>` with your database user password

**Connection String Format:**

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/solo-leveling-db?retryWrites=true&w=majority
```

### **Option 2: Local MongoDB**

1. Download and install [MongoDB Community Edition](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Use local connection string:

```
mongodb://localhost:27017/solo-leveling-db
```

## 🔧 **Environment Variables**

Update your `.env.local` file:

```env
# MongoDB Connection
DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/solo-leveling-db?retryWrites=true&w=majority"

# NextAuth
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth
GITHUB_ID="your-github-app-id"
GITHUB_SECRET="your-github-app-secret"
```

## 🗄️ **Database Collections Structure**

### **👤 Users Collection (`users`)**

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  username: String (unique, optional),
  password: String (hashed, for email auth),
  loginPlatform: String, // "google", "github", "email"
  platformId: String, // Platform-specific ID
  level: Number (default: 1),
  totalPoints: Number (default: 0),
  rank: String (default: "E"),
  title: String (default: "Awakened Hunter"),
  joinedAt: Date,
  lastActive: Date,
  preferences: Object // JSON preferences
}
```

### **🎯 Goals Collection (`goals`)**

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  title: String,
  description: String,
  weight: Number, // 0-100 percentage
  points: Number,
  completed: Boolean (default: false),
  archived: Boolean (default: false),
  difficulty: String, // "easy", "medium", "hard"
  category: String, // "personal", "work", "health"
  priority: String, // "low", "medium", "high"
  tags: Array[String],
  createdAt: Date,
  completedAt: Date,
  updatedAt: Date
}
```

### **🏆 Achievements Collection (`achievements`)**

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  type: String, // "companion" or "item"
  name: String,
  description: String,
  iconPath: String,
  rarity: String, // "common", "rare", "epic", "legendary"
  category: String, // "combat", "exploration", "social"
  source: String, // "goal_completion", "points_milestone"
  pointsRequired: Number,
  requirements: Object, // JSON requirements
  rewards: Object, // JSON rewards
  unlockedAt: Date
}
```

### **🔐 NextAuth Collections**

- `accounts` - OAuth account linkings
- `sessions` - User sessions
- `verification_tokens` - Email verification tokens

## 🚀 **Setup Commands**

1. **Generate Prisma Client:**

```bash
npx prisma generate
```

2. **Push Schema to MongoDB:**

```bash
npx prisma db push
```

3. **View Database (Optional):**

```bash
npx prisma studio
```

## ✨ **Features Enabled**

### **🔍 Platform Tracking**

- Track which platform users signed up with
- Store platform-specific IDs
- Update last active timestamps

### **📊 Enhanced Goals**

- Categories and tags for organization
- Priority levels
- Automatic timestamp updates
- Rich metadata

### **🎮 Advanced Achievements**

- Rarity system
- Complex requirements (JSON)
- Reward system (JSON)
- Source tracking

### **⚙️ User Preferences**

- Stored as JSON for flexibility
- Theme, notifications, language
- Easily extensible

## 🔧 **Next Steps**

1. Set up your MongoDB database (Atlas recommended)
2. Update `.env.local` with your connection string
3. Run `npx prisma db push` to create collections
4. Test authentication and data storage
5. Your Solo Leveling dashboard is ready! 🎮

## 🆘 **Troubleshooting**

- **Connection issues**: Check your connection string and network access
- **Authentication errors**: Verify your database user permissions
- **Schema issues**: Run `npx prisma generate` after schema changes
- **Local MongoDB**: Ensure MongoDB service is running

Happy hunting! ⚔️✨
