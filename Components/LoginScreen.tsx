import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { verifyPassword } from '../app/storage';

import { NavigationProp } from '@react-navigation/native';

const LoginScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [password, setPassword] = useState('');

  // Function to handle login
  const handleLogin = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Password cannot be empty.');
      return;
    }

    const isValid = await verifyPassword(password);
    if (isValid) {
      navigation.navigate('Note', { password }); // Pass password to NoteScreen
    } else {
      Alert.alert('Error', 'Incorrect password.');
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
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
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
  }
});

export default LoginScreen;
