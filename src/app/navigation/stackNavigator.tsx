import { RegisterScreen } from '@features/auth/screens/RegisterScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { JSX } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export type RootStackParamList = {
  Register: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const StackNavigator = (): JSX.Element => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Register"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};
