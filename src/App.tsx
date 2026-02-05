import { useCallback, useEffect, useState } from "react";
import { View, StatusBar, Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { ThemeProvider } from "@rneui/themed";
import { Provider } from "jotai";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigation } from "./navigation";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { theme } from "./theme";
import { useAuth } from "./hooks/useAuth";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => { });

// Set the animation options
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

const queryClient = new QueryClient();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  useAuth(); // Initialize auth and deep linking

  useEffect(() => {
    async function prepare() {
      try {
        // Add your initialization logic here
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <SafeAreaProvider>
            <StatusBar
              barStyle={
                Platform.OS === "android" ? "light-content" : "dark-content"
              }
              backgroundColor={
                Platform.OS === "android" ? "#000000" : "transparent"
              }
              translucent={true}
              hidden={false}
            />
            <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
              <Navigation />
            </View>
            </SafeAreaProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
