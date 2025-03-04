declare module "@hooks/useTheme" {
  interface ThemeColors {
    primary: string;
    secondary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    grey1: string;
    grey2: string;
    grey3: string;
    grey4: string;
    grey5: string;
    white: string;
    black: string;
  }

  interface Theme {
    colors: ThemeColors;
    spacing: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
  }

  export function useTheme(): {
    theme: Theme;
    toggleTheme: () => void;
    isDark: boolean;
  };
}
