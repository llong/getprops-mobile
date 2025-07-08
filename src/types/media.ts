export interface VideoAsset {
  uri: string;
  width: number;
  height: number;
  duration: number;
  filename: string;
  mediaType: string;
  creationTime: number;
  modificationTime: number;
  assetId: string;
  fileSize: number;
  localUri: string;
  thumbnail?: string;
}

export interface SpotVideo {
  id: string;
  url: string;
  thumbnailUrl: string;
  duration: number;
  createdAt: string;
}

export interface PhotoMetadata {
  width: number;
  height: number;
  takenAt?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface SpotPhoto {
  id: string;
  spotId: string;
  userId: string;
  originalUrl: string;
  thumbnailSmallUrl: string;
  thumbnailLargeUrl: string;
  metadata: PhotoMetadata;
  createdAt: string;
}

export interface PhotoUploadResult {
  originalUrl: string;
  thumbnailSmallUrl: string;
  thumbnailLargeUrl: string;
  metadata: PhotoMetadata;
}
