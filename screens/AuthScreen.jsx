import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Switch } from 'react-native';

export default function AuthScreen() {
  const [isSignup, setIsSignup] = useState(true);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = () => {
    if (!email || !password || (isSignup && !isExistingUser && !confirmPassword)) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (isSignup && !isExistingUser && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (isSignup && !isExistingUser) {
      Alert.alert('Success', 'Signed up successfully!');
    } else {
      Alert.alert('Success', 'Logged in successfully!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isSignup ? (isExistingUser ? 'Login' : 'Sign Up') : 'Login'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#888"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />

      {isSignup && !isExistingUser && (
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholderTextColor="#888"
        />
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
    marginBottom: 12,
    color: '#000',
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
