# Community & Social Features

## Overview

The Community & Social Features in CareerLeap foster collaborative learning, knowledge sharing, and social engagement among users. These features enable users to connect with peers, participate in discussions, share achievements, and collaborate on learning goals, creating a supportive learning community that enhances motivation and knowledge retention.

## Current Implementation

### Backend Implementation

#### Models

**User Connection Model** (`/skillforge-api/src/models/UserConnection.js`)

Manages connections between users:

```javascript
const userConnectionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  connectedUserId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'blocked'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index to ensure uniqueness and efficient lookup
userConnectionSchema.index({ userId: 1, connectedUserId: 1 }, { unique: true });
```

**Discussion Model** (`/skillforge-api/src/models/Discussion.js`)

Manages forum discussions and comments:

```javascript
const commentSchema = new mongoose.Schema({
  commentId: { type: String, required: true },
  userId: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  likes: [{ type: String }] // Array of userIds who liked the comment
});

const discussionSchema = new mongoose.Schema({
  discussionId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  userId: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  likes: [{ type: String }], // Array of userIds who liked the discussion
  comments: [commentSchema],
  views: { type: Number, default: 0 }
});

// Indexes for efficient querying
discussionSchema.index({ category: 1, createdAt: -1 });
discussionSchema.index({ tags: 1 });
discussionSchema.index({ userId: 1 });
```

**Activity Feed Model** (`/skillforge-api/src/models/ActivityFeed.js`)

Tracks user activities for the social feed:

```javascript
const activitySchema = new mongoose.Schema({
  activityId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  type: { type: String, required: true }, // 'lesson_completed', 'badge_earned', 'discussion_posted', etc.
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
  visibility: { type: String, enum: ['public', 'connections', 'private'], default: 'public' },
  likes: [{ type: String }], // Array of userIds who liked the activity
  comments: [{
    userId: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
});

// Indexes for efficient querying
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ createdAt: -1 });
```

**Notification Model** (`/skillforge-api/src/models/Notification.js`)

Manages user notifications:

```javascript
const notificationSchema = new mongoose.Schema({
  notificationId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  type: { type: String, required: true }, // 'connection_request', 'comment', 'like', etc.
  content: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed }, // Additional data related to the notification
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for efficient querying
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
```

#### Services

**Connection Service** (`/skillforge-api/src/services/connectionService.js`)

Handles user connections and requests:

```javascript
const UserConnection = require('../models/UserConnection');
const UserProfile = require('../models/UserProfile');
const notificationService = require('./notificationService');
const { v4: uuidv4 } = require('uuid');

async function sendConnectionRequest(userId, targetUserId) {
  try {
    // Check if users exist
    const [userProfile, targetProfile] = await Promise.all([
      UserProfile.findOne({ userId }),
      UserProfile.findOne({ userId: targetUserId })
    ]);
    
    if (!userProfile || !targetProfile) {
      throw new Error('One or both users not found');
    }
    
    // Check if connection already exists
    const existingConnection = await UserConnection.findOne({
      $or: [
        { userId, connectedUserId: targetUserId },
        { userId: targetUserId, connectedUserId: userId }
      ]
    });
    
    if (existingConnection) {
      throw new Error('Connection already exists');
    }
    
    // Create connection request
    const connection = await UserConnection.create({
      userId,
      connectedUserId: targetUserId,
      status: 'pending'
    });
    
    // Send notification to target user
    await notificationService.sendNotification(
      targetUserId,
      'connection_request',
      `${userProfile.fullName} sent you a connection request`,
      { requesterId: userId, requesterName: userProfile.fullName }
    );
    
    return connection;
  } catch (error) {
    console.error('Error sending connection request:', error);
    throw error;
  }
}

async function respondToConnectionRequest(userId, requesterId, accept) {
  try {
    // Find the connection request
    const connectionRequest = await UserConnection.findOne({
      userId: requesterId,
      connectedUserId: userId,
      status: 'pending'
    });
    
    if (!connectionRequest) {
      throw new Error('Connection request not found');
    }
    
    // Update the status
    connectionRequest.status = accept ? 'accepted' : 'rejected';
    connectionRequest.updatedAt = Date.now();
    await connectionRequest.save();
    
    // If accepted, create the reverse connection
    if (accept) {
      await UserConnection.findOneAndUpdate(
        { userId, connectedUserId: requesterId },
        {
          userId,
          connectedUserId: requesterId,
          status: 'accepted',
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        { upsert: true, new: true }
      );
      
      // Get user profiles for notification
      const userProfile = await UserProfile.findOne({ userId });
      
      // Send notification to requester
      await notificationService.sendNotification(
        requesterId,
        'connection_accepted',
        `${userProfile.fullName} accepted your connection request`,
        { accepterId: userId, accepterName: userProfile.fullName }
      );
    }
    
    return connectionRequest;
  } catch (error) {
    console.error('Error responding to connection request:', error);
    throw error;
  }
}

async function getUserConnections(userId, status = 'accepted') {
  try {
    // Find all connections for the user with the specified status
    const connections = await UserConnection.find({
      userId,
      status
    });
    
    // Get the connected user IDs
    const connectedUserIds = connections.map(conn => conn.connectedUserId);
    
    // Get the user profiles for the connected users
    const connectedProfiles = await UserProfile.find({
      userId: { $in: connectedUserIds }
    });
    
    // Map the profiles to a more usable format
    return connectedProfiles.map(profile => ({
      userId: profile.userId,
      fullName: profile.fullName,
      email: profile.email,
      occupation: profile.occupation,
      company: profile.company,
      skills: profile.skills,
      connectionDate: connections.find(conn => conn.connectedUserId === profile.userId)?.createdAt
    }));
  } catch (error) {
    console.error('Error getting user connections:', error);
    throw error;
  }
}

module.exports = {
  sendConnectionRequest,
  respondToConnectionRequest,
  getUserConnections
};
```

