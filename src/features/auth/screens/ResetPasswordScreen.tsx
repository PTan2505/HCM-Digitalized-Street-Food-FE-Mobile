import {
  ResetPasswordForm,
  ResetPasswordFormProps,
} from '@auth/components/ResetPasswordForm';
import type { StaticScreenProps } from '@react-navigation/native';
import type { JSX } from 'react';
import { Title } from '@auth/components/Title';
import {
  ScrollView,
  Image,
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import authenticationBackground from '@assets/backgrounds/authenticationBackground.png';

type ResetPasswordScreenProps = StaticScreenProps<{
  resetPasswordFormProps: ResetPasswordFormProps;
}>;

export const ResetPasswordScreen = ({
  route,
}: ResetPasswordScreenProps): JSX.Element => {
  const { resetPasswordFormProps } = route.params;
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
                marginTop: 520,
                paddingHorizontal: 16,
                backgroundColor: 'transparent',
              }}
            >
              <Title title="Đặt lại mật khẩu" />
              <ResetPasswordForm {...resetPasswordFormProps} />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
