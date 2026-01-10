import { OTPForm, OTPFormProps } from '@auth/components/OTPForm';
import type { StaticScreenProps } from '@react-navigation/native';
import type { JSX } from 'react';
import { Title } from '@auth/components/Title';
import { ScrollView, Image, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import authenticationBackground from '@assets/backgrounds/authenticationBackground.png';

type OTPScreenProps = StaticScreenProps<{
  otpFormProps: OTPFormProps;
}>;

// export const OTPScreen = ({ route }: OTPScreenProps): JSX.Element => {
  export const OTPScreen = ({ route }: OTPScreenProps): JSX.Element => {
  const { otpFormProps } = route.params;
  return (
    <SafeAreaView className="flex-1" edges={['left', 'right']}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="relative h-[532px] w-full overflow-hidden">
          <Image
            source={authenticationBackground}
            className="absolute top-[-55px] h-auto w-full"
            resizeMode="cover"
          />
        </View>
        <View
          className="mt-[-5px]"
          style={{
            paddingHorizontal: 16,
          }}
        >
          <Title title="Xác thực OTP" />
          <View className="mb-5 gap-2 px-5">
            <Text className="body-medium font-semibold text-[#a1d973]">
              Nhập mã OTP đã được gửi đến email của bạn.
            </Text>
          </View>
          <OTPForm {...otpFormProps} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
