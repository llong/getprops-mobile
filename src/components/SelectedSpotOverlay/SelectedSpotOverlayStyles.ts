import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  overlay: {
    width: "90%",
    borderRadius: 10,
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  title: {
    marginBottom: 8,
  },
  address: {
    marginBottom: 16,
    color: "#666",
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  detailItem: {
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flex: 1,
  },
  viewButton: {
    marginRight: 4,
  },
  editButton: {
    marginLeft: 4,
  },
  container: {
    padding: 16,
  },
  content: {
    marginTop: 16,
  },
});

export default styles;
