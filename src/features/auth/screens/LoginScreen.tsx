import { LoginForm } from '@auth/components/LoginForm';
import { Title } from '@auth/components/Title';
import { HaveAccountText } from '@auth/components/HaveAccountText';
import type { JSX } from 'react';
import {
  ScrollView,
  Image,
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import authenticationBackground from '@assets/backgrounds/authenticationBackground.png';

const HEADER_HEIGHT = Dimensions.get('window').height * 0.58;

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
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          >
            <View
              className="relative w-full overflow-hidden"
              style={{ height: HEADER_HEIGHT }}
            >
              <Image
                source={authenticationBackground}
                style={{
                  position: 'absolute',
                  top: '-22%',
                  height: 'auto',
                  width: '100%',
                  aspectRatio: 393 / 627,
                }}
                resizeMode="cover"
              />
            </View>

            <View
              className="mt-[-20px]"
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
