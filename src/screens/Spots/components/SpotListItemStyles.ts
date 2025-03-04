import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    margin: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#000",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  difficulty: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  difficultyText: {
    fontSize: 14,
    textTransform: "capitalize",
  },
  votes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  location: {
    color: "gray",
    fontSize: 14,
    marginBottom: 5,
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});

export default styles;
