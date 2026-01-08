import { RegisterForm } from '@auth/components/RegisterForm';
import useRegister from '@auth/hooks/useRegister';
import type { JSX } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const RegisterScreen = (): JSX.Element => {
  const { registerEmail, onClearRegisterEmail } = useRegister();

  return (
    <SafeAreaView className="align-items-center flex-1 justify-center bg-white">
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

          {registerEmail ? (
            <View className="gap-3">
              <Text className="body-medium text-primary-900">
                Mã OTP đã được gửi tới {registerEmail}. Vui lòng kiểm tra email
                để xác thực.
              </Text>
              <Pressable
                onPress={onClearRegisterEmail}
                accessibilityRole="button"
              >
                <Text className="body-medium text-primary-600 underline">
                  Đăng ký lại
                </Text>
              </Pressable>
            </View>
          ) : (
            <RegisterForm />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
