import { RegisterForm } from '@auth/components/RegisterForm';
import { Title } from '@auth/components/Title';
import { HaveAccountText } from '@auth/components/HaveAccountText';
import type { JSX } from 'react';
import {
  ScrollView, View, Image, Keyboard,
  KeyboardAvoidingView,
  Platform, TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import authenticationBackground from '@assets/backgrounds/authenticationBackground.png';

export const RegisterScreen = (): JSX.Element => {
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
            <View className="relative h-[260px] w-full overflow-hidden">
              <Image
                source={authenticationBackground}
                className="absolute top-[-327px] h-auto w-full"
                resizeMode="cover"
              />
            </View>

            <View
              className="mt-[-5px]"
              style={{
                paddingHorizontal: 16,
              }}
            >
              <Title title="Đăng ký" />
              <RegisterForm />
              <HaveAccountText
                text="Bạn đã có tài khoản?"
                linkText="Đăng nhập"
                navigateTo="Login"
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
