import { Theme as RNETheme } from "@rneui/themed";
import { Video } from "expo-av";
import { VideoAsset } from "@/types/media";

export type Theme = RNETheme;

export interface VideoItemProps {
  video: VideoAsset;
  index: number;
  onSetThumbnail: (index: number) => Promise<void>;
  onRemove: (index: number) => void;
  setVideoRef: (index: number, ref: Video | null) => void;
}

export interface VideoControlsProps {
  onRecordVideo: () => void;
  onChooseVideo: () => void;
  loading: boolean;
  theme: Theme;
}

export interface ThumbnailSliderProps {
  value: number;
  onChange: (value: number) => void;
  onComplete: (value: number) => void;
  maxDuration: number;
  theme: Theme;
}

export interface VideoSelectorProps {
  videos: VideoAsset[];
  setVideos: React.Dispatch<React.SetStateAction<VideoAsset[]>>;
}
