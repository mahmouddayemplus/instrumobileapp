import React, { useState } from "react";
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
import { signup } from "../firebase/firebaseConfig";

export default function AuthScreen() {
  const [isSignup, setIsSignup] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const result = await signup({ email, password });
      setLoading(false);
      console.log("==========xxx result xxx============");
      console.log(result);
      console.log("====================================");

      if (result.status === "ok") {
        Alert.alert("Success", "Signed up successfully!");
      } else {
        Alert.alert("Signup failed:", result.message);
      }
    } else {
      Alert.alert("Success", "Logged in successfully!");
      console.log("====================================");
      console.log(email, password);

      console.log("====================================");
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
    <View style={styles.container}>
      <Text style={styles.welcomeText}>
        👋 Welcome to <Text style={styles.brand}>Instrumentation Toolbox</Text>
      </Text>
      <Text style={styles.title}>
        {isSignup ? (isExistingUser ? "Login" : "Sign Up") : "Login"}
      </Text>

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
            style={[styles.input, errors.confirmPassword && styles.inputError]}
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
    </View>
  );
}

const GREEN = "#2e8b57";

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
    color: GREEN,
  },
  input: {
    borderWidth: 1,
    borderColor: GREEN,
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
    backgroundColor: GREEN,
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
    color: GREEN,
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
    color: "#444",
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
  },

  brand: {
    color: "#2e8b57",
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
});
