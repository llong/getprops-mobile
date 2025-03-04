import { StyleSheet, Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
export const VIDEO_WIDTH = Math.min(300, SCREEN_WIDTH - 40);

export const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  buttonContainerStyle: {
    flex: 1,
    marginHorizontal: 4,
  },
  videoList: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  videoWrapper: {
    flex: 1,
    marginBottom: 20,
    marginRight: 16,
    alignItems: "center",
  },
  video: {
    width: VIDEO_WIDTH,
    height: (VIDEO_WIDTH / 3) * 2,
    backgroundColor: "#000",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  thumbnailControls: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  thumbnailLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  thumbnailOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 50,
    height: 50,
    zIndex: 1,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    borderRadius: 5,
  },
  setThumbnailButtonContainer: {
    marginTop: 10,
  },
  setThumbnailButton: {
    backgroundColor: "transparent",
  },
  deleteVideoContainer: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
});
