# Gamification & Challenges

## Overview

The Gamification & Challenges system in CareerLeap is designed to increase user motivation and engagement through points, badges, leaderboards, and challenges. This document details the implementation, flow, and enhancement recommendations for the gamification features.

## Current Implementation

### Backend Implementation

#### Models

**Leaderboard Model** (`/skillforge-api/src/models/Leaderboard.js`)

Tracks user points and rankings:

```javascript
const leaderboardSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  points: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

// Index for efficient sorting by points
leaderboardSchema.index({ points: -1 });
```

**Badge Model** (`/skillforge-api/src/models/Badge.js`)

Defines available badges and tracks user achievements:

```javascript
const badgeSchema = new mongoose.Schema({
  badgeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  category: { type: String }, // e.g., 'points', 'streak', 'achievement'
  criteria: { type: mongoose.Schema.Types.Mixed } // Varies based on badge type
});

const userBadgeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  badgeId: { type: String, required: true },
  dateAwarded: { type: Date, default: Date.now }
});

// Compound index to ensure a user can only earn a badge once
userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });
```

**Challenge Model** (`/skillforge-api/src/models/Challenge.js`)

Defines challenges for users to complete:

```javascript
const challengeSchema = new mongoose.Schema({
  challengeId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true }, // 'daily', 'weekly', 'achievement'
  criteria: {
    action: { type: String }, // e.g., 'complete_lessons', 'earn_points', 'streak'
    target: { type: Number }, // Target value to achieve
    timeframe: { type: Number } // In days, if applicable
  },
  reward: {
    points: { type: Number },
    badgeId: { type: String }
  },
  startDate: { type: Date },
  endDate: { type: Date }
});

const userChallengeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  challengeId: { type: String, required: true },
  progress: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  dateCompleted: { type: Date }
});

// Compound index for efficient lookup
userChallengeSchema.index({ userId: 1, challengeId: 1 }, { unique: true });
```

**Squad Model** (`/skillforge-api/src/models/Squad.js`)

Defines teams for collaborative learning:

```javascript
const squadSchema = new mongoose.Schema({
  squadId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  createdBy: { type: String, required: true }, // userId of creator
  members: [{ type: String }], // Array of userIds
  totalPoints: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
```

#### Services

**Points Service** (`/skillforge-api/src/services/pointsService.js`)

Handles awarding points for various activities:

```javascript
async function awardPoints(userId, points, action) {
  try {
    // Update leaderboard with new points
    const leaderboard = await Leaderboard.findOneAndUpdate(
      { userId },
      { $inc: { points } },
      { upsert: true, new: true }
    );

    // Award badges based on point thresholds
    await checkAndAwardPointBadges(userId, leaderboard.points);
    
    // Award action-specific badges
    if (action === 'lesson_completed') {
      // Count completed lessons to award streak badges
      // This would be implemented with a more sophisticated tracking system
    }
    
    return leaderboard;
  } catch (error) {
    console.error('Error awarding points:', error);
    throw error;
  }
}

async function checkAndAwardPointBadges(userId, totalPoints) {
  try {
    // Point threshold badges
    if (totalPoints >= 100) {
      await awardBadge(userId, 'points_100', 'Century', 'Earned 100 points');
    }
    
    if (totalPoints >= 500) {
      await awardBadge(userId, 'points_500', 'High Achiever', 'Earned 500 points');
    }
    
    if (totalPoints >= 1000) {
      await awardBadge(userId, 'points_1000', 'Point Master', 'Earned 1000 points');
    }
  } catch (error) {
    console.error('Error checking point badges:', error);
    throw error;
  }
}
```

**Badge Service** (`/skillforge-api/src/services/badgeService.js`)

Handles badge awards and tracking:

