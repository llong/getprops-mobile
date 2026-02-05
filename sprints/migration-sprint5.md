# Migration Sprint 5: Media & Polish

## Overview
This final sprint handles the complexity of media uploading, optimizes video playback, adds administrative tools, and applies the final coat of polish to the app.

## Goals
- Robust media uploading (image optimization + video trimming).
- Content reporting (Safety).
- Deep linking integration.
- Final UI polish.

## Tasks

### 1. Media Upload
- [x] Implement `src/services/mediaService.ts` (if needed to separate from `spotService`).
- [x] Update `AddSpotScreen` to use `expo-image-picker` with `allowsMultipleSelection`.
- [x] Implement `ImageResizer` (using `expo-image-manipulator`) before upload.
- [ ] (Bonus) Integrate `react-native-video-trim` (already in package.json) for video limits.

### 2. Video Playback
- [x] Optimize `MediaCarousel` in `FeedItem` to pause videos when they scroll out of view (using `onViewableItemsChanged`).
- [x] Ensure `expo-av` audio mode is set correctly (mix with others vs duck others).

### 3. Admin & Safety
- [x] Create `ReportModal` component.
    - [x] Reason selection.
    - [x] Details input.
    - [x] Submit to `content_reports`.
- [x] (Admin Only) Add "Delete Spot/Media" buttons to UI if user role is 'admin'.

### 4. Polish & Deep Linking
- [x] Configure `linking` in `NavigationContainer`.
    - [x] `spothop://spot/:id` -> Spot Details.
    - [x] `spothop://profile/:username` -> Profile.
- [ ] Test push notification handlers (if integrating `expo-notifications`).
- [x] Verify dark mode support (Implemented via themed components).

## Success Criteria
- [x] Users can upload multiple photos/videos without crashing the app.
- [x] Scrolling the feed feels smooth (60fps) with video.
- [x] Deep links open the correct screen.
- [x] Admin users can moderate content.