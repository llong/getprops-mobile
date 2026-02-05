# Migration Sprint 1: Foundation & Data Layer

## Overview
This sprint focuses on establishing the core data structures and services required to support the new content-first features (Feed, Chat, Interactions) in the mobile app. We will align the React Native project with the schema and logic used in `spothop-web`.

## Goals
- Align TypeScript types with the Supabase schema.
- Implement core service modules (`feedService`, `chatService`, `profileService`, `spotService`).
- Set up global state management (Jotai) for new features.
- Implement TanStack Query hooks for efficient data fetching.

## Tasks

### 1. Type Definitions
- [x] Create/Update `src/types/index.ts`.
    - [x] Add `FeedItem` interface (including `media_type`, `popularity_score`, etc.).
    - [x] Add `MediaItem`, `LikedMediaItem`, `UserMediaItem` interfaces.
    - [x] Add `UserProfile` (extended with `riderType`, `role`, etc.).
    - [x] Add `SpotComment` and `MediaComment` interfaces.
    - [x] Add `Conversation`, `ChatMessage`, `ConversationParticipant` interfaces.
    - [x] Add `AppNotification` interface.

### 2. Service Layer Implementation
- [x] Create `src/services/feedService.ts`.
    - [x] `fetchGlobalFeed` (RPC: `get_global_feed_content`).
    - [x] `fetchFollowingFeed` (RPC: `get_following_feed_content`).
    - [x] `toggleMediaLike` (RPC: `handle_media_like`).
    - [x] `fetchMediaComments` and `postMediaComment`.
- [x] Create `src/services/chatService.ts`.
    - [x] `fetchConversations`, `fetchMessages`, `sendMessage`.
    - [x] `getOrCreate1on1`, `createGroup`.
- [x] Update `src/services/profileService.ts`.
    - [x] Add `fetchFollowStats` (RPC: `get_user_follow_stats_simple`).
    - [x] Add `fetchUserContent` (Spots + Media).
    - [x] Add `fetchUserFollowers` / `fetchUserFollowing` (RPC batch).
- [x] Update `src/services/spotService.ts`.
    - [x] `fetchSpotDetails` (Enriched with media, comments, like status).

### 3. State Management (Jotai)
- [x] Create `src/state/feed.ts`.
    - [x] `feedFiltersAtom` (Near me, distance, types).
- [x] Create `src/state/chat.ts` (if needed for global unread counts).
- [x] Update `src/state/auth.ts`.
    - [x] Add atoms for `followersCount`, `followingCount`, `notifications`.

### 4. Custom Hooks (TanStack Query)
- [x] Create `src/hooks/useFeedQueries.ts`.
    - [x] `useFeedQuery` (InfiniteQuery).
    - [x] `useToggleMediaLike`, `usePostMediaComment`.
- [x] Create `src/hooks/useChatQueries.ts`.
    - [x] `useConversationsQuery`, `useMessagesQuery`.
- [x] Create `src/hooks/useProfileQueries.ts`.
    - [x] `useProfileQuery`, `useSocialStatsQuery`.

## Success Criteria
- [x] TypeScript compiles without errors.
- [x] All new service functions can successfully call Supabase RPCs (verified via simple unit test or console log check).
- [x] TanStack Query hooks are ready for UI integration.