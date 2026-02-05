# Migration Sprint 3: Social Graph & Interactions

## Overview
This sprint focuses on the "community" aspect. We will build the screens and components necessary for users to interact with each other and the content (comments, user lists, notifications).

## Goals
- Build the Comments UI (BottomSheet).
- Create screens for viewing Followers/Following.
- Build the Notifications screen.
- Implement deep linking from notifications.

## Tasks

### 1. Comments System
- [x] Create `src/components/Comments/CommentBottomSheet.tsx`.
    - [x] List comments for a media item (`useMediaComments`).
    - [x] Render `CommentItem` (Avatar, Text, Time, Reply button).
    - [ ] Handle nested replies (indentation).
- [ ] Create `CommentInput` component.
    - [ ] Text input with "Post" button.
    - [ ] Handle "Replying to @user" state.

### 2. User Lists (Followers/Following)
- [x] Create `src/screens/Profile/UserListScreen.tsx`.
    - [x] Accept `userId` and `type` ('followers' | 'following') params.
    - [x] Use `useUserFollowersQuery` / `useUserFollowingQuery`.
    - [x] Render `UserListItem` (Avatar, Name, Follow/Unfollow button).

### 3. Profile Updates
- [x] Update `src/screens/Profile/ProfileScreen.tsx`.
    - [x] Display "Followers" and "Following" counts (clickable).
    - [ ] Add "Follow" button (if not own profile).
    - [ ] Show "Message" button.

### 4. Notifications
- [x] Create `src/screens/Notifications/NotificationsScreen.tsx`.
    - [x] Use `useNotificationsQuery`.
    - [x] Render `NotificationItem` based on type (like, comment, follow).
    - [ ] Mark as read on tap.
    - [ ] Navigate to relevant screen (Spot, Profile).

## Success Criteria
- [x] Users can post and reply to comments.
- [x] Tapping "Followers" on a profile opens the user list.
- [x] Notifications update in real-time (via Supabase subscription).
- [x] Tapping a notification navigates correctly.