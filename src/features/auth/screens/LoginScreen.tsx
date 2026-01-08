import { LoginForm } from '@auth/components/LoginForm';
import type { JSX } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const LoginScreen = (): JSX.Element => {
  return (
    <SafeAreaView className="align-items-center flex-1 justify-center bg-white">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16 }}
      >
        <View className="w-full gap-6">
          <View className="gap-2">
            <Text className="headline-medium text-primary-900">Đăng nhập</Text>
          </View>
          <LoginForm />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
