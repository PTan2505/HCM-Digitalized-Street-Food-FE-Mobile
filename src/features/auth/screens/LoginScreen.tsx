import authenticationBackground from '@assets/backgrounds/authenticationBackground.png';
import { HaveAccountText } from '@auth/components/HaveAccountText';
import { LoginForm } from '@auth/components/LoginForm';
import { Title } from '@auth/components/Title';
import type { JSX } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const LoginScreen = (): JSX.Element => {
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
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View className="relative">
              <Image
                source={authenticationBackground}
                style={{
                  position: 'absolute',
                  top: -250,
                  height: 'auto',
                  width: '100%',
                  aspectRatio: 393 / 627,
                }}
                resizeMode="cover"
              />
            </View>

            <View
              style={{
                backgroundColor: 'transparent',
                paddingHorizontal: 16,
                marginTop: 280,
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
