declare module "react-native-video-compressor" {
  interface CompressionOptions {
    compressionMethod?: "auto" | "manual";
    minimumFileSizeForCompress?: number;
    quality?: "low" | "medium" | "high";
    frameRate?: number;
  }

  interface CompressionResult {
    result: string;
    size?: number;
  }

  export const Video: {
    compress: (
      uri: string,
      options?: CompressionOptions
    ) => Promise<CompressionResult>;
  };
}