```javascript
async function awardBadge(userId, badgeId, name, description) {
  try {
    // Check if badge exists
    let badge = await Badge.findOne({ badgeId });
    
    // Create badge if it doesn't exist
    if (!badge) {
      badge = await Badge.create({
        badgeId,
        name,
        description,
        imageUrl: `/assets/badges/${badgeId}.png`
      });
    }
    
    // Award badge to user if they don't already have it
    const userBadge = await UserBadge.findOneAndUpdate(
      { userId, badgeId },
      { userId, badgeId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    // If this is a new badge award (not an update), award points
    if (userBadge.isNew) {
      await awardPoints(userId, 50, 'badge_earned');
      
      // Send notification
      await notificationService.sendNotification(
        userId,
        'badge_earned',
        `You earned the ${name} badge!`,
        { badgeId, name }
      );
    }
    
    return userBadge;
  } catch (error) {
    console.error('Error awarding badge:', error);
    throw error;
  }
}

async function getUserBadges(userId) {
  try {
    const userBadges = await UserBadge.find({ userId }).sort({ dateAwarded: -1 });
    
    // Get full badge details
    const badgeIds = userBadges.map(ub => ub.badgeId);
    const badges = await Badge.find({ badgeId: { $in: badgeIds } });
    
    // Combine badge details with award dates
    return userBadges.map(userBadge => {
      const badge = badges.find(b => b.badgeId === userBadge.badgeId);
      return {
        ...badge.toObject(),
        dateAwarded: userBadge.dateAwarded
      };
    });
  } catch (error) {
    console.error('Error getting user badges:', error);
    throw error;
  }
}
```

**Challenge Service** (`/skillforge-api/src/services/challengeService.js`)

Handles challenge creation, progress tracking, and completion:

```javascript
async function createChallenge(challengeData) {
  try {
    const challenge = await Challenge.create(challengeData);
    return challenge;
  } catch (error) {
    console.error('Error creating challenge:', error);
    throw error;
  }
}

async function assignChallengeToUser(userId, challengeId) {
  try {
    const userChallenge = await UserChallenge.create({
      userId,
      challengeId,
      progress: 0,
      completed: false
    });
    return userChallenge;
  } catch (error) {
    console.error('Error assigning challenge:', error);
    throw error;
  }
}

async function updateChallengeProgress(userId, challengeId, increment) {
  try {
    // Get challenge details
    const challenge = await Challenge.findOne({ challengeId });
    if (!challenge) throw new Error('Challenge not found');
    
    // Update user's progress
    const userChallenge = await UserChallenge.findOne({ userId, challengeId });
    if (!userChallenge) throw new Error('User challenge not found');
    
    // Increment progress
    userChallenge.progress += increment;
    
    // Check if challenge is completed
    if (userChallenge.progress >= challenge.criteria.target && !userChallenge.completed) {
      userChallenge.completed = true;
      userChallenge.dateCompleted = Date.now();
      
      // Award points and badges
      if (challenge.reward.points) {
        await pointsService.awardPoints(userId, challenge.reward.points, 'challenge_completed');
      }
      
      if (challenge.reward.badgeId) {
        await badgeService.awardBadge(
          userId,
          challenge.reward.badgeId,
          `${challenge.title} Champion`,
          `Completed the ${challenge.title} challenge`
        );
      }
      
      // Send notification
      await notificationService.sendNotification(
        userId,
        'challenge_completed',
        `You completed the ${challenge.title} challenge!`,
        { challengeId, title: challenge.title }
      );
    }
    
    await userChallenge.save();
    return userChallenge;
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    throw error;
  }
}
```

### Frontend Implementation

#### Components

The gamification features are implemented across several frontend components:

1. **Badges Display** (`/skillforge-ui/src/app/features/badges`)
   - Shows earned badges
   - Displays badge details and criteria

2. **Leaderboard** (`/skillforge-ui/src/app/features/leaderboard`)
   - Displays user rankings based on points
   - Shows top performers

3. **Challenges** (`/skillforge-ui/src/app/features/challenges`)
   - Lists available and active challenges
   - Shows progress and rewards

4. **Squad Management** (`/skillforge-ui/src/app/features/squad`)
   - Team formation and management
   - Team leaderboard and achievements

#### Services

**Badge Service** (`/skillforge-ui/src/app/core/services/badges.service.ts`)

Handles badge-related API calls:

```typescript
@Injectable({
  providedIn: 'root'
})
export class BadgesService {
  constructor(private http: HttpClient) {}

  getUserBadges() {
    return this.http.get('/api/badges');
  }

  getBadgeDetails(badgeId: string) {
    return this.http.get(`/api/badges/${badgeId}`);
  }
}
```

**Leaderboard Service** (`/skillforge-ui/src/app/core/services/leaderboard.service.ts`)

Handles leaderboard-related API calls:

```typescript
@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  constructor(private http: HttpClient) {}

  getLeaderboard(limit: number = 10) {
    return this.http.get(`/api/leaderboard?limit=${limit}`);
  }

  getUserRank() {
    return this.http.get('/api/leaderboard/rank');
  }

  getSquadLeaderboard(limit: number = 10) {
    return this.http.get(`/api/leaderboard/squads?limit=${limit}`);
  }
}
```

