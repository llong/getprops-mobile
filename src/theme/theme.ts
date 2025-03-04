import { createTheme, Colors } from "@rneui/themed";

export const theme = createTheme({
  lightColors: {
    primary: "#D4E09B", // Light green
    secondary: "#F6F4D2",
    background: "#FFFFFF",
    white: "#FFFFFF",
    error: "#E63946", // Red - errors
    warning: "#FFB703", // Amber - warnings
    success: "#52B788", // Green - success
    black: "#333333",
    grey0: "#333333", // Darkest - primary text
    grey1: "#666666", // Dark - secondary text
    grey2: "#999999", // Medium - disabled text
    grey3: "#CCCCCC", // Light - borders
    grey4: "#E5E5E5", // Lighter - disabled backgrounds
    grey5: "#F5F5F5", // Lightest - section backgrounds
  } as Partial<Colors>,
  mode: "light",
  components: {
    Button: {
      raised: false,
      containerStyle: {
        borderRadius: 8,
      },
      buttonStyle: {
        borderRadius: 8,
        paddingVertical: 12,
      },
      titleStyle: {
        fontSize: 16,
        fontWeight: "600",
      },
    },
    Input: {
      containerStyle: {
        paddingHorizontal: 0,
      },
      inputContainerStyle: {
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 12,
        height: 48,
      },
    },
  },
});
