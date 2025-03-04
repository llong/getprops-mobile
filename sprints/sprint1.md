# Sprint 1: Media Optimization

## Overview

This sprint focuses on optimizing media handling in our skate spot app, improving user experience through better performance and media management.

## Goals

- Reduce bandwidth usage and load times
- Improve media display quality and consistency
- Extract and utilize media metadata
- Implement best practices for media loading

## Tasks

### 1. Server-side Image Resizing with Supabase Edge Functions

- [ ] **Research & Planning**

  - [ ] Review Supabase Edge Functions documentation
  - [ ] Define image size requirements for different UI components
  - [ ] Design resizing logic and parameters (dimensions, quality, formats)

- [ ] **Implementation**

  - [ ] Set up development environment for Edge Functions
  - [ ] Create image resizing function
    - [ ] Add support for different resize modes (cover, contain, etc.)
    - [ ] Implement quality optimization
    - [ ] Add WebP format conversion option
  - [ ] Create function deployment pipeline
  - [ ] Update storage triggers to call resizing function on upload

- [ ] **Integration**

  - [ ] Modify frontend code to request appropriately sized images
  - [ ] Update image upload workflow
  - [ ] Add fallback for unsupported browsers/scenarios

- [ ] **Testing & Validation**
  - [ ] Test function performance
  - [ ] Verify image quality across devices
  - [ ] Benchmark bandwidth savings

### 2. Lazy Loading for Media

- [ ] **Component Design**

  - [ ] Research best React Native lazy loading libraries
  - [ ] Design lazy loading component for images
  - [ ] Design lazy loading component for videos
  - [ ] Create placeholder/skeleton UI for loading state

- [ ] **Implementation**

  - [ ] Implement `LazyImage` component
    - [ ] Add progressive loading support
    - [ ] Add blur-up technique
    - [ ] Implement intersection observer pattern
  - [ ] Implement `LazyVideo` component
    - [ ] Add poster/thumbnail display
    - [ ] Add deferred loading logic
  - [ ] Create list optimizations for FlatList/ScrollView

- [ ] **Performance Testing**
  - [ ] Test memory usage
  - [ ] Measure load time improvements
  - [ ] Test on low-end devices
  - [ ] Test with slow network conditions

### 3. Metadata Extraction

- [ ] **Photo Metadata (EXIF)**

  - [ ] Research React Native EXIF libraries
  - [ ] Implement metadata extraction on upload
  - [ ] Create database schema updates for storing metadata
  - [ ] Add UI to display relevant metadata (date taken, camera info)
  - [ ] Implement location extraction (if available in EXIF)

- [ ] **Video Metadata**

  - [ ] Research video metadata extraction options
  - [ ] Implement duration, resolution, and codec extraction
  - [ ] Update database schema for video metadata
  - [ ] Add video quality selector based on available resolutions
  - [ ] Implement video thumbnail generation at specific timestamps

- [ ] **Search & Filter Integration**
  - [ ] Make metadata searchable
  - [ ] Add filter options based on metadata
  - [ ] Create admin view for metadata management

## Timeline

- Planning & Research: 2 days
- Implementation: 5 days
- Testing & Refinement: 3 days

## Success Metrics

- 50% reduction in initial load time for media-heavy screens
- 30% reduction in bandwidth usage
- Improved user rating for media browsing experience
- No increase in app crashes related to media handling

## Critical Bug Fixes

### 1. Email Verification Deep Link Flow [HIGH]

- **Issue**: Email verification deep link flow fails for users without the app installed on the verification device
- **Impact**: Users cannot complete verification on different devices
- **Tasks**:
  - [ ] Implement alternative verification flow for cross-device verification
  - [ ] Add clear instructions in verification email for users on different devices
  - [ ] Test verification flow across multiple device scenarios
  - [ ] Add error handling and user feedback for failed verification attempts

### 2. Camera Permissions UX [MEDIUM]

- **Issue**: Inconsistent camera permission prompts between photo and video capture
- **Impact**: Poor UX and potential confusion for users
- **Tasks**:
  - [ ] Standardize permission requests for both photo and video capture
  - [ ] Request both camera and microphone permissions on first media capture attempt
  - [ ] Add proper error handling for denied permissions
  - [ ] Implement clear messaging for permission requirements

### 3. Spot Creation Database Error [HIGH]

- **Issue**: Spot creation fails due to missing postal_code column
- **Impact**: Users cannot create new spots
- **Tasks**:
  - [x] Audit database schema for spots table
  - [x] Add missing postal_code column or remove requirement
  - [ ] Update spot creation form validation
  - [ ] Test spot creation flow end-to-end

### 4. User Profile Database & Navigation [HIGH]

- **Issue**: Missing avatar_url column and navigation issues after email verification
- **Impact**: Poor first-time user experience and missing onboarding guidance
- **Tasks**:
  - [ ] Fix database schema for user profiles (add avatar_url column)
  - [ ] Implement proper navigation flow after successful verification
  - [ ] Add toast notifications for new user guidance
  - [ ] Test user onboarding flow end-to-end

### 5. Map Markers Display Issue [HIGH]

- **Issue**: Spot markers not appearing on iPad release build
- **Impact**: Core functionality broken for production users
- **Tasks**:
  - [ ] Debug marker rendering in release builds
  - [ ] Verify spot fetching logic works correctly
  - [ ] Test marker visibility across different user accounts
  - [ ] Implement proper error handling for failed spot fetches
  - [ ] Add loading states for map markers

### 6. Location Search Interaction [MEDIUM]

- **Issue**: Double tap required for location selection due to overlay
- **Impact**: Poor user experience when selecting locations
- **Tasks**:
  - [ ] Remove unnecessary semi-transparent overlay
  - [ ] Optimize touch handling for location selection
  - [ ] Test location selection across different devices
  - [ ] Ensure proper visual feedback on location selection

## Timeline Update

- Original Tasks: 10 days
- Bug Fixes: 5 days (parallel with original tasks where possible)
- Total Sprint Duration: 12 days

## Updated Success Metrics

In addition to the original metrics:

- Zero blocking bugs in production builds
- 100% success rate for user verification flow
- Single-tap response rate > 98% for location selection
- Camera permission success rate > 95%
