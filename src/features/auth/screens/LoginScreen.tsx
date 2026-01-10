import { LoginForm } from '@auth/components/LoginForm';
import { Title } from '@auth/components/Title';
import { HaveAccountText } from '@auth/components/HaveAccountText';
import type { JSX } from 'react';
import {
  ScrollView, Image, View, Keyboard,
  KeyboardAvoidingView,
  Platform, TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import authenticationBackground from '@assets/backgrounds/authenticationBackground.png';

export const LoginScreen = (): JSX.Element => {
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
              <Title title="Đăng nhập" />
              <LoginForm />
              <HaveAccountText
                text="Bạn chưa có tài khoản?"
                linkText="Đăng ký"
                navigateTo="Register"
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
