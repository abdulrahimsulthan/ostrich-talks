# Ostrich Talks - Language Learning Platform

A comprehensive language learning platform with a React Native mobile app and Node.js/Express backend API.

## 🏗️ Project Structure

```
ostrich-talks/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── models/         # MongoDB/Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   └── server.js       # Main server file
│   ├── package.json
│   └── README.md
├── mobile/                  # React Native/Expo app
│   ├── app/                # Expo Router pages
│   ├── components/         # Reusable components
│   ├── store/              # Zustand state management
│   ├── types/              # TypeScript interfaces
│   ├── package.json
│   └── README.md
├── package.json            # Root monorepo config
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **MongoDB** (local or cloud)
- **Expo CLI** (for mobile development)
- **iOS Simulator** or **Android Emulator** (for mobile testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ostrich-talks.git
   cd ostrich-talks
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Backend
   cp backend/env.example backend/.env
   # Edit backend/.env with your configuration
   
   # Mobile (if needed)
   cp mobile/env.example mobile/.env
   # Edit mobile/.env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Start both backend and mobile
   npm run dev
   
   # Or start individually
   npm run dev:backend    # Backend only
   npm run dev:mobile     # Mobile only
   ```

## 📱 Mobile App (ostrich-talks-mobile)

### Features

- **Authentication**: Firebase Auth integration
- **Gamification**: XP, feathers, streaks, levels
- **Social Features**: User profiles, following system
- **Progress Tracking**: Detailed learning analytics
- **Offline Support**: Offline-first with sync
- **Push Notifications**: Firebase Cloud Messaging

### Tech Stack

- **React Native** with **Expo**
- **TypeScript** for type safety
- **Expo Router** for navigation
- **Zustand** for state management
- **NativeWind** (Tailwind CSS for React Native)
- **Firebase** for authentication and notifications

### Development

```bash
cd mobile

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run tests
npm test

# Lint code
npm run lint
```

### Environment Setup

Create a `.env` file in the `mobile/` directory:

```env
# API Configuration
API_BASE_URL=http://localhost:5000/api

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

## 🔧 Backend API (ostrich-talks-api)

### Features

- **RESTful API** with Express.js
- **Authentication**: JWT + Firebase integration
- **Database**: MongoDB with Mongoose ODM
- **Security**: Rate limiting, input validation, CORS
- **Gamification**: XP, feathers, streaks, leagues
- **Social Features**: User management, following system
- **Progress Tracking**: Comprehensive analytics

### Tech Stack

- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **Firebase Admin SDK** for Firebase integration
- **Express Validator** for input validation
- **Helmet** for security headers

### Development

```bash
cd backend

# Start development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Environment Setup

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ostrich-talks

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  profileUri: String,
  bio: String,
  firebaseUid: String,
  level: Number,
  xp: Number,
  feathers: Number,
  willPower: Number,
  streak: Number,
  streakLevel: Number,
  league: String,
  leaguePoints: Number,
  followers: [ObjectId],
  following: [ObjectId],
  settings: {
    notifications: Boolean,
    soundEnabled: Boolean,
    language: String,
    theme: String
  },
  joined: Date,
  lastActive: Date
}
```

### Lessons Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  content: String,
  type: String,
  category: String,
  difficulty: Number,
  estimatedDuration: Number,
  exercises: [{
    type: String,
    question: String,
    options: [String],
    correctAnswer: String,
    explanation: String,
    points: Number
  }],
  xpReward: Number,
  featherReward: Number,
  isActive: Boolean,
  isPremium: Boolean,
  createdBy: ObjectId,
  createdAt: Date
}
```

### Progress Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId,
  lesson: ObjectId,
  status: String,
  score: Number,
  mistakes: Number,
  timeSpent: Number,
  exerciseResults: [{
    exerciseIndex: Number,
    isCorrect: Boolean,
    userAnswer: String,
    correctAnswer: String,
    timeSpent: Number,
    points: Number
  }],
  xpEarned: Number,
  feathersEarned: Number,
  startedAt: Date,
  completedAt: Date
}
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/firebase` - Firebase authentication
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/stats` - Get user statistics
- `PUT /api/users/settings` - Update settings
- `POST /api/users/follow/:userId` - Follow user
- `DELETE /api/users/follow/:userId` - Unfollow user

### Lessons
- `GET /api/lessons` - Get all lessons
- `GET /api/lessons/recommended` - Get recommended lessons
- `GET /api/lessons/:lessonId` - Get lesson details
- `POST /api/lessons/:lessonId/start` - Start lesson
- `POST /api/lessons/:lessonId/submit` - Submit lesson answers

### Progress
- `GET /api/progress` - Get progress overview
- `GET /api/progress/stats` - Get detailed statistics
- `GET /api/progress/streak` - Get streak information
- `POST /api/progress/sync` - Sync progress data

### Leagues
- `GET /api/leagues/leaderboard` - Get leaderboard
- `GET /api/leagues/current` - Get current league info
- `POST /api/leagues/update-points` - Update league points

### Quests
- `GET /api/quests/daily` - Get daily quests
- `GET /api/quests/weekly` - Get weekly quests
- `POST /api/quests/claim/:questId` - Claim quest reward
- `GET /api/quests/achievements` - Get achievements

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Mobile Tests
```bash
cd mobile
npm test
```

### Run All Tests
```bash
npm test
```

## 📦 Building for Production

### Backend
```bash
cd backend
npm start
```

### Mobile
```bash
cd mobile
npm run build
```

## 🚀 Deployment

### Backend Deployment

1. **Environment Setup**
   ```bash
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ostrich-talks
   JWT_SECRET=your-production-secret
   ```

2. **Deploy to Platform**
   - **Heroku**: `git push heroku main`
   - **Vercel**: `vercel --prod`
   - **Railway**: `railway up`

### Mobile Deployment

1. **Build for Stores**
   ```bash
   cd mobile
   eas build --platform all
   ```

2. **Submit to Stores**
   ```bash
   eas submit --platform all
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation in `backend/README.md`

## 🔗 Links

- **Backend API Documentation**: [backend/README.md](backend/README.md)
- **Mobile App Documentation**: [mobile/README.md](mobile/README.md)
- **API Base URL**: `http://localhost:5000/api` (development)

---

**Ostrich Talks** - Empowering language learning through gamification and social features. 