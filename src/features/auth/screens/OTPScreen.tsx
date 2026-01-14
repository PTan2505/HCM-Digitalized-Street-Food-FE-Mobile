import { OTPForm, OTPFormProps } from '@auth/components/OTPForm';
import type { StaticScreenProps } from '@react-navigation/native';
import type { JSX } from 'react';
import { Title } from '@auth/components/Title';
import {
  ScrollView,
  Image,
  View,
  Text,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            automaticallyAdjustContentInsets={false}
            contentContainerStyle={{
              flexGrow: 1,
            }}
          >
            <View className="relative w-full">
              <View
                style={{
                  position: 'absolute',
                  top: -90,
                  width: '100%',
                }}
              >
                <Image
                  source={authenticationBackground}
                  style={{
                    height: 'auto',
                    width: '100%',
                    aspectRatio: 393 / 627,
                  }}
                  resizeMode="cover"
                />
              </View>
            </View>

            <View
              style={{
                marginTop: 500,
                paddingHorizontal: 16,
                backgroundColor: 'transparent',
              }}
            >
              <Title title="Xác thực OTP" />
              <View className="gap-2 px-5">
                <Text className="body-medium font-semibold text-[#a1d973]">
                  Nhập mã OTP đã được gửi đến email: {otpFormProps?.email}
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
