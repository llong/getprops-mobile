# Migration Sprint 2: The Feed & Discovery

## Overview
This sprint focuses on building the primary user interface for content discovery. We will create the TikTok/Instagram-style feed screen, implement the feed item components, and integrate the filtering logic.

## Goals
- Create the main `FeedScreen`.
- Build performant `FeedItem` components (Video/Photo).
- Implement the "Following" vs "For You" tab system.
- Build the Filter Bottom Sheet.

## Tasks

### 1. Feed Screen UI
- [x] Create `src/screens/Feed/FeedScreen.tsx`.
    - [x] Set up `FlashList` (or optimized `FlatList`) for infinite scrolling.
    - [x] Implement pull-to-refresh logic using `useFeedQuery`.
    - [x] Add loading skeletons and error states.
    - [x] Create `FeedHeader` with "For You" / "Following" tabs.

### 2. Feed Item Component
- [x] Create `src/components/Feed/FeedItem.tsx`.
    - [x] Render User Header (Avatar, Name, Timestamp, Follow button).
    - [x] Render Content (Text, Location).
    - [x] Render Actions (Like, Comment, Share).
- [x] Create `src/components/Feed/MediaCarousel.tsx`.
    - [x] Handle multiple photos/videos.
    - [x] Implement video playback with `expo-av` (auto-play when in view).
    - [x] Optimize image loading with `react-native-fast-image`.

### 3. Filtering UI
- [x] Create `src/components/Feed/FeedFilterBottomSheet.tsx`.
    - [x] "Near Me" toggle.
    - [x] Slider for distance.
    - [x] Spot Type / Difficulty chips.
    - [x] Rider Type selection.
- [x] Integrate filters with `useFeedQuery`.

### 4. Navigation
- [x] Update `App.tsx` / Navigation structure.
    - [x] Set `FeedScreen` as the initial route.
    - [x] Add bottom tab icon for Feed.

## Success Criteria
- [x] Users can scroll through an infinite feed of spots/media.
- [x] Videos auto-play when centered in the view.
- [x] "Like" and "Follow" buttons update UI optimistically.
- [x] Switching tabs refreshes the feed correctly.
- [x] Filters update the query and results.