**Challenge Service** (`/skillforge-ui/src/app/core/services/challenges.service.ts`)

Handles challenge-related API calls:

```typescript
@Injectable({
  providedIn: 'root'
})
export class ChallengesService {
  constructor(private http: HttpClient) {}

  getActiveChallenges() {
    return this.http.get('/api/challenges/active');
  }

  getChallengeDetails(challengeId: string) {
    return this.http.get(`/api/challenges/${challengeId}`);
  }

  getChallengeProgress(challengeId: string) {
    return this.http.get(`/api/challenges/${challengeId}/progress`);
  }
}
```

## Flow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ User Completes  │────▶│ Points Service  │────▶│ Leaderboard     │
│ Activity        │     │ Awards Points   │     │ Updated         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ User Notified   │◀────│ Badge Service   │◀────│ Point Thresholds│
│ of Achievement  │     │ Awards Badges   │     │ Checked         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
┌─────────────────┐     ┌─────────────────┐
│ Challenge       │◀────│ Challenge       │
│ Progress Updated│     │ Service         │
└─────────────────┘     └─────────────────┘
```

## Enhancement Recommendations

### Backend Enhancements

1. **Weekly Challenges System**
   - Implement automated weekly challenge generation
   - Create a notification system for new challenges

```javascript
// Add to Challenge model
const weeklyChallengeCycleSchema = new mongoose.Schema({
  cycleId: { type: String, required: true, unique: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  challenges: [{ type: String }], // Array of challengeIds
  theme: { type: String }
});

// Add to challengeService.js
async function generateWeeklyChallenges() {
  try {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    
    const cycleId = `weekly_${startDate.toISOString().split('T')[0]}`;
    
    // Generate 3-5 challenges for the week
    const challenges = [];
    
    // Example challenge types
    const challengeTypes = [
      { action: 'complete_lessons', target: 5, points: 100 },
      { action: 'earn_points', target: 200, points: 50 },
      { action: 'daily_streak', target: 5, points: 150 },
      { action: 'quiz_score', target: 90, points: 75 }
    ];
    
    // Randomly select 3 challenge types
    const selectedTypes = challengeTypes.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    for (const type of selectedTypes) {
      const challenge = await createChallenge({
        challengeId: `${cycleId}_${type.action}`,
        title: getChallengeTitle(type.action),
        description: getChallengeDescription(type.action, type.target),
        type: 'weekly',
        criteria: {
          action: type.action,
          target: type.target,
          timeframe: 7
        },
        reward: {
          points: type.points,
          badgeId: `weekly_${type.action}`
        },
        startDate,
        endDate
      });
      
      challenges.push(challenge.challengeId);
    }
    
    // Create the weekly cycle
    const cycle = await WeeklyChallengeCycle.create({
      cycleId,
      startDate,
      endDate,
      challenges,
      theme: getRandomTheme()
    });
    
    // Assign challenges to all active users
    const activeUsers = await getActiveUsers();
    for (const userId of activeUsers) {
      for (const challengeId of challenges) {
        await assignChallengeToUser(userId, challengeId);
      }
      
      // Send notification about new weekly challenges
      await notificationService.sendNotification(
        userId,
        'weekly_challenges',
        'New weekly challenges are available!',
        { cycleId, challengeCount: challenges.length }
      );
    }
    
    return cycle;
  } catch (error) {
    console.error('Error generating weekly challenges:', error);
    throw error;
  }
}
```

2. **Team-Based Competitions**
   - Enhance the Squad model to support team competitions
   - Implement team challenges and rewards

```javascript
// Add to Squad model
competitions: [{
  competitionId: { type: String },
  score: { type: Number, default: 0 },
  rank: { type: Number },
  rewards: {
    points: { type: Number },
    badgeId: { type: String }
  }
}];

// New model: Competition.js
const competitionSchema = new mongoose.Schema({
  competitionId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  type: { type: String, enum: ['points', 'lessons', 'custom'] },
  status: { type: String, enum: ['upcoming', 'active', 'completed'], default: 'upcoming' },
  participants: [{
    squadId: { type: String },
    score: { type: Number, default: 0 }
  }],
  rewards: [{
    rank: { type: Number }, // 1 for first place, 2 for second, etc.
    points: { type: Number },
    badgeId: { type: String }
  }]
});
```

3. **Achievement Paths and Streaks**
   - Implement a more sophisticated streak tracking system
   - Create achievement paths with progressive challenges

```javascript
// New model: Streak.js
const streakSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, required: true }, // 'daily_login', 'lesson_completion', etc.
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActivity: { type: Date },
  streakHistory: [{
    date: { type: Date },
    action: { type: String }
  }]
});

