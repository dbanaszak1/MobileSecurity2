import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { isPasswordSet } from './storage';
import LoginScreen from '../Components/LoginScreen';
import NoteScreen from '../Components/NoteScreen';
import SetPasswordScreen from '../Components/SetPasswordScreen';
import ChangePasswordScreen from '../Components/ChangePasswordScreen';

const Stack = createStackNavigator();

export default function App() {
  const [initialScreen, setInitialScreen] = useState<string | null>(null);

  useEffect(() => {
    const checkPassword = async () => {
      try {
        const hasPassword = await isPasswordSet();
        console.log(hasPassword);
        setInitialScreen(hasPassword ? 'Login' : 'SetPassword');
      } catch (error) {
        console.error('Error checking password:', error);
        setInitialScreen('SetPassword');
      }
    };
    checkPassword();
  }, []);

  if (initialScreen === null) {
    return null;
  }
  

  return (
    <Stack.Navigator 
      initialRouteName={initialScreen}     
      screenOptions={{
        headerShown: false,
      }}
      >
      <Stack.Screen name="SetPassword" component={SetPasswordScreen} options={{ title: 'Set Password' }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
      <Stack.Screen name="Note" component={NoteScreen} options={{ title: 'Your Note' }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
    </Stack.Navigator>
  );
}
