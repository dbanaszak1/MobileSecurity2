import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { verifyPassword } from '../app/storage';
import { NavigationProp } from '@react-navigation/native';
import { get_key } from '../app/biometric';

const LoginScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0); // Login attempts
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeout, setBlockTimeout] = useState<number | null>(null); // Block timeout
  const [delay, setDelay] = useState(0); // Delay for login attempts

  const MAX_ATTEMPTS = 5; 
  const BLOCK_TIME = 30 * 1000; 

  const handleLogin = async () => {
    // Login is currently blocked
    if (isBlocked) {
      const remainingTime = Math.ceil((blockTimeout! - Date.now()) / 1000);
      Alert.alert('Blocked', `Too many attempts. Try again in ${remainingTime} seconds.`);
      return;
    }

    // Password input is empty
    if (!password.trim()) {
      Alert.alert('Error', 'Password cannot be empty.');
      return;
    }

    // Add delay
    setTimeout(async () => {
      const isValid = await verifyPassword(password);

      if (isValid) {
        // Reset attempts and delay on successful login
        setAttempts(0);
        setDelay(0);
        navigation.navigate('Note', { password }); // Navigate to the note screen
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts); 

        if (newAttempts >= MAX_ATTEMPTS) {
          // Block login
          setIsBlocked(true);
          const unblockTime = Date.now() + BLOCK_TIME;
          setBlockTimeout(unblockTime);

          // Reomve block
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


const [pass, setPass] = useState('');


  const handleBiometricAuth = async () => {
      try {
        const password = await get_key()
        if(password == null){
          throw new Error("Error")
        }
        setPass(password);
        console.log(pass);
        const isValid = await verifyPassword(password);
        if (isValid) {
          // Reset attempts and delay on successful login
          setAttempts(0);
          setDelay(0);
          navigation.navigate('Note', { password }); // Navigate to the note screen
        }
      } catch (error) {
        Alert.alert("err");
        console.error(error);
      }
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
        editable={!isBlocked} // Disable input
      />
      <TouchableOpacity 
        style={[styles.button, isBlocked && styles.buttonDisabled]} 
        onPress={handleLogin} 
        disabled={isBlocked} // Disable button
      >
        <Text style={styles.buttonText}>
          {isBlocked ? 'Blocked' : 'Log In'}
        </Text>
      </TouchableOpacity>
      <Button title="Biometric" onPress={handleBiometricAuth} />
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
    padding: 10,
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
