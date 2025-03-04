export interface VideoAsset {
  uri: string;
  width: number;
  height: number;
  duration?: number;
  type?: string;
  filename?: string;
  thumbnail?: string;
  thumbnailUri?: string;
  creationTime?: number;
  modificationTime?: number;
  albumId?: string;
  mediaType?: string;
  mediaSubtypes?: string[];
  id?: string;
  playableDuration?: number;
  assetId?: string;
  fileSize?: number;
  localUri?: string;
  isNetworkAsset?: boolean;
  exif?: Record<string, any>;
}

export interface SpotVideo {
  id: string;
  url: string;
  thumbnailUrl: string;
  duration: number;
  createdAt: string;
}
