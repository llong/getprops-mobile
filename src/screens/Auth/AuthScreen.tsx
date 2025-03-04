import React, { useState, useEffect } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Button, Input, Text, useTheme } from "@rneui/themed";
import { useAuth } from "@hooks/useAuth";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type AuthStackParamList = {
  Auth: undefined;
  SignUp: undefined;
};

type AuthScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Auth"
>;

export const AuthScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { signIn, signInWithGoogle, loading } = useAuth();
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      padding: 20,
      justifyContent: "center",
    },
    title: {
      textAlign: "center",
      marginBottom: 30,
    },
    input: {
      marginBottom: 10,
    },
    button: {
      marginVertical: 10,
    },
    error: {
      color: theme.colors.error,
      textAlign: "center",
      marginBottom: 10,
    },
  });

  useEffect(() => {
    return () => {
      setEmail("");
      setPassword("");
    };
  }, []);

  const handleSignIn = async () => {
    try {
      setError(null);
      await signIn(email, password, setError);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text h3 style={styles.title}>
          getProps
        </Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          containerStyle={styles.input}
        />

        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          containerStyle={styles.input}
        />

        <Button
          title="Sign In"
          onPress={handleSignIn}
          loading={loading}
          disabled={loading}
          containerStyle={styles.button}
        />

        <Button
          title="Create Account"
          onPress={() => navigation.navigate("SignUp")}
          type="clear"
          containerStyle={styles.button}
        />

        <Button
          title="Sign in with Google"
          onPress={signInWithGoogle}
          containerStyle={styles.button}
          icon={{
            name: "google",
            type: "font-awesome",
            color: "white",
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};