**Discussion Service** (`/skillforge-api/src/services/discussionService.js`)

Handles forum discussions and comments:

```javascript
const Discussion = require('../models/Discussion');
const UserProfile = require('../models/UserProfile');
const notificationService = require('./notificationService');
const activityService = require('./activityService');
const { v4: uuidv4 } = require('uuid');

async function createDiscussion(userId, discussionData) {
  try {
    const discussionId = uuidv4();
    
    // Create the discussion
    const discussion = await Discussion.create({
      discussionId,
      userId,
      title: discussionData.title,
      content: discussionData.content,
      category: discussionData.category,
      tags: discussionData.tags || []
    });
    
    // Create activity for the user's feed
    await activityService.createActivity(userId, 'discussion_posted', {
      discussionId,
      title: discussionData.title,
      category: discussionData.category
    });
    
    return discussion;
  } catch (error) {
    console.error('Error creating discussion:', error);
    throw error;
  }
}

async function getDiscussions(filters = {}, page = 1, limit = 10) {
  try {
    const query = {};
    
    // Apply filters
    if (filters.category) query.category = filters.category;
    if (filters.tags && filters.tags.length > 0) query.tags = { $in: filters.tags };
    if (filters.userId) query.userId = filters.userId;
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Get discussions with pagination
    const discussions = await Discussion.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Discussion.countDocuments(query);
    
    // Get user profiles for the discussion authors
    const userIds = [...new Set(discussions.map(d => d.userId))];
    const userProfiles = await UserProfile.find({ userId: { $in: userIds } });
    
    // Map discussions with author information
    const discussionsWithAuthors = discussions.map(discussion => {
      const author = userProfiles.find(p => p.userId === discussion.userId);
      return {
        ...discussion.toObject(),
        author: author ? {
          userId: author.userId,
          fullName: author.fullName,
          occupation: author.occupation
        } : null,
        commentCount: discussion.comments.length
      };
    });
    
    return {
      discussions: discussionsWithAuthors,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error getting discussions:', error);
    throw error;
  }
}

async function addComment(userId, discussionId, content) {
  try {
    const commentId = uuidv4();
    
    // Find the discussion
    const discussion = await Discussion.findOne({ discussionId });
    if (!discussion) {
      throw new Error('Discussion not found');
    }
    
    // Add the comment
    discussion.comments.push({
      commentId,
      userId,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      likes: []
    });
    
    discussion.updatedAt = Date.now();
    await discussion.save();
    
    // Get user profile for notification
    const userProfile = await UserProfile.findOne({ userId });
    
    // Notify the discussion author if it's not their own comment
    if (discussion.userId !== userId) {
      await notificationService.sendNotification(
        discussion.userId,
        'discussion_comment',
        `${userProfile.fullName} commented on your discussion`,
        {
          discussionId,
          discussionTitle: discussion.title,
          commenterId: userId,
          commenterName: userProfile.fullName
        }
      );
    }
    
    // Create activity for the user's feed
    await activityService.createActivity(userId, 'comment_posted', {
      discussionId,
      discussionTitle: discussion.title,
      commentId
    });
    
    return discussion;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

module.exports = {
  createDiscussion,
  getDiscussions,
  addComment
};
```

