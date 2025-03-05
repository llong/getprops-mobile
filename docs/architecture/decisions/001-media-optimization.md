# ADR 001: Media Optimization Strategy

## Status

Accepted

## Context

The application needs to handle various media types (photos and videos) efficiently while optimizing for:

- Bandwidth usage
- Load times
- Storage costs
- User experience

## Decision

Implement a multi-tier media storage and delivery strategy:

### Image Strategy

1. Storage Structure:

   ```
   spots/
   ├── ${spotId}/
   │   ├── photos/
   │   │   ├── originals/
   │   │   └── thumbnails/
   │   └── videos/
   │       ├── originals/
   │       └── thumbnails/
   ```

2. Image Sizes:

   - Small thumbnail: 240px width (list views)
   - Large thumbnail: 720px width (detail views)
   - Original: preserved for download/full-screen

3. Format & Quality:
   - Thumbnails: JPEG, 70% quality
   - Progressive loading implementation
   - WebP support planned for future optimization

### Caching Strategy

1. Client-side:

   - AsyncStorage for thumbnail URLs
   - 7-day cache expiration
   - Progressive loading with blur-up effect

2. CDN-level:
   - Supabase storage CDN
   - Appropriate cache headers

## Consequences

### Positive

- Reduced bandwidth usage
- Faster initial load times
- Better user experience with progressive loading
- Organized media structure for future features

### Negative

- Increased storage usage for multiple sizes
- Additional processing time during upload
- More complex upload logic

### Risks

- Migration of existing media
- Potential increased Supabase costs

## Implementation Plan

1. Phase 1: New media uploads (Current)

   - Implement new storage structure
   - Add thumbnail generation
   - Setup caching

2. Phase 2: Migration (Future)

   - Background job for existing media
   - On-demand thumbnail generation

3. Phase 3: Advanced Optimization (Future)
   - WebP support
   - Adaptive quality based on network
   - Machine learning-based compression

## References

- Sprint 1 Documentation
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- React Native Image Manipulation Library
