import authenticationBackground from '@assets/backgrounds/authenticationBackground.png';
import { LoginForm } from '@auth/components/LoginForm';
import { RegisterForm } from '@auth/components/RegisterForm';
import { Title } from '@auth/components/Title';
import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AuthMode = 'login' | 'register';

export const AuthScreen = (): JSX.Element => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const imageTopPosition = useRef(new Animated.Value(-250)).current;
  const contentMarginTop = useRef(new Animated.Value(280)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    // Stop any ongoing animation
    if (animationRef.current) {
      animationRef.current.stop();
    }

    animationRef.current = Animated.parallel([
      Animated.timing(imageTopPosition, {
        toValue: authMode === 'login' ? -250 : -380,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(contentMarginTop, {
        toValue: authMode === 'login' ? 280 : 150,
        duration: 400,
        useNativeDriver: false,
      }),
    ]);

    animationRef.current.start();
  }, [authMode, contentMarginTop, imageTopPosition]);

  const toggleAuthMode = (): void => {
    setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'));
  };

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
              <Animated.View
                style={{
                  position: 'absolute',
                  top: imageTopPosition,
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
              </Animated.View>
            </View>

            <Animated.View
              style={{
                marginTop: contentMarginTop,
                paddingHorizontal: 16,
                backgroundColor: 'transparent',
              }}
            >
              <Title title={authMode === 'login' ? 'Đăng nhập' : 'Đăng ký'} />
              {authMode === 'login' ? <LoginForm /> : <RegisterForm />}
              <View className="mb-6 mt-2 flex-row items-center justify-center pb-2">
                <Text className="body-medium mt-6 text-center text-[#616161]">
                  {authMode === 'login'
                    ? 'Bạn chưa có tài khoản? '
                    : 'Bạn đã có tài khoản? '}
                  <Text
                    className="font-semibold text-[#a1d973]"
                    onPress={toggleAuthMode}
                  >
                    {authMode === 'login' ? 'Đăng ký' : 'Đăng nhập'}
                  </Text>
                </Text>
              </View>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
