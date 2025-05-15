# WitWars App Documentation

This document provides a comprehensive overview of the WitWars application, including its architecture, features, pages, and functionality. It serves as a reference for future development and feature additions.

## Table of Contents

1. [Application Overview](#application-overview)
2. [Architecture](#architecture)
3. [Authentication System](#authentication-system)
4. [Pages](#pages)
5. [Friend System](#friend-system)
6. [Post System](#post-system)
7. [Cloud Functions](#cloud-functions)
8. [Data Models](#data-models)
9. [Utility Services](#utility-services)

## Application Overview

WitWars is a social media application that allows users to create accounts, connect with friends, and share posts. The application uses Firebase for authentication, data storage, and cloud functions.

## Architecture

### Frontend
- **Framework**: React with TypeScript
- **Routing**: React Router
- **State Management**: React hooks and context
- **Styling**: CSS modules or styled components

### Backend
- **Authentication**: Firebase Authentication
- **Database**: Firestore
- **Storage**: Firebase Storage (for images)
- **Cloud Functions**: Firebase Cloud Functions

## Authentication System

The authentication system uses Firebase Authentication with email/password and includes username registration.

### Key Features
- User registration with email, password, and username
- Login with email and password
- Password reset functionality
- User profile management

### Implementation
- User data is stored in Firestore in the `users` collection
- Each user document uses the Firebase Auth UID as the document ID
- Username is stored in the user's document for friend lookups

## Pages

### Home/Feed Page
- Displays posts from the user and their friends
- Allows creating new posts
- Supports liking and commenting on posts

### Profile Page
- Displays user information
- Shows user's posts
- Allows editing profile information

### Friends Page
- Displays the user's friends list
- Shows incoming friend requests
- Allows sending friend requests
- Supports accepting/declining friend requests
- Provides friend removal functionality

### Authentication Pages
- Login page
- Registration page
- Password reset page

## Friend System

The friend system allows users to connect with each other through friend requests.

### Data Structure
- `users/{uid}/friends`: Array of friend UIDs
- `users/{uid}/friendRequests`: Array of pending request UIDs

### Functions

#### `findUserByUsername`
- **Purpose**: Find a user by their username
- **Parameters**: `username: string`
- **Returns**: `Promise<UserProfile | null>`
- **Implementation**: Queries the `users` collection with a case-insensitive username match

#### `sendFriendRequest`
- **Purpose**: Send a friend request to another user
- **Parameters**: `fromUserId: string, toUsername: string`
- **Returns**: `Promise<void>`
- **Implementation**: Adds the sender's UID to the recipient's `friendRequests` array
- **Validation**:
  - Checks if the recipient exists
  - Prevents sending requests to oneself
  - Prevents duplicate requests
  - Checks if users are already friends

#### `acceptFriendRequest`
- **Purpose**: Accept a friend request
- **Parameters**: `currentUserId: string, fromUserId: string`
- **Returns**: `Promise<void>`
- **Implementation**:
  - Removes the sender's UID from the recipient's `friendRequests` array
  - Adds each user to the other's `friends` array

#### `declineFriendRequest`
- **Purpose**: Decline a friend request
- **Parameters**: `currentUserId: string, fromUserId: string`
- **Returns**: `Promise<void>`
- **Implementation**: Removes the sender's UID from the recipient's `friendRequests` array

#### `removeFriendTwoSided` (also exported as `removeFriend`)
- **Purpose**: Remove a friend connection between two users
- **Parameters**: `friendUid: string`
- **Returns**: `Promise<void>`
- **Implementation**: Calls the `removeFriend` Cloud Function to remove the friend connection on both sides

#### `getFriendRequests`
- **Purpose**: Get all friend requests for a user
- **Parameters**: `userId: string`
- **Returns**: `Promise<UserProfile[]>`
- **Implementation**: Retrieves and returns user profiles for all pending friend requests

#### `getFriends`
- **Purpose**: Get all friends for a user
- **Parameters**: `userId: string`
- **Returns**: `Promise<UserProfile[]>`
- **Implementation**: Retrieves and returns user profiles for all friends

## Post System

The post system allows users to create, view, and interact with posts.

### Data Structure
- `posts` collection with documents containing post data
- Each post includes author ID, content, timestamp, and interaction data

### Functions

#### `createPost`
- **Purpose**: Create a new post
- **Parameters**: `post: Omit<Post, 'id' | 'timestamp'>`
- **Returns**: `Promise<string>` (post ID)
- **Implementation**: Creates a new document in the `posts` collection

#### `getPostsByAuthors`
- **Purpose**: Fetch posts by a list of user UIDs
- **Parameters**: `authorIds: string[]`
- **Returns**: `Promise<Post[]>`
- **Implementation**: Queries posts where the author ID is in the provided list

#### `deletePost`
- **Purpose**: Delete a post
- **Parameters**: `postId: string`
- **Returns**: `Promise<void>`
- **Implementation**: Deletes the post document from Firestore

## Cloud Functions

Cloud Functions provide backend logic for operations that require server-side execution.

### `removeFriend`
- **Purpose**: Remove a friend connection between two users
- **Parameters**: `{ userA: string, userB: string }`
- **Returns**: `{ success: boolean }`
- **Implementation**:
  - Removes userB from userA's friends array
  - Removes userA from userB's friends array
  - Uses a Firestore transaction for atomicity
  - Includes error handling and logging
- **Security**: 
  - Verifies that the caller is userA
  - Configured with CORS headers to allow cross-origin requests from the app domain

## Firestore Security Rules

The application uses Firestore Security Rules to control access to the database.

### User Documents
- **Read Access**: Any authenticated user can read any user profile
- **Write Access**:
  - Users can only write to their own documents (`request.auth.uid == userId`)
  - Special rule for friend requests: Users can update another user's `friendRequests` array to add themselves

### Post Documents
- **Read Access**: Any authenticated user can read all posts
- **Create Access**: Any authenticated user can create posts
- **Update/Delete Access**: Only the post author can update or delete their own posts

### Friend Request Rule
The special rule for friend requests allows users to send friend requests while maintaining security:
```
allow update: if request.auth != null 
              && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['friendRequests'])
              && request.resource.data.friendRequests.hasAll(resource.data.friendRequests || [])
              && request.resource.data.friendRequests.size() <= (resource.data.friendRequests || []).size() + 1;
```

This ensures:
- Only the `friendRequests` field can be modified
- All existing friend requests are preserved
- At most one new request can be added at a time

## Data Models

### UserProfile
```typescript
export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  friends: string[];
  friendRequests: string[];
  createdAt: string;
}
```

### Post
```typescript
export interface Post {
  id?: string;
  authorId: string;
  imageUrl?: string;
  text?: string;
  timestamp: string;
  likes: number;
  likedBy: string[];
}
```

## Utility Services

### `friendService.ts`
Manages friend-related operations (detailed in the Friend System section).

### `postService.ts`
Manages post-related operations (detailed in the Post System section).

---

## CORS Configuration

The application includes Cross-Origin Resource Sharing (CORS) configuration to allow the frontend to communicate with the backend services.

### Firebase Hosting CORS Headers
- Added in `firebase.json` to allow cross-origin requests to Cloud Functions
- Configuration:
  ```json
  "hosting": {
    "headers": [
      {
        "source": "/**",
        "headers": [
          {
            "key": "Access-Control-Allow-Origin",
            "value": "*"
          }
        ]
      }
    ]
  }
  ```
- This allows the frontend at `witwars.com` to call Cloud Functions at `us-central1-witwars-79a2b.cloudfunctions.net`

### Cloud Functions
- Cloud Functions like `removeFriend` are configured to handle cross-origin requests
- The implementation uses Firebase Callable Functions which handle CORS automatically when properly configured

## Future Feature Considerations

- Direct messaging between friends
- Post comments
- User notifications
- Profile pictures and customization
- Content moderation
- Search functionality for users and posts

---

*This documentation will be updated as new features are added to the application.*
