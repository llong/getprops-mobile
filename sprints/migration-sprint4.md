# Migration Sprint 4: Real-time Chat

## Overview
This sprint implements the direct messaging features, allowing users to communicate 1-on-1 or in groups.

## Goals
- Build a robust Chat Inbox.
- Build a real-time Chat Room.
- Implement Group Chat creation.

## Tasks

### 1. Chat Inbox
- [x] Create `src/screens/Chat/ChatInboxScreen.tsx`.
    - [x] `ChatList` component: Render active conversations (`useConversationsQuery`).
    - [x] `ChatRequests` component: Filter for pending invites.
    - [x] Floating Action Button (FAB) to start new chat.

### 2. Chat Room
- [x] Create `src/screens/Chat/ChatRoomScreen.tsx`.
    - [x] Use `GiftedChat` or build custom `FlatList` for messages.
    - [x] `MessageBubble` component (Me vs Others style).
    - [x] `ChatInput` with send button.
    - [x] Header: Show user/group name + avatar.
    - [ ] Info button to open settings.

### 3. Group Creation
- [ ] Create `src/screens/Chat/CreateGroupScreen.tsx`.
    - [ ] Input for Group Name.
    - [ ] User search/select list (multi-select).
    - [ ] Submit button -> `chatService.createGroup`.

### 4. Chat Settings
- [ ] Create `src/screens/Chat/ChatSettingsScreen.tsx`.
    - [ ] List members (Avatar + Name).
    - [ ] (Admin) Rename group.
    - [ ] (Admin) Remove members.
    - [ ] "Leave Chat" button.

## Success Criteria
- [x] Real-time message updates (using `postgres_changes` subscription in hook).
- [x] Creating a new DM with an existing user redirects to the existing conversation.
- [x] Group creation works with multiple members.
- [x] Unread counts update correctly in the inbox.