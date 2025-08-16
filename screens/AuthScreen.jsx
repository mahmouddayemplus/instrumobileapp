import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";
import { storeUser } from "../helper/authStorage";
import { colors } from "../constants/color";

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ActivityIndicator,
} from "react-native";
import { signup, signin } from "../firebase/firebaseConfig";

export default function AuthScreen() {
  const dispatch = useDispatch();

  const [isSignup, setIsSignup] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = () => {
    const newErrors = {};

    if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password || password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (isSignup && !isExistingUser && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (isSignup && !isExistingUser) {
      const result = await signup({ email, password, displayName, companyId });// submit signup new user
      setLoading(false);

      if (result.status === "ok") {
        const dispatchPayload = {
          uid: result.message.uid,
          email: result.message.email,
          emailVerified: result.message.emailVerified,
          displayName: result.message.displayName,
          photoURL: result.message.photoURL,
          token: result.message.accessToken,
          isAdmin:false,
          isPrivileged:false,
          companyId 
        };

        dispatch(login(dispatchPayload)); // result.message contains user object
        // navigation.navigate("HomeTabs"); // Navigate to Home after login
      } else if (result.error && result.message.includes("already in use")) {
        Alert.alert("User already exists", "Please log in instead.");
        setIsExistingUser(true);
        setIsSignup(false);
      } else {
        Alert.alert("Signup failed:", result.message);
      }
    } else {
      const result = await signin({ email, password });
      setLoading(false);

      if (result.status === "ok") {
        const user = {
          uid: result.message.uid,
          email: result.message.email,
          token: result.message.accessToken,
          displayName: result.message.displayName,
          companyId: result.companyId,
          isAdmin:result.isAdmin,
          isPrivileged:result.isPrivileged,
        };
        // store user in async cached
        storeUser(user);

        // Navigate to home or update Redux state

        const dispatchPayload = {
          uid: result.message.uid,
          email: result.message.email,
          emailVerified: result.message.emailVerified,
          displayName: result.message.displayName,
          photoURL: result.message.photoURL,
          token: result.message.accessToken,
          companyId: result.companyId,
          isAdmin:result.isAdmin,
          isPrivileged:result.isPrivileged,
        };

        dispatch(login(dispatchPayload)); // result.message contains user object
        // navigation.replace("HomeTabs");
        // navigation.navigate("HomeTabs"); // Navigate to Home after login
      } else if (result.error && result.message.includes("user not found")) {
        Alert.alert("User not found", "Please sign up first.");
        setIsSignup(true);
        setIsExistingUser(false);
      } else {
        Alert.alert("Login failed:", result.message);
      }
    }
  };
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e8b57" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.welcomeText}>
            <Text style={styles.brand}>instruPro Toolbox</Text>
          </Text>
          <Text style={styles.title}>
            {isSignup ? (isExistingUser ? "Login" : "Sign Up") : "Login"}
          </Text>

          {/* Developer Attribution */}
          <View style={styles.developerContainer}>
            <Text style={styles.developerText}>Developed by</Text>
            <Text style={styles.developerName}>Mahmoud Abdeldayem</Text>
          </View>

          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#888"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Password (6 characters at least)"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: null }));
            }}
            secureTextEntry
            placeholderTextColor="#888"
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          {isSignup && !isExistingUser && (
            <>
              <TextInput
                style={[
                  styles.input,
                  errors.confirmPassword && styles.inputError,
                ]}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword)
                    setErrors((prev) => ({ ...prev, confirmPassword: null }));
                }}
                secureTextEntry
                placeholderTextColor="#888"
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}

              <TextInput
                style={[styles.input]}
                placeholder="Name"
                value={displayName}
                onChangeText={(text) => {
                  setDisplayName(text);
                }}
                autoCapitalize="none"
                placeholderTextColor="#888"
              />
              <TextInput
                style={[styles.input]}
                placeholder="ID"
                value={companyId}
                onChangeText={(text) => {
                  setCompanyId(text);
                }}
                autoCapitalize="none"
                placeholderTextColor="#888"
              />
            </>
          )}

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>
              {isSignup ? (isExistingUser ? "Login" : "Sign Up") : "Login"}
            </Text>
          </TouchableOpacity>

          {isSignup && (
            <View style={styles.switchContainer}>
              <Text>Already have an account?</Text>
              <Switch
                value={isExistingUser}
                onValueChange={setIsExistingUser}
                trackColor={{ false: "#ccc", true: "#7ccf7c" }}
                thumbColor={isExistingUser ? "#2e8b57" : "#f4f3f4"}
              />
            </View>
          )}

          <TouchableOpacity
            onPress={() => {
              setIsSignup((prev) => !prev);
              setIsExistingUser(false);
              setErrors({});
            }}
          >
            <Text style={styles.switchText}>
              {isSignup ? "Switch to Login Only" : "Switch to Sign Up"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const GREEN = colors.primaryDark;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    marginBottom: 24,
    textAlign: "center",
    fontWeight: "bold",
    color: colors.primaryDark,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.primaryDark,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    color: "#000",
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginBottom: 8,
    marginLeft: 4,
  },
  button: {
    backgroundColor: colors.primaryDark,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  switchText: {
    marginTop: 16,
    color: colors.primaryDark,
    textAlign: "center",
    fontWeight: "600",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    gap: 10,
  },
  welcomeText: {
    fontSize: 36,
    color: colors.primaryDark,
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
  },

  brand: {
    color: colors.primaryDark,
    fontWeight: "bold",
    elevation: 2,
    // textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // Optional: match your app theme
  },
  developerContainer: {
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 8,
  },
  developerText: {
    fontSize: 14,
    color: colors.primaryDark,
    marginBottom: 2,
  },
  developerName: {
    fontSize: 16,
    color: colors.primaryDark,
    fontWeight: "600",
    textAlign: "center",
  },
});
