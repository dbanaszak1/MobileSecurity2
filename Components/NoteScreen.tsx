import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { storeNote, getNote } from '../app/storage';

const NoteScreen = ({ route }) => {
  const password = route.params;
  const [note, setNote] = useState('');

  useEffect(() => {
    const loadNote = async () => {
      const savedNote = await getNote(password.password);
      if (savedNote !== null) setNote(savedNote);
    };
    loadNote();
  }, [password]);

  const handleSaveNote = async () => {
    await storeNote(note, password.password);
    Alert.alert('Success', 'Note saved successfully.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Note</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your note here"
        multiline
        value={note}
        onChangeText={setNote}
      />
      <Button title="Save Note" onPress={handleSaveNote} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingVertical: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { flex: 1, borderColor: 'gray', borderWidth: 1, paddingHorizontal: 10, textAlignVertical: 'top' },
});

export default NoteScreen;
