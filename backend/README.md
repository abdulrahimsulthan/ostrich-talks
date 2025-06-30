# Ostrich Talks Backend API

A comprehensive Node.js/Express/MongoDB backend for the Ostrich Talks mobile learning application.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with Firebase integration
- **User Management**: Profile, settings, social features (follow/unfollow)
- **Lesson System**: Content management, progress tracking, recommendations
- **Gamification**: XP, feathers, streaks, levels, leagues
- **Progress Tracking**: Detailed analytics and statistics
- **Quest System**: Daily/weekly challenges and achievements
- **League System**: Competitive leaderboards and rankings
- **Social Features**: User discovery, following system
- **Security**: Rate limiting, input validation, error handling

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/ostrich-talks
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Firebase Authentication
```http
POST /api/auth/firebase
Content-Type: application/json

{
  "firebaseUid": "firebase_user_id",
  "email": "john@example.com",
  "name": "John Doe",
  "profileUri": "https://example.com/avatar.jpg"
}
```

### User Endpoints

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "bio": "Learning enthusiast",
  "profileUri": "https://example.com/new-avatar.jpg"
}
```

#### Get User Statistics
```http
GET /api/users/stats
Authorization: Bearer <token>
```

### Lesson Endpoints

#### Get All Lessons
```http
GET /api/lessons?type=vocabulary&category=beginner&difficulty=1
Authorization: Bearer <token>
```

#### Get Recommended Lessons
```http
GET /api/lessons/recommended?limit=10
Authorization: Bearer <token>
```

#### Start Lesson
```http
POST /api/lessons/:lessonId/start
Authorization: Bearer <token>
```

#### Submit Lesson Answers
```http
POST /api/lessons/:lessonId/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [
    {
      "exerciseIndex": 0,
      "userAnswer": "correct answer"
    }
  ],
  "timeSpent": 120
}
```

### Progress Endpoints

#### Get Progress Overview
```http
GET /api/progress?status=completed&page=1&limit=20
Authorization: Bearer <token>
```

#### Get Detailed Statistics
```http
GET /api/progress/stats?period=week
Authorization: Bearer <token>
```

#### Sync Progress
```http
POST /api/progress/sync
Authorization: Bearer <token>
Content-Type: application/json

{
  "progressData": [
    {
      "lessonId": "lesson_id",
      "status": "completed",
      "score": 85,
      "timeSpent": 300
    }
  ]
}
```

### League Endpoints

#### Get Leaderboard
```http
GET /api/leagues/leaderboard?league=Gold&page=1&limit=50
Authorization: Bearer <token>
```

#### Get Current League Info
```http
GET /api/leagues/current
Authorization: Bearer <token>
```

#### Update League Points
```http
POST /api/leagues/update-points
Authorization: Bearer <token>
Content-Type: application/json

{
  "points": 100,
  "lessonScore": 85
}
```

### Quest Endpoints

#### Get Daily Quests
```http
GET /api/quests/daily
Authorization: Bearer <token>
```

#### Get Weekly Quests
```http
GET /api/quests/weekly
Authorization: Bearer <token>
```

#### Claim Quest Reward
```http
POST /api/quests/claim/:questId
Authorization: Bearer <token>
```

#### Get Achievements
```http
GET /api/quests/achievements
Authorization: Bearer <token>
```

## 🗄️ Database Models

### User Model
- Basic info (name, email, password)
- Profile data (bio, avatar)
- App stats (XP, feathers, level, streak)
- League info (league, points, week)
- Social connections (followers, following)
- Settings and preferences

### Lesson Model
- Content (title, description, exercises)
- Metadata (type, category, difficulty)
- Media (audio, video, images)
- Rewards (XP, feathers)
- Prerequisites and dependencies

### Progress Model
- User-lesson relationship
- Performance metrics (score, time, mistakes)
- Exercise results
- Completion status and timestamps
- Rewards earned

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Token expiration | 7d |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

### Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: Express-validator for all inputs
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Compression**: Response compression for better performance

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📦 Deployment

### Production Setup

1. **Environment Configuration**
   ```bash
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ostrich-talks
   JWT_SECRET=your-production-secret
   ```

2. **Build and Start**
   ```bash
   npm install --production
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔄 API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Error details (development only)"
}
```

## 📱 Mobile App Integration

The backend is designed to work seamlessly with the Ostrich Talks mobile app:

1. **Authentication**: JWT tokens for session management
2. **Real-time Sync**: Progress synchronization between devices
3. **Offline Support**: Queue-based sync for offline operations
4. **Push Notifications**: Firebase integration for notifications
5. **Social Features**: User discovery and following system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation

---

**Ostrich Talks Backend** - Empowering language learning through gamification and social features. 