**Activity Feed Service** (`/skillforge-api/src/services/activityService.js`)

Handles user activity feeds:

```javascript
const ActivityFeed = require('../models/ActivityFeed');
const UserConnection = require('../models/UserConnection');
const { v4: uuidv4 } = require('uuid');

async function createActivity(userId, type, content, visibility = 'public') {
  try {
    const activityId = uuidv4();
    
    const activity = await ActivityFeed.create({
      activityId,
      userId,
      type,
      content,
      visibility,
      likes: [],
      comments: []
    });
    
    return activity;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
}

async function getUserFeed(userId, page = 1, limit = 20) {
  try {
    // Get user's connections
    const connections = await UserConnection.find({
      userId,
      status: 'accepted'
    });
    
    const connectedUserIds = connections.map(conn => conn.connectedUserId);
    
    // Query for activities from the user and their connections
    const query = {
      $or: [
        { userId }, // User's own activities
        { 
          userId: { $in: connectedUserIds }, // Connected users' activities
          visibility: { $in: ['public', 'connections'] } 
        },
        { 
          visibility: 'public' // Public activities from other users
        }
      ]
    };
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Get activities with pagination
    const activities = await ActivityFeed.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await ActivityFeed.countDocuments(query);
    
    return {
      activities,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error getting user feed:', error);
    throw error;
  }
}

async function likeActivity(userId, activityId) {
  try {
    // Find the activity
    const activity = await ActivityFeed.findOne({ activityId });
    if (!activity) {
      throw new Error('Activity not found');
    }
    
    // Check if user already liked the activity
    if (activity.likes.includes(userId)) {
      return activity; // Already liked
    }
    
    // Add the like
    activity.likes.push(userId);
    await activity.save();
    
    return activity;
  } catch (error) {
    console.error('Error liking activity:', error);
    throw error;
  }
}

module.exports = {
  createActivity,
  getUserFeed,
  likeActivity
};
```

**Notification Service** (`/skillforge-api/src/services/notificationService.js`)

Handles user notifications:

```javascript
const Notification = require('../models/Notification');
const { v4: uuidv4 } = require('uuid');

async function sendNotification(userId, type, content, data = {}) {
  try {
    const notificationId = uuidv4();
    
    const notification = await Notification.create({
      notificationId,
      userId,
      type,
      content,
      data,
      isRead: false
    });
    
    // In a real implementation, this would also trigger a real-time notification
    // via WebSockets or similar technology
    
    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

async function getUserNotifications(userId, page = 1, limit = 20, unreadOnly = false) {
  try {
    const query = { userId };
    
    if (unreadOnly) {
      query.isRead = false;
    }
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Get notifications with pagination
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Notification.countDocuments(query);
    
    // Get unread count
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });
    
    return {
      notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
}

async function markNotificationAsRead(userId, notificationId) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { notificationId, userId },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

async function markAllNotificationsAsRead(userId) {
  try {
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    
    return { updatedCount: result.nModified };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

module.exports = {
  sendNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
};
```

### Frontend Implementation

#### Components

1. **User Connections** (`/skillforge-ui/src/app/features/connections`)
   - Connection requests and management
   - User search and discovery
   - Connection profiles

2. **Discussion Forum** (`/skillforge-ui/src/app/features/discussions`)
   - Topic-based discussions
   - Comment threads
   - Search and filtering

3. **Activity Feed** (`/skillforge-ui/src/app/features/feed`)
   - Social feed of user activities
   - Like and comment functionality
   - Activity sharing

4. **Notifications** (`/skillforge-ui/src/app/features/notifications`)
   - Notification center
   - Real-time notifications
   - Notification preferences

#### Services

**Connection Service** (`/skillforge-ui/src/app/core/services/connection.service.ts`)

