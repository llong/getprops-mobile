declare module "react-native-video-trim" {
  interface EditorOptions {
    maxDuration?: number;
    minDuration?: number;
    saveDialogTitle?: string;
    saveDialogMessage?: string;
    cancelDialogTitle?: string;
    cancelDialogMessage?: string;
  }

  interface EditorResult {
    outputPath: string;
    duration: number;
    size: number;
  }

  interface TrimmerResult {
    name: string;
    outputPath: string;
    startTime: number;
    endTime: number;
    duration: number;
  }

  export function showEditor(
    videoUri: string,
    options?: EditorOptions
  ): Promise<EditorResult>;
}
