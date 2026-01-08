import { StatusBar } from 'expo-status-bar';
import { JSX } from 'react';
import { Text, View } from 'react-native';
import { AppProvider } from '@app/provider';
import { Navigation } from '@app/navigation/stackNavigator';
import { RegisterScreen } from '@features/auth/screens/RegisterScreen';

export default function App(): JSX.Element {
  return (
    <AppProvider>
      <RegisterScreen />
    </AppProvider>
  );
}
