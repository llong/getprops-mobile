import { useAtom } from "jotai";
import { authAtom, authStateAtom } from "@state/auth";
import { supabase } from "@utils/supabase";
import { useState, useEffect, useCallback } from "react";
import { Linking, AppState, AppStateStatus } from "react-native";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import Toast from "react-native-toast-message";
import { generateUsername } from "@/utils/helpers";

export const useAuth = () => {
  const [user] = useAtom(authAtom);
  const [, setAuthState] = useAtom(authStateAtom);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      await setAuthState();
    }
  }, [setAuthState]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          checkAuthStatus();
        }
      }
    );

    checkAuthStatus();
    return () => {
      subscription.remove();
    };
  }, [checkAuthStatus]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const url = await Linking.getInitialURL();
        if (url) {
          handleAuthDeepLink(url);
        }

        const subscription = Linking.addEventListener("url", ({ url }) => {
          handleAuthDeepLink(url);
        });

        return () => {
          subscription.remove();
        };
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleAuthDeepLink = useCallback(async (url: string) => {
    if (!url.includes("auth/callback")) return;

    const parsedURL = new URL(url);
    const { params } = QueryParams.getQueryParams(parsedURL.search);
    const access_token = params.access_token;
    const refresh_token = params.refresh_token;

    if (access_token && refresh_token) {
      const {
        data: { session },
        error,
      } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        console.error("Error setting session:", error);
        return;
      }

      if (session?.user && url.includes("verified=true")) {
        try {
          // Create profile for newly verified user
          const username = generateUsername(session.user.email ?? "");
          const { error: profileError } = await supabase
            .from("profiles")
            .insert([
              {
                id: session.user.id,
                username,
                email: session.user.email,
              },
            ]);

          if (profileError) throw profileError;

          Toast.show({
            type: "success",
            text1: "Welcome to getProps!",
            text2: "Your account has been verified and created successfully.",
            position: "top",
            visibilityTime: 4000,
          });
        } catch (err) {
          console.error("Error creating profile:", err);
        }
      }
    }
  }, []);

  const signUp = async (
    email: string,
    password: string,
    setError: (error: string | null) => void,
    navigation: any
  ) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.EXPO_PUBLIC_APP_URL}/spots?verified=true`,
        },
      });

      if (error) throw error;

      if (data) {
        Toast.show({
          type: "success",
          text1: "Verification Email Sent",
          text2: "Please check your email to verify your account.",
          position: "top",
          visibilityTime: 4000,
        });
        navigation.navigate("Spots");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message);
    }
  };

  const signIn = async (
    email: string,
    password: string,
    setError: (message: string) => void
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Check if profile exists, if not create it
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select()
          .eq("id", data.user.id)
          .single();

        if (!profile) {
          console.log("Creating profile for verified user...");
          const username = generateUsername(email);

          const { error: profileError } = await supabase
            .from("profiles")
            .insert([
              {
                id: data.user.id,
                username,
                email: data.user.email,
              },
            ]);

          if (profileError) {
            console.error("Profile creation error:", profileError);
            setError(profileError.message);
            return;
          }
        }
      }

      setError(""); // Clear any previous errors
      await setAuthState();
      Toast.show({
        type: "success",
        text1: "Welcome back!",
        text2: "Successfully signed in to getProps.",
        position: "top",
        visibilityTime: 4000,
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setAuthState();
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: "email profile",
        },
      });
      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const initializeAuth = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await setAuthState();
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    initializeAuth,
  };
};
