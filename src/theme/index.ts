import { createTheme, lightColors } from "@rneui/themed";

export const theme = createTheme({
  mode: "light",
  lightColors: {
    primary: "#A3CDA5",
    secondary: "#F6F4D2",
    white: "#FFFFFF",
    error: "#E63946",
    warning: "#FFB703",
    success: "#52B788",
    black: "#333333",
    grey0: "#333333",
    grey1: "#666666",
    grey2: "#999999",
    grey3: "#CCCCCC",
    grey4: "#E5E5E5",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  components: {
    Input: {
      containerStyle: {
        paddingHorizontal: 0,
      },
      inputContainerStyle: {
        borderBottomWidth: 0,
        backgroundColor: "white",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 0,
      },
      inputStyle: {
        fontSize: 16,
        minHeight: 40,
      },
      labelStyle: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 10,
        marginTop: 4,
        color: lightColors.grey1,
      },
    },
    Button: (props, theme) => ({
      raised: false,
      buttonStyle: {
        backgroundColor: theme.colors.primary,
        borderRadius: 8,
        paddingVertical: 12,
      },
      titleStyle: {
        fontSize: 16,
        fontWeight: "bold",
        color: lightColors.white,
      },
    }),
  },
});

// If you need to customize components, you might need to create a custom theme type
