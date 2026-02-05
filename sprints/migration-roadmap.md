# SpotHop Mobile Migration Roadmap

This roadmap outlines the plan to bring the `get-props` mobile application to feature parity with `spothop-web`, transforming it into a content-first social media experience for skaters.

## Phase 1: Foundation & Data Layer (Sprint 1)
**Goal:** Align the mobile data layer with the web's optimized Supabase structure and types.

### Tasks
- [ ] **Type Definitions:**
    - [ ] Create/Update `src/types/index.ts` to match web schema (FeedItem, MediaItem, UserProfile, etc.).
    - [ ] Ensure all Enums (SpotType, Difficulty, etc.) match the database.
- [ ] **Service Layer:**
    - [ ] Create `src/services/feedService.ts` (RPC calls for global/following feeds).
    - [ ] Create `src/services/chatService.ts` (Conversations, messages, participants).
    - [ ] Update `src/services/profileService.ts` (Follower stats RPC, user content).
    - [ ] Update `src/services/spotService.ts` (Rich spot details with media).
- [ ] **State Management (Jotai):**
    - [ ] Create atoms for `feed` (filters, active tab).
    - [ ] Create atoms for `chat` (active conversation, unread counts).
    - [ ] Update `auth` atoms to include profile enrichment data.
- [ ] **Hooks (TanStack Query):**
    - [ ] Implement `useFeedQuery` (Infinite scroll support).
    - [ ] Implement `useChatQueries` (Inbox, messages).
    - [ ] Implement `useProfileQueries` (Social stats, content).

## Phase 2: The Feed & Discovery (Sprint 2)
**Goal:** Shift the app to a content-first experience with a TikTok/Instagram-style feed.

### Tasks
- [ ] **Feed Screen:**
    - [ ] Create `src/screens/Feed/FeedScreen.tsx`.
    - [ ] Implement `FlashList` or `FlatList` for performance.
    - [ ] Implement pull-to-refresh and infinite loading.
- [ ] **Feed Item Component:**
    - [ ] Create `src/components/Feed/FeedItem.tsx`.
    - [ ] Implement `MediaCarousel` for spots with multiple photos/videos.
    - [ ] Add "Like" (Media) and "Favorite" (Spot) actions.
    - [ ] Add "Follow" button for uploader.
- [ ] **Filtering:**
    - [ ] Create `FeedFilterBottomSheet` (Near me, Spot Type, Difficulty).
    - [ ] Implement "For You" vs "Following" tabs.

## Phase 3: Social Graph & Interactions (Sprint 3)
**Goal:** Enable deep community engagement through comments and following.

### Tasks
- [ ] **Comments System:**
    - [ ] Create `CommentBottomSheet` or Screen.
    - [ ] Implement threaded comments UI.
    - [ ] Add comment liking/reacting.
- [ ] **Profile Socials:**
    - [ ] Update `ProfileScreen` to show Follower/Following counts.
    - [ ] Create `UserListScreen` (for viewing followers/following).
    - [ ] Add "Follow/Unfollow" button to profiles.
- [ ] **Notifications:**
    - [ ] Create `NotificationsScreen`.
    - [ ] Handle notification types (likes, comments, follows).

## Phase 4: Real-time Chat (Sprint 4)
**Goal:** Enable direct communication between skaters.

### Tasks
- [ ] **Chat Inbox:**
    - [ ] Create `ChatInboxScreen`.
    - [ ] Show conversation list with last message preview.
    - [ ] Handle "Requests" vs "Chats".
- [ ] **Chat Room:**
    - [ ] Create `ChatRoomScreen`.
    - [ ] Implement real-time subscription for new messages.
    - [ ] Build message bubbles and input area.
- [ ] **Group Management:**
    - [ ] Create `CreateGroupScreen`.
    - [ ] Implement "Chat Details" (Member list, leave group).

## Phase 5: Media & Polish (Sprint 5)
**Goal:** Enhance the media creation and consumption experience.

### Tasks
- [ ] **Media Upload:**
    - [ ] Integrate `expo-image-picker` with multiple selection.
    - [ ] Implement client-side compression/resizing (parity with web's `imageOptimization`).
    - [ ] (Optional) Video trimming integration.
- [ ] **Video Player:**
    - [ ] Optimize `expo-av` usage for feed scrolling (auto-play/pause).
- [ ] **Admin:**
    - [ ] Implement basic content reporting flow.
- [ ] **QA & Polish:**
    - [ ] Verify deep links (Notification -> Spot/Comment).
    - [ ] Ensure consistent styling (Theming).