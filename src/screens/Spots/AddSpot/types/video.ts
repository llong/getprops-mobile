import { VideoAsset } from "@/types/media";

export interface VideoSelectorProps {
  videos: VideoAsset[];
  setVideos: React.Dispatch<React.SetStateAction<VideoAsset[]>>;
}

export interface TrimOptions {
  startTime: number;
  endTime: number;
  quality: "low" | "medium" | "high";
}

export interface FileInfoResult {
  exists: boolean;
  uri: string;
  size: number;
  isDirectory: boolean;
  modificationTime?: number;
  md5?: string;
}
