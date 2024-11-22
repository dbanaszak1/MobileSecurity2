import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { verifyPassword } from '../app/storage';
import { NavigationProp } from '@react-navigation/native';

const LoginScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0); // login attempts
  const [isBlocked, setIsBlocked] = useState(false); // Flag to indicate if login is blocked
  const [blockTimeout, setBlockTimeout] = useState<number | null>(null); // Time until block expires
  const [delay, setDelay] = useState(0); // Delay in handling login attempts

  const MAX_ATTEMPTS = 5; // Maximum allowed login attempts
  const BLOCK_TIME = 30 * 1000; // Block duration in milliseconds (30 seconds)

  const handleLogin = async () => {
    // Check if login is currently blocked
    if (isBlocked) {
      const remainingTime = Math.ceil((blockTimeout! - Date.now()) / 1000); // Calculate remaining block time
      Alert.alert('Blocked', `Too many attempts. Try again in ${remainingTime} seconds.`);
      return;
    }

    // Check if password input is empty
    if (!password.trim()) {
      Alert.alert('Error', 'Password cannot be empty.');
      return;
    }

    // Add delay before verifying the password
    setTimeout(async () => {
      const isValid = await verifyPassword(password); // Verify the entered password

      if (isValid) {
        // Reset attempts and delay on successful login
        setAttempts(0);
        setDelay(0);
        navigation.navigate('Note', { password }); // Navigate to the note screen
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts); 

        if (newAttempts >= MAX_ATTEMPTS) {
          // Block login after reaching the maximum attempts
          setIsBlocked(true);
          const unblockTime = Date.now() + BLOCK_TIME; // Calculate unblock time
          setBlockTimeout(unblockTime);

          // Reomve block after block time
          setTimeout(() => {
            setIsBlocked(false);
            setAttempts(0);
            setBlockTimeout(null);
          }, BLOCK_TIME);

          Alert.alert('Blocked', `Too many failed attempts. App is blocked for 30 seconds.`);
        } else {
          setDelay((prev) => prev + 2000);
          Alert.alert('Error');
        }
      }
    }, delay);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Secure Notepad</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!isBlocked} // Disable input when login is blocked
      />
      <TouchableOpacity 
        style={[styles.button, isBlocked && styles.buttonDisabled]} 
        onPress={handleLogin} 
        disabled={isBlocked} // Disable button when login is blocked
      >
        <Text style={styles.buttonText}>
          {isBlocked ? 'Blocked' : 'Log In'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { 
    height: 40, 
    borderColor: 'gray', 
    borderWidth: 1, 
    marginBottom: 20, 
    paddingHorizontal: 10,
    borderRadius: 5 
  },
  button: {
    backgroundColor: '#4CAF50', 
    paddingVertical: 10, 
    borderRadius: 5, 
    alignItems: 'center',
  },
  buttonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  buttonDisabled: {
    backgroundColor: '#9E9E9E',
  },
});

export default LoginScreen;
