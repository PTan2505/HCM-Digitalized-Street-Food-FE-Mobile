import { RegisterForm } from '@auth/components/RegisterForm';
import type { JSX } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const RegisterScreen = (): JSX.Element => {
  return (
    <SafeAreaView
      className="align-items-center flex-1 justify-center bg-white"
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16 }}
      >
        <View className="w-full gap-6">
          <View className="gap-2">
            <Text className="headline-medium text-primary-900">Đăng ký</Text>
            <Text className="body-medium text-primary-600">
              Tạo tài khoản mới để bắt đầu.
            </Text>
          </View>
          <RegisterForm />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
