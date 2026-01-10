import { OTPForm, OTPFormProps } from '@auth/components/OTPForm';
import type { StaticScreenProps } from '@react-navigation/native';
import type { JSX } from 'react';
import { Title } from '@auth/components/Title';
import {
  ScrollView, Image, View, Text, Keyboard,
  KeyboardAvoidingView,
  Platform, TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import authenticationBackground from '@assets/backgrounds/authenticationBackground.png';

type OTPScreenProps = StaticScreenProps<{
  otpFormProps: OTPFormProps;
}>;

export const OTPScreen = ({ route }: OTPScreenProps): JSX.Element => {
  const { otpFormProps } = route.params;
  return (
    <SafeAreaView className="flex-1" edges={['left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            automaticallyAdjustContentInsets={false}
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          >
            <View className="relative h-[470px] w-full overflow-hidden">
              <Image
                source={authenticationBackground}
                className="absolute top-[-117px] h-auto w-full"
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
                  Nhập mã OTP đã được gửi đến email: {otpFormProps.email}
                </Text>
              </View>
              <OTPForm {...otpFormProps} />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
