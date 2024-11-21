import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { storePassword, storeNote } from '../app/storage';

import { NavigationProp } from '@react-navigation/native';

const SetPasswordScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [password, setPassword] = useState('');

  const handleSetPassword = async () => {
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }
    await storePassword(password);
    console.log('Password set successfully');
    await storeNote('', password); // Save an empty note initially
    console.log('Empty note saved');
    Alert.alert('Success', 'Password set successfully.');
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set a Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter new password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Save Password" onPress={handleSetPassword}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingHorizontal: 10 }
});

export default SetPasswordScreen;
