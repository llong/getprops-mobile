import { useState, useEffect } from "react";
import { VideoAsset } from "@/types/media";

export const useVideoList = (videos: VideoAsset[], itemsPerPage: number) => {
  const [visibleVideos, setVisibleVideos] = useState<VideoAsset[]>(
    videos.slice(0, itemsPerPage)
  );

  useEffect(() => {
    setVisibleVideos(videos.slice(0, itemsPerPage));
  }, [videos, itemsPerPage]);

  const handleLoadMore = () => {
    const currentLength = visibleVideos.length;
    if (currentLength < videos.length) {
      const nextBatch = videos.slice(
        currentLength,
        currentLength + itemsPerPage
      );
      setVisibleVideos((prev) => [...prev, ...nextBatch]);
    }
  };

  return { visibleVideos, handleLoadMore };
};
