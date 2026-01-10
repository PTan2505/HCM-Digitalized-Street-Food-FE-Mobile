import type { JSX } from 'react';
import { Text, View } from 'react-native';

export const HaveAccountText = (): JSX.Element => {
  return (
    <View className="mt-2 flex-row items-center justify-center pb-2">
      <Text className="body-medium mt-6 text-center text-[#616161]">
        Bạn đã có tài khoản?{' '}
        <Text className="font-semibold text-[#a1d973]">Đăng nhập</Text>
      </Text>
    </View>
  );
};
