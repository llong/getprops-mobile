# Media Management

## Overview

The media management system handles photo and video content for skate spots, optimizing for performance, bandwidth, and user experience.

## Components

### 1. useSpotPhotos Hook

Primary hook for managing spot photos.

```typescript
interface SpotPhoto {
  id: string;
  spotId: string;
  userId: string;
  originalUrl: string;
  thumbnailSmallUrl: string;
  thumbnailLargeUrl: string;
  metadata: PhotoMetadata;
}

interface PhotoMetadata {
  width: number;
  height: number;
  takenAt?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}
```

Key Features:

- Multi-size image generation
- Progressive loading
- Client-side caching
- EXIF metadata extraction

### 2. LazyImage Component

Optimized image loading component with:

- Blur-up loading effect
- Automatic size selection
- Error handling
- Placeholder support

### 3. Storage Structure

```
spots/
├── ${spotId}/
│   ├── photos/
│   │   ├── originals/
│   │   └── thumbnails/
│   └── videos/
       ├── originals/
       └── thumbnails/
```

## Implementation Status

### Completed

- Basic photo upload
- Thumbnail generation
- Storage structure

### In Progress

- Client-side caching
- Progressive loading
- Metadata extraction

### Planned

- WebP support
- Video optimization
- Background migration

## Performance Metrics

- Target thumbnail generation time: < 2s
- Target initial load time: < 1s
- Maximum cache size: 100MB
- Cache retention: 7 days

## Usage Examples

### Photo Upload

```typescript
const { uploadPhoto } = useSpotPhotos();

const handleUpload = async (photo: ImagePickerAsset) => {
  await uploadPhoto(photo, spotId, userId);
};
```

### Lazy Loading

```typescript
<LazyImage
  source={{ uri: photo.thumbnailSmallUrl }}
  fullRes={{ uri: photo.thumbnailLargeUrl }}
  placeholder={photo.blurHash}
  style={styles.image}
/>
```

## Related Documentation

- [ADR-001: Media Optimization Strategy](../../architecture/decisions/001-media-optimization.md)
- [Sprint 1: Media Optimization](../../sprints/sprint1.md)