Handles user connections API calls:

```typescript
@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  constructor(private http: HttpClient) {}

  sendConnectionRequest(targetUserId: string) {
    return this.http.post('/api/connections/request', { targetUserId });
  }

  respondToConnectionRequest(requesterId: string, accept: boolean) {
    return this.http.post('/api/connections/respond', { requesterId, accept });
  }

  getUserConnections(status: string = 'accepted') {
    return this.http.get(`/api/connections?status=${status}`);
  }

  searchUsers(query: string) {
    return this.http.get(`/api/users/search?q=${encodeURIComponent(query)}`);
  }

  getConnectionSuggestions() {
    return this.http.get('/api/connections/suggestions');
  }
}
```

**Discussion Service** (`/skillforge-ui/src/app/core/services/discussion.service.ts`)

Handles discussion forum API calls:

```typescript
@Injectable({
  providedIn: 'root'
})
export class DiscussionService {
  constructor(private http: HttpClient) {}

  createDiscussion(discussionData: any) {
    return this.http.post('/api/discussions', discussionData);
  }

  getDiscussions(filters: any = {}, page: number = 1, limit: number = 10) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (filters.category) params = params.set('category', filters.category);
    if (filters.tags) params = params.set('tags', filters.tags.join(','));
    if (filters.userId) params = params.set('userId', filters.userId);
    
    return this.http.get('/api/discussions', { params });
  }

  getDiscussionById(discussionId: string) {
    return this.http.get(`/api/discussions/${discussionId}`);
  }

  addComment(discussionId: string, content: string) {
    return this.http.post(`/api/discussions/${discussionId}/comments`, { content });
  }

  likeDiscussion(discussionId: string) {
    return this.http.post(`/api/discussions/${discussionId}/like`, {});
  }

  likeComment(discussionId: string, commentId: string) {
    return this.http.post(`/api/discussions/${discussionId}/comments/${commentId}/like`, {});
  }
}
```

**Activity Feed Service** (`/skillforge-ui/src/app/core/services/activity-feed.service.ts`)

Handles activity feed API calls:

```typescript
@Injectable({
  providedIn: 'root'
})
export class ActivityFeedService {
  constructor(private http: HttpClient) {}

  getUserFeed(page: number = 1, limit: number = 20) {
    return this.http.get(`/api/feed?page=${page}&limit=${limit}`);
  }

  likeActivity(activityId: string) {
    return this.http.post(`/api/feed/${activityId}/like`, {});
  }

  commentOnActivity(activityId: string, content: string) {
    return this.http.post(`/api/feed/${activityId}/comments`, { content });
  }

  shareActivity(activityId: string, message: string = '') {
    return this.http.post(`/api/feed/${activityId}/share`, { message });
  }
}
```

**Notification Service** (`/skillforge-ui/src/app/core/services/notification.service.ts`)

Handles notifications API calls and real-time updates:

```typescript
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<any[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private socket: any; // WebSocket connection

  notifications$ = this.notificationSubject.asObservable();
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeWebSocket();
  }

  private initializeWebSocket() {
    // In a real implementation, this would connect to a WebSocket server
    // for real-time notifications
    console.log('WebSocket would be initialized here');
  }

  getNotifications(page: number = 1, limit: number = 20, unreadOnly: boolean = false) {
    return this.http.get(`/api/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`)
      .pipe(
        tap((response: any) => {
          this.notificationSubject.next(response.notifications);
          this.unreadCountSubject.next(response.unreadCount);
        })
      );
  }

  markAsRead(notificationId: string) {
    return this.http.put(`/api/notifications/${notificationId}/read`, {})
      .pipe(
        tap(() => {
          // Update the local state
          const currentNotifications = this.notificationSubject.value;
          const updatedNotifications = currentNotifications.map(notification => {
            if (notification.notificationId === notificationId) {
              return { ...notification, isRead: true };
            }
            return notification;
          });
          
          this.notificationSubject.next(updatedNotifications);
          this.unreadCountSubject.next(this.unreadCountSubject.value - 1);
        })
      );
  }

  markAllAsRead() {
    return this.http.put('/api/notifications/read-all', {})
      .pipe(
        tap(() => {
          // Update the local state
          const currentNotifications = this.notificationSubject.value;
          const updatedNotifications = currentNotifications.map(notification => {
            return { ...notification, isRead: true };
          });
          
          this.notificationSubject.next(updatedNotifications);
          this.unreadCountSubject.next(0);
        })
      );
  }
}
```

## Flow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ User Completes  │────▶│ Activity        │────▶│ Activity Added  │
│ Action          │     │ Service         │     │ to Feed         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Connections     │◀────│ Feed Filtered   │◀────│ User Views      │
│ See Activity    │     │ by Visibility   │     │ Activity Feed   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │
        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ User Interacts  │────▶│ Notification    │────▶│ Real-time        │
│ (Like, Comment) │     │ Generated       │     │ Updates          │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Enhancement Recommendations

### Backend Enhancements

1. **Advanced User Matching System**
   - Implement an algorithm to suggest connections based on skills, goals, and learning paths
   - Add skill-based filtering for connection suggestions

```javascript
// Add to connectionService.js
async function getConnectionSuggestions(userId, limit = 10) {
  try {
    // Get user profile
    const userProfile = await UserProfile.findOne({ userId });
    if (!userProfile) {
      throw new Error('User profile not found');
    }
    
    // Get user's existing connections
    const existingConnections = await UserConnection.find({
      $or: [
        { userId, status: { $in: ['pending', 'accepted'] } },
        { connectedUserId: userId, status: { $in: ['pending', 'accepted'] } }
      ]
    });
    
    const connectedUserIds = existingConnections.map(conn => 
      conn.userId === userId ? conn.connectedUserId : conn.userId
    );
    
    // Add the user's own ID to exclude from results
    connectedUserIds.push(userId);
    
    // Build query for matching users
    const matchQuery = {
      userId: { $nin: connectedUserIds } // Exclude existing connections and self
    };
    
    // Match by skills if available
    if (userProfile.skills && userProfile.skills.length > 0) {
      matchQuery['skills.name'] = { $in: userProfile.skills.map(s => s.name) };
    }
    
    // Match by learning goal if available
    if (userProfile.learningGoal) {
      matchQuery.learningGoal = userProfile.learningGoal;
    }
    
    // Find matching users
    const matchingUsers = await UserProfile.find(matchQuery).limit(limit * 2);
    
    // Calculate match score for each user
    const scoredMatches = matchingUsers.map(match => {
      let score = 0;
      
      // Score based on common skills
      if (userProfile.skills && match.skills) {
        const userSkillNames = userProfile.skills.map(s => s.name);
        const matchSkillNames = match.skills.map(s => s.name);
        
        const commonSkills = userSkillNames.filter(skill => matchSkillNames.includes(skill));
        score += commonSkills.length * 10;
      }
      
      // Score based on same learning goal
      if (userProfile.learningGoal && match.learningGoal && 
          userProfile.learningGoal === match.learningGoal) {
        score += 20;
      }
      
      // Score based on same occupation
      if (userProfile.occupation && match.occupation && 
          userProfile.occupation === match.occupation) {
        score += 15;
      }
      
      return {
        profile: match,
        score
      };
    });
    
    // Sort by score and limit results
    const topMatches = scoredMatches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(match => ({
        userId: match.profile.userId,
        fullName: match.profile.fullName,
        occupation: match.profile.occupation,
        company: match.profile.company,
        skills: match.profile.skills,
        matchScore: match.score
      }));
    
    return topMatches;
  } catch (error) {
    console.error('Error getting connection suggestions:', error);
    throw error;
  }
}
```

2. **Learning Circles and Study Groups**
   - Implement group-based learning communities
   - Add collaborative learning features

```javascript
// New model: LearningCircle.js
const learningCircleSchema = new mongoose.Schema({
  circleId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  skill: { type: String, required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  createdBy: { type: String, required: true }, // userId of creator
  members: [{ 
    userId: { type: String, required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now }
  }],
  isPrivate: { type: Boolean, default: false },
  joinRequests: [{
    userId: { type: String, required: true },
    requestedAt: { type: Date, default: Date.now }
  }],
  meetings: [{
    meetingId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    scheduledFor: { type: Date, required: true },
    duration: { type: Number }, // in minutes
    meetingUrl: { type: String },
    attendees: [{ type: String }] // userIds of attendees
  }],
  resources: [{
    resourceId: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['link', 'file', 'note'] },
    content: { type: String, required: true },
    addedBy: { type: String, required: true },
    addedAt: { type: Date, default: Date.now }
  }],
  discussions: [{
    discussionId: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    comments: [{
      userId: { type: String, required: true },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }]
  }],
  createdAt: { type: Date, default: Date.now }
});

// Indexes for efficient querying
learningCircleSchema.index({ skill: 1 });
learningCircleSchema.index({ 'members.userId': 1 });
learningCircleSchema.index({ createdBy: 1 });
```

