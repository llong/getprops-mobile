export interface VideoItemProps {
  video: VideoAsset;
  onRemove: (video: VideoAsset) => void;
  onUpdateThumbnail: (video: VideoAsset, time?: number) => void;
}

export interface VideoSelectorProps {
  videos: VideoAsset[];
  setVideos: React.Dispatch<React.SetStateAction<VideoAsset[]>>;
}

export interface VideoProcessingOptions {
  maxDuration: number;
  quality?: "low" | "medium" | "high";
  compression?: number;
}
