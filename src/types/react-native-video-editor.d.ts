declare module "react-native-video-editor" {
  interface VideoEditorOptions {
    startTime?: number;
    endTime?: number;
    quality?: number;
    saveToCameraRoll?: boolean;
  }

  export function trim(
    source: string,
    options: VideoEditorOptions
  ): Promise<string>;
}
