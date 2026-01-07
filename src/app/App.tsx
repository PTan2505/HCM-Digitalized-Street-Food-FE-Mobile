import { StatusBar } from 'expo-status-bar';
import { JSX } from 'react';
import { Text, View } from 'react-native';
import { TestI18n } from '../components/TestI18n';

export default function App(): JSX.Element {
  return (
    <View className="h-full justify-center bg-blue-400">
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
      <TestI18n />
    </View>
  );
}