3. **Enhanced Content Sharing**
   - Implement rich media sharing in discussions and feeds
   - Add support for code snippets, diagrams, and file attachments

```javascript
// Add to Discussion model
attachments: [{
  attachmentId: { type: String, required: true },
  type: { type: String, enum: ['image', 'document', 'code', 'link'], required: true },
  title: { type: String },
  url: { type: String },
  content: { type: String }, // For code snippets
  language: { type: String }, // For code snippets
  fileSize: { type: Number }, // For files
  mimeType: { type: String } // For files
}]

// Add to discussionService.js
async function addAttachment(userId, discussionId, attachmentData) {
  try {
    const discussion = await Discussion.findOne({ discussionId });
    if (!discussion) {
      throw new Error('Discussion not found');
    }
    
    // Check if user is the author of the discussion
    if (discussion.userId !== userId) {
      throw new Error('Only the author can add attachments');
    }
    
    const attachmentId = uuidv4();
    
    // Process attachment based on type
    let attachment = {
      attachmentId,
      type: attachmentData.type,
      title: attachmentData.title || 'Untitled'
    };
    
    switch (attachmentData.type) {
      case 'image':
      case 'document':
        // In a real implementation, this would handle file uploads
        // and store them in a cloud storage service
        attachment.url = attachmentData.url;
        attachment.fileSize = attachmentData.fileSize;
        attachment.mimeType = attachmentData.mimeType;
        break;
      
      case 'code':
        attachment.content = attachmentData.content;
        attachment.language = attachmentData.language || 'plaintext';
        break;
      
      case 'link':
        attachment.url = attachmentData.url;
        break;
      
      default:
        throw new Error('Invalid attachment type');
    }
    
    // Add attachment to discussion
    discussion.attachments.push(attachment);
    await discussion.save();
    
    return attachment;
  } catch (error) {
    console.error('Error adding attachment:', error);
    throw error;
  }
}
```

4. **Real-time Collaboration**
   - Implement WebSocket-based real-time updates for discussions and activities
   - Add presence indicators and typing notifications

```javascript
// New service: realtimeService.js
const WebSocket = require('ws');
const http = require('http');
const jwt = require('jsonwebtoken');

let wss;
const userSockets = new Map(); // userId -> WebSocket
const roomSockets = new Map(); // roomId -> Set of userIds

function initialize(server) {
  wss = new WebSocket.Server({ server });
  
  wss.on('connection', (ws, req) => {
    // Extract token from query string
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');
    
    if (!token) {
      ws.close(4001, 'Authentication required');
      return;
    }
    
    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;
      
      // Store the connection
      userSockets.set(userId, ws);
      
      // Handle messages
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          handleMessage(userId, data, ws);
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
        }
      });
      
      // Handle disconnection
      ws.on('close', () => {
        userSockets.delete(userId);
        
        // Remove user from all rooms
        for (const [roomId, users] of roomSockets.entries()) {
          if (users.has(userId)) {
            users.delete(userId);
            broadcastToRoom(roomId, {
              type: 'user_left',
              userId
            });
          }
        }
      });
      
      // Send initial connection success message
      ws.send(JSON.stringify({
        type: 'connection_established',
        userId
      }));
      
    } catch (error) {
      console.error('WebSocket authentication error:', error);
      ws.close(4003, 'Authentication failed');
    }
  });
  
  console.log('WebSocket server initialized');
}

function handleMessage(userId, data, ws) {
  switch (data.type) {
    case 'join_room':
      joinRoom(userId, data.roomId);
      break;
    
    case 'leave_room':
      leaveRoom(userId, data.roomId);
      break;
    
    case 'typing':
      broadcastToRoom(data.roomId, {
        type: 'user_typing',
        userId,
        isTyping: data.isTyping
      });
      break;
    
    case 'presence':
      broadcastToRoom(data.roomId, {
        type: 'user_presence',
        userId,
        status: data.status // 'online', 'away', 'busy'
      });
      break;
    
    case 'message':
      broadcastToRoom(data.roomId, {
        type: 'new_message',
        userId,
        message: data.message,
        timestamp: Date.now()
      });
      break;
  }
}

function joinRoom(userId, roomId) {
  if (!roomSockets.has(roomId)) {
    roomSockets.set(roomId, new Set());
  }
  
  roomSockets.get(roomId).add(userId);
  
  // Notify others in the room
  broadcastToRoom(roomId, {
    type: 'user_joined',
    userId
  });
}

function leaveRoom(userId, roomId) {
  if (roomSockets.has(roomId)) {
    roomSockets.get(roomId).delete(userId);
    
    // Notify others in the room
    broadcastToRoom(roomId, {
      type: 'user_left',
      userId
    });
  }
}

function broadcastToRoom(roomId, data) {
  if (!roomSockets.has(roomId)) return;
  
  const users = roomSockets.get(roomId);
  const message = JSON.stringify(data);
  
  for (const userId of users) {
    const socket = userSockets.get(userId);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    }
  }
}

function sendToUser(userId, data) {
  const socket = userSockets.get(userId);
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
    return true;
  }
  return false;
}

function broadcastToAll(data) {
  const message = JSON.stringify(data);
  for (const socket of userSockets.values()) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    }
  }
}

module.exports = {
  initialize,
  sendToUser,
  broadcastToAll,
  broadcastToRoom
};
```

### Frontend Enhancements

1. **Interactive Community Dashboard**
   - Create a personalized community dashboard showing connections, discussions, and activities
   - Implement advanced filtering and sorting options

2. **Enhanced User Profiles**
   - Add portfolio showcasing completed projects and achievements
   - Implement skill endorsements from connections
   - Add learning journey visualization

3. **Real-time Collaboration Tools**
   - Implement shared note-taking and document editing
   - Add video conferencing integration for study groups
   - Create collaborative code editors for pair programming

4. **Community Challenges and Events**
   - Create a calendar of community events and challenges
   - Implement registration and reminder systems
   - Add post-event discussion and resource sharing

5. **Mentorship Matching System**
   - Implement a system to match mentors and mentees based on skills and goals
   - Add scheduling and session tracking tools
   - Create feedback and rating system for mentorship sessions

## Integration Points

1. **User Profile System**
   - Connection suggestions based on profile data
   - Activity sharing from profile achievements

2. **Gamification System**
   - Share badges and achievements in activity feed
   - Create community challenges with leaderboards

3. **Learning Roadmap**
   - Share progress milestones in activity feed
   - Find connections following similar learning paths

4. **AI Tutoring**
   - Share interesting AI conversations with the community
   - Create group tutoring sessions

## Testing Strategy

1. **Unit Tests**
   - Test connection management functions
   - Test discussion and comment creation
   - Test notification generation

2. **Integration Tests**
   - Test end-to-end social interactions
   - Test real-time updates via WebSockets
   - Test activity feed generation and filtering

3. **Load Tests**
   - Test system performance with many concurrent users
   - Test real-time message broadcasting at scale
   - Test feed generation with large datasets

## Security Considerations

1. **Privacy Controls**
   - Implement granular privacy settings for profile visibility
   - Add content visibility controls (public, connections, private)
   - Create blocking and reporting mechanisms

2. **Content Moderation**
   - Implement automated content filtering for inappropriate material
   - Create flagging system for community moderation
   - Develop moderation dashboard for administrators

3. **Data Protection**
   - Ensure compliance with data protection regulations
   - Implement secure storage of user connection data
   - Create data export and deletion capabilities

## Performance Considerations

1. **Feed Optimization**
   - Implement efficient feed generation algorithms
   - Use pagination and lazy loading for activity feeds
   - Cache frequently accessed feed data

2. **Real-time Communication**
   - Optimize WebSocket connections for scale
   - Implement connection pooling and load balancing
   - Use message queuing for reliable delivery

## Conclusion

The Community & Social Features provide a vital layer of engagement and collaboration to the CareerLeap platform. By implementing the recommended enhancements, the platform can create a vibrant learning community that supports users in their skill development journey through peer connections, knowledge sharing, and collaborative learning opportunities.