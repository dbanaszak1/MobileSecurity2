import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { storePassword, storeNote } from '../app/storage';
import { NavigationProp } from '@react-navigation/native';
import store_key from '../app/biometric';
import { getNote } from '../app/storage';

interface PasswordScreenProps {
    navigation: NavigationProp<any>;
    route: { params: { password: string } }
    }

const SetPasswordScreen = ({navigation, route}: PasswordScreenProps) => {
  const [password, setPassword] = useState('');
  const old_password = route.params;
  console.log("Old password", old_password);
  const [note, setNote] = useState('');


  useEffect(() => {
    const loadNote = async () => {
      const savedNote = await getNote(old_password.password);
      if (savedNote !== null) setNote(savedNote);
      console.log('Note loaded:', savedNote);
    };
    loadNote();
  }, [old_password]);


  const handleSetPassword = async () => {
    if (password.length < 10) {
      Alert.alert('Error', 'Password must be at least 10 characters long.');
      return;
    }
    await storePassword(password);
    console.log('Password set successfully');
    await store_key.store_key(password);
    console.log('Biometric key stored');
    console.log(note)
    await storeNote(note, password); // Save an empty note
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
      <Button title="Save New Password" onPress={handleSetPassword}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingHorizontal: 10 }
});

export default SetPasswordScreen;
