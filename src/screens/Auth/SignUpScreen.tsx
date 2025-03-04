import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Button, Input, Text, Icon } from "@rneui/themed";
import { useAuth } from "@hooks/useAuth";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";

type AuthStackParamList = {
  Auth: undefined;
  SignUp: undefined;
};

type SignUpScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  "SignUp"
>;

export const SignUpScreen = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const { signUp, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [debouncedPassword, setDebouncedPassword] = useState("");
  const [debouncedConfirmPassword, setDebouncedConfirmPassword] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPassword(password);
    }, 300);
    return () => clearTimeout(timer);
  }, [password]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedConfirmPassword(confirmPassword);
    }, 300);
    return () => clearTimeout(timer);
  }, [confirmPassword]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return Boolean(emailRegex.test(email));
  };

  const getPasswordValidation = useCallback((pass: string) => {
    return {
      minLength: Boolean(pass.length >= 6),
      hasLetter: Boolean(/[a-zA-Z]/.test(pass)),
      hasNumber: Boolean(/\d/.test(pass)),
      hasSpecial: Boolean(/[!@#$%^&*(),.?":{}|<>]/.test(pass)),
    };
  }, []);

  const isPasswordValid = useCallback(
    (pass: string) => {
      const validation = getPasswordValidation(pass);
      return Object.values(validation).every(Boolean);
    },
    [getPasswordValidation]
  );

  const isFormValid = useMemo(() => {
    return Boolean(
      validateEmail(email) &&
        isPasswordValid(debouncedPassword) &&
        debouncedPassword === debouncedConfirmPassword &&
        debouncedPassword.length > 0 &&
        debouncedConfirmPassword.length > 0
    );
  }, [email, debouncedPassword, debouncedConfirmPassword]);

  const getValidationMessage = useCallback(() => {
    if (!email) return "Email is required";
    if (!validateEmail(email)) return "Please enter a valid email";
    if (!debouncedPassword) return "Password is required";

    const validation = getPasswordValidation(debouncedPassword);
    if (!validation.minLength) return "Password must be at least 6 characters";
    if (!validation.hasLetter) return "Password must contain a letter";
    if (!validation.hasNumber) return "Password must contain a number";
    if (!validation.hasSpecial)
      return "Password must contain a special character";

    if (!debouncedConfirmPassword) return "Please confirm your password";
    if (debouncedPassword !== debouncedConfirmPassword)
      return "Passwords do not match";

    return "";
  }, [email, debouncedPassword, debouncedConfirmPassword]);

  const validationMessage = useMemo(() => {
    return getValidationMessage();
  }, [getValidationMessage]);

  const handleSignUp = async () => {
    if (loading) return;

    Keyboard.dismiss();

    try {
      setError(null);
      if (!isFormValid) {
        setError(validationMessage);
        return;
      }
      await signUp(email, password, setError, navigation);
      // Clear form after successful signup
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getPasswordStrength = useCallback((pass: string) => {
    if (!pass) return "";
    const checks = [
      pass.length >= 6,
      /[a-zA-Z]/.test(pass),
      /\d/.test(pass),
      /[!@#$%^&*(),.?":{}|<>]/.test(pass),
    ];
    const strength = checks.filter((check) => Boolean(check)).length;
    return ["Weak", "Fair", "Good", "Strong"][strength - 1] || "";
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text h3 style={styles.title}>
          Create An Account
        </Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          leftIcon={<Icon name="email" type="material" color="#86939e" />}
          errorMessage={
            email && !validateEmail(email) ? "Invalid email format" : ""
          }
        />

        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          leftIcon={<Icon name="lock" type="material" color="#86939e" />}
          rightIcon={
            <Icon
              name={showPassword ? "visibility" : "visibility-off"}
              type="material"
              color="#86939e"
              onPress={() => setShowPassword(!showPassword)}
            />
          }
          errorStyle={{ color: "transparent", height: 0 }}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          containerStyle={styles.fieldContainer}
        />
        {Boolean(debouncedPassword) && (
          <>
            <Text style={styles.strengthText}>
              Strength: {getPasswordStrength(debouncedPassword)}
            </Text>
            {!isPasswordValid(debouncedPassword) && (
              <Text style={styles.validationText}>
                Password must contain at least 6 characters, a letter, a number,
                and a special character
              </Text>
            )}
          </>
        )}

        <Input
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          leftIcon={<Icon name="lock" type="material" color="#86939e" />}
          rightIcon={
            <Icon
              name={showConfirmPassword ? "visibility" : "visibility-off"}
              type="material"
              color="#86939e"
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          }
          errorStyle={
            debouncedConfirmPassword &&
            debouncedPassword !== debouncedConfirmPassword
              ? undefined
              : { color: "transparent", height: 0 }
          }
          errorMessage={
            debouncedConfirmPassword &&
            debouncedPassword !== debouncedConfirmPassword
              ? "Passwords do not match"
              : ""
          }
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          containerStyle={styles.fieldContainer}
        />

        <Button
          title="Sign Up"
          onPress={handleSignUp}
          loading={loading}
          disabled={loading || !isFormValid}
          containerStyle={styles.button}
        />

        <Button
          title="Back to Login"
          onPress={() => navigation.goBack()}
          type="clear"
          containerStyle={styles.button}
        />

        {!isFormValid && validationMessage && (
          <Text style={styles.validationText}>{validationMessage}</Text>
        )}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    marginVertical: 10,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  strengthText: {
    textAlign: "right",
    marginTop: -15,
    marginBottom: 15,
    marginRight: 10,
    fontSize: 12,
    color: "#86939e",
  },
  validationText: {
    color: "#ff6b6b",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  inputContainer: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderColor: "#86939e",
  },
  inputText: {
    color: "#000",
    fontSize: 16,
  },
  fieldContainer: {
    marginBottom: 10,
  },
});
