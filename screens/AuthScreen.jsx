import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';

export default function AuthScreen() {
  const [isSignup, setIsSignup] = useState(true);
  const [isExistingUser, setIsExistingUser] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = () => {
    const newErrors = {};

    if (!emailRegex.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignup && !isExistingUser && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      if (isSignup && !isExistingUser) {
        Alert.alert('Success', 'Signed up successfully!');
      } else {
        Alert.alert('Success', 'Logged in successfully!');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isSignup ? (isExistingUser ? 'Login' : 'Sign Up') : 'Login'}
      </Text>

      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        placeholder="Email"
        value={email}
        onChangeText={text => {
          setEmail(text);
          if (errors.email) setErrors(prev => ({ ...prev, email: null }));
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
        onChangeText={text => {
          setPassword(text);
          if (errors.password) setErrors(prev => ({ ...prev, password: null }));
        }}
        secureTextEntry
        placeholderTextColor="#888"
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      {isSignup && !isExistingUser && (
        <>
          <TextInput
            style={[styles.input, errors.confirmPassword && styles.inputError]}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={text => {
              setConfirmPassword(text);
              if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: null }));
            }}
            secureTextEntry
            placeholderTextColor="#888"
          />
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>
          {isSignup ? (isExistingUser ? 'Login' : 'Sign Up') : 'Login'}
        </Text>
      </TouchableOpacity>

      {isSignup && (
        <View style={styles.switchContainer}>
          <Text>Already have an account?</Text>
          <Switch
            value={isExistingUser}
            onValueChange={setIsExistingUser}
            trackColor={{ false: '#ccc', true: '#7ccf7c' }}
            thumbColor={isExistingUser ? '#2e8b57' : '#f4f3f4'}
          />
        </View>
      )}

      <TouchableOpacity onPress={() => {
        setIsSignup(prev => !prev);
        setIsExistingUser(false);
        setErrors({});
      }}>
        <Text style={styles.switchText}>
          {isSignup ? 'Switch to Login Only' : 'Switch to Sign Up'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const GREEN = '#2e8b57';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    color: GREEN,
  },
  input: {
    borderWidth: 1,
    borderColor: GREEN,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    color: '#000',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
    marginLeft: 4,
  },
  button: {
    backgroundColor: GREEN,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  switchText: {
    marginTop: 16,
    color: GREEN,
    textAlign: 'center',
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 10,
  },
});