// New model: AchievementPath.js
const achievementPathSchema = new mongoose.Schema({
  pathId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  levels: [{
    level: { type: Number },
    name: { type: String },
    criteria: {
      action: { type: String },
      target: { type: Number }
    },
    reward: {
      points: { type: Number },
      badgeId: { type: String }
    }
  }]
});

const userAchievementPathSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  pathId: { type: String, required: true },
  currentLevel: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  dateStarted: { type: Date, default: Date.now },
  dateCompleted: { type: Date }
});
```

4. **Virtual Rewards System**
   - Implement a virtual currency that can be earned through activities
   - Create a marketplace for redeeming rewards

```javascript
// New model: VirtualCurrency.js
const virtualCurrencySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  transactions: [{
    date: { type: Date, default: Date.now },
    amount: { type: Number },
    type: { type: String, enum: ['earned', 'spent'] },
    description: { type: String }
  }]
});

// New model: RewardItem.js
const rewardItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String }, // 'premium_content', 'customization', 'feature'
  cost: { type: Number, required: true },
  imageUrl: { type: String },
  availability: {
    isAvailable: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
    quantity: { type: Number } // Limited quantity if applicable
  }
});

const userRewardItemSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  itemId: { type: String, required: true },
  datePurchased: { type: Date, default: Date.now },
  isUsed: { type: Boolean, default: false },
  dateUsed: { type: Date }
});
```

### Frontend Enhancements

1. **Weekly Challenge Hub**
   - Create a dedicated interface for weekly challenges
   - Implement countdown timers for challenge expiration
   - Show leaderboards specific to weekly challenges

2. **Team Competition Dashboard**
   - Develop a team dashboard showing competition standings
   - Implement real-time updates for team scores
   - Create visualizations for team contributions

3. **Achievement Path Visualization**
   - Create a visual progression path for achievements
   - Implement milestone celebrations with animations
   - Show progress indicators for each achievement level

4. **Reward Marketplace**
   - Design an interface for browsing available rewards
   - Implement purchase and redemption flows
   - Show transaction history and balance

5. **Personalized Gamification Dashboard**
   - Create a personalized dashboard showing achievements, streaks, and challenges
   - Implement recommendations for challenges based on user interests
   - Show progress comparisons with similar users

## Integration Points

1. **Lesson System**
   - Lesson completion triggers point awards
   - Quiz performance affects challenge progress

2. **Adaptive Engine**
   - Challenges can be tailored based on user performance
   - Achievement paths can adapt to user skill level

3. **Notification System**
   - Notifications for badge awards, challenge completions, and team updates
   - Reminders for streak maintenance

4. **Social Features**
   - Share achievements and badges on social platforms
   - Team formation and competition participation

## Testing Strategy

1. **Unit Tests**
   - Test point award calculations
   - Test badge award conditions
   - Test challenge progress tracking

2. **Integration Tests**
   - Test end-to-end flow from activity completion to rewards
   - Test team competition scoring
   - Test streak maintenance and breaking

3. **User Testing**
   - Evaluate engagement impact of gamification features
   - Test user understanding of achievement paths
   - Measure motivation increase from challenges

## Security Considerations

1. **Anti-Cheating Measures**
   - Implement rate limiting for point-earning activities
   - Add server-side validation for challenge completion
   - Monitor for suspicious activity patterns

2. **Fair Competition**
   - Ensure team competitions are balanced
   - Implement matchmaking for similar skill levels
   - Prevent exploitation of point systems

## Performance Considerations

1. **Leaderboard Optimization**
   - Implement efficient sorting and pagination for leaderboards
   - Cache frequently accessed leaderboard data
   - Use background processing for leaderboard updates

2. **Notification Efficiency**
   - Batch process notifications for gamification events
   - Implement push notification throttling

## Conclusion

The Gamification & Challenges system is a powerful tool for increasing user engagement and motivation in CareerLeap. By implementing the recommended enhancements, the platform can create a more compelling, social, and rewarding experience that encourages consistent learning and skill development.