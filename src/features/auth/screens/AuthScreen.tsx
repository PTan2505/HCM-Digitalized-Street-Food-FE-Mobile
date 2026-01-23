import authenticationBackground from '@assets/backgrounds/authenticationBackground.png';
import FaceBookLogo from '@assets/logos/facebookLogo.svg';
import GoogleLogo from '@assets/logos/googleLogo.svg';
import lowcaLogo from '@assets/logos/lowcaLogo.svg';
import { LoginForm } from '@auth/components/LoginForm';
import SvgIcon from '@components/SvgIcon';
import { FontAwesome6 } from '@expo/vector-icons';
import useLogin from '@features/auth/hooks/useLogin';
import { useAppSelector } from '@hooks/reduxHooks';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { selectUserStatus } from '@slices/auth';
import { useEffect, useRef, useState, type JSX } from 'react';
import { Alert, Animated, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const AuthScreen = (): JSX.Element => {
  const userStatus = useAppSelector(selectUserStatus);
  const { onGoogleLoginSubmit, onFacebookLoginSubmit } = useLogin();
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      offlineAccess: true,
    });
  }, []);

  const handleGoogleLogin = async (): Promise<void> => {
    try {
      await onGoogleLoginSubmit();
    } catch (error) {
      console.log(error);

      Alert.alert('Lỗi', 'Đăng nhập Google thất bại');
    }
  };

  const handleFacebookLogin = async (): Promise<void> => {
    try {
      await onFacebookLoginSubmit();
    } catch (error) {
      console.log(error);

      Alert.alert('Lỗi', 'Đăng nhập Facebook thất bại');
    }
  };

  const handlePhoneLogin = (): void => {
    setShowPhoneLogin(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView className="flex-1" edges={['left', 'right']}>
      <View className="relative">
        <Animated.View
          style={{
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -150], // Adjust this value to control how much the image pushes up
                }),
              },
            ],
          }}
        >
          <SvgIcon
            width={150}
            height={150}
            icon={lowcaLogo}
            style={{
              marginTop: 200,
              alignSelf: 'center',
            }}
          />
        </Animated.View>
        <Animated.Image
          source={authenticationBackground}
          style={{
            height: 'auto',
            width: '100%',
            aspectRatio: 393 / 627,
            position: 'absolute',
            zIndex: -1,
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -250], // Adjust this value to control how much the image pushes up
                }),
              },
            ],
          }}
          resizeMode="cover"
        />
      </View>

      {!showPhoneLogin && (
        <Animated.View
          style={{
            marginTop: 250,
            paddingHorizontal: 16,
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -150], // Starts at natural position, slides down when animating
                }),
              },
            ],
          }}
        >
          <View className="justify-center gap-4">
            <View className="flex-row justify-center gap-10">
              <Pressable
                className={`relative w-full flex-row items-center justify-center gap-2 rounded-full border-[1px] bg-white p-4 active:opacity-50`}
                onPress={handleGoogleLogin}
                disabled={userStatus === 'pending'}
              >
                <SvgIcon
                  width={20}
                  icon={GoogleLogo}
                  height={20}
                  style={{ position: 'absolute', left: 12 }}
                />
                <Text className="font-semibold">Đăng nhập với Google</Text>
              </Pressable>
            </View>
            <View className="flex-row justify-center gap-10">
              <Pressable
                className={`relative w-full flex-row items-center justify-center gap-2 rounded-full bg-[#1877F2] p-4 active:opacity-50`}
                onPress={handleFacebookLogin}
                disabled={userStatus === 'pending'}
              >
                <SvgIcon
                  width={24}
                  icon={FaceBookLogo}
                  height={24}
                  style={{ position: 'absolute', left: 12 }}
                />
                <Text className="font-semibold text-white">
                  Đăng nhập với Facebook
                </Text>
              </Pressable>
            </View>

            <View className="flex-row justify-center gap-10">
              <Pressable
                className={`relative w-full flex-row items-center justify-center gap-2 rounded-full bg-black p-4 active:opacity-50`}
                onPress={handlePhoneLogin}
                disabled={userStatus === 'pending'}
              >
                <FontAwesome6
                  name="phone"
                  size={20}
                  color="white"
                  style={{ position: 'absolute', left: 12 }}
                />
                <Text className="font-semibold text-white">
                  Đăng nhập với Số điện thoại
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      )}
      {showPhoneLogin && (
        <Animated.View
          style={{
            marginTop: -40,
            opacity: animatedValue,
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [200, 0], // Slides up into position
                }),
              },
            ],
          }}
        >
          <LoginForm
            onBack={() => {
              setShowPhoneLogin(false);
              Animated.timing(animatedValue, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }).start();
            }}
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
};
