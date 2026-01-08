import { OTPForm } from '@auth/components/OTPForm';
import type { JSX } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const OTPScreen = (): JSX.Element => {
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
            <Text className="headline-medium text-primary-900">
              Xác thực OTP
            </Text>
            <Text className="body-medium text-primary-600">
              Nhập mã OTP đã được gửi đến email của bạn.
            </Text>
          </View>
          <OTPForm />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
