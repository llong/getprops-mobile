declare module "react-native-video-processing" {
  export interface VideoPlayerProps {
    source: { uri: string };
    playerWidth: number;
    playerHeight: number;
    trimmerLeftHandlePosition?: number;
    trimmerRightHandlePosition?: number;
    maximumZoomLevel?: number;
    play?: boolean;
  }

  export interface TrimmerProps {
    source: string;
    height: number;
    width: number;
    onTrackerMove: (position: { currentTime: number }) => void;
    maxTrimDuration: number;
  }

  export interface TrimOptions {
    startTime: number;
    endTime: number;
    quality: string;
    saveToCameraRoll: boolean;
  }

  export interface VideoPlayerRef {
    trim: (options: TrimOptions) => Promise<string>;
  }

  export const VideoPlayer: React.ForwardRefExoticComponent<
    VideoPlayerProps & React.RefAttributes<VideoPlayerRef>
  >;
  export const Trimmer: React.FC<TrimmerProps>;

  export namespace VideoPlayer {
    export const Constants: {
      quality: {
        QUALITY_1280x720: string;
      };
    };
  }
}
