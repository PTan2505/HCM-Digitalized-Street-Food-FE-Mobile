import authenticationBackground from '@assets/backgrounds/authenticationBackground.png';
import FaceBookLogo from '@assets/logos/facebookLogo.svg';
import GoogleLogo from '@assets/logos/googleLogo.svg';
import lowcaLogo from '@assets/logos/lowcaLogo.svg';
import { LoginForm } from '@auth/components/LoginForm';
import SvgIcon from '@components/SvgIcon';
import { APIErrorResponse } from '@custom-types/apiResponse';
import { FontAwesome6 } from '@expo/vector-icons';
import { OTPForm } from '@features/auth/components/OTPForm';
import useLogin from '@features/auth/hooks/useLogin';
import { useAppSelector } from '@hooks/reduxHooks';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { selectUser, selectUserStatus } from '@slices/auth';
import { useEffect, useRef, useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Animated,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const AuthScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  const userStatus = useAppSelector(selectUserStatus);
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();
  const { onGoogleLoginSubmit, onFacebookLoginSubmit } = useLogin();
  const { height: screenHeight } = useWindowDimensions();
  // Scale layout values relative to a 844px reference height (iPhone 12 Pro)
  const scale = Math.min(screenHeight / 844, 1);
  const logoMarginTop = Math.round(200 * scale);
  const buttonsMarginTop = Math.round(250 * scale);
  const logoAnimateUp = Math.round(-150 * scale);
  const imageAnimateUp = Math.round(-250 * scale);
  const phoneFormMarginTop = Math.round(-100 * scale);
  const phoneFormAnimateFrom = Math.round(200 * scale);
  const phoneFormAnimateTo = Math.round(80 * scale);
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const formTransition = useRef(new Animated.Value(0)).current;
  const [isSendedOTP, setIsSendedOTP] = useState(false);
  const phoneNumberRef = useRef('');

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      offlineAccess: true,
    });
  }, []);

  // Navigate to Main if user is already logged in
  useEffect(() => {
    if (userStatus === 'succeeded' && user) {
      navigation.replace('Main');
    }
  }, [user, userStatus, navigation]);

  const handleGoogleLogin = async (): Promise<void> => {
    try {
      await onGoogleLoginSubmit();
    } catch (error) {
      const err = error as APIErrorResponse; // Assert the type here
      if (err?.code === 'CANCELLED') {
        console.log(err);
      } else {
        Alert.alert(t('auth.error'), t('auth.google_login_failed'));
      }
    }
  };

  const handleFacebookLogin = async (): Promise<void> => {
    try {
      await onFacebookLoginSubmit();
    } catch (error) {
      const err = error as APIErrorResponse; // Assert the type here
      if (err?.code === 'CANCELLED') {
        console.log(err);
      } else {
        Alert.alert(t('auth.error'), t('auth.facebook_login_failed'));
      }
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

  useEffect(() => {
    Animated.timing(formTransition, {
      toValue: isSendedOTP ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [isSendedOTP, formTransition]);
  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={['left', 'right', 'bottom']}
    >
      <View className="relative">
        <Animated.View
          style={{
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, logoAnimateUp],
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
              marginTop: logoMarginTop,
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
                  outputRange: [0, imageAnimateUp],
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
            marginTop: buttonsMarginTop,
            paddingHorizontal: 16,
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, -150],
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
                <Text className="font-semibold">
                  {t('auth.login_with_google')}
                </Text>
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
                  {t('auth.login_with_facebook')}
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
                  {t('auth.login_with_phone')}
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      )}
      {showPhoneLogin && (
        <Animated.View
          style={{
            marginTop: phoneFormMarginTop,
            opacity: animatedValue,
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [phoneFormAnimateFrom, phoneFormAnimateTo],
                }),
              },
            ],
          }}
        >
          <View style={{ position: 'relative', width: '100%' }}>
            <Animated.View
              style={{
                opacity: formTransition.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
                transform: [
                  {
                    translateX: formTransition.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -400],
                    }),
                  },
                ],
                position: isSendedOTP ? 'absolute' : 'relative',
                width: '100%',
              }}
              pointerEvents={isSendedOTP ? 'none' : 'auto'}
            >
              <LoginForm
                setIsSendedOTP={setIsSendedOTP}
                phoneNumberRef={phoneNumberRef}
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

            <Animated.View
              style={{
                opacity: formTransition.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
                transform: [
                  {
                    translateX: formTransition.interpolate({
                      inputRange: [0, 1],
                      outputRange: [400, 0],
                    }),
                  },
                ],
                position: !isSendedOTP ? 'absolute' : 'relative',
                width: '100%',
              }}
              pointerEvents={!isSendedOTP ? 'none' : 'auto'}
            >
              <OTPForm
                phoneNumber={phoneNumberRef.current}
                shouldFocus={isSendedOTP}
                onBack={() => {
                  setIsSendedOTP(false);
                }}
              />
            </Animated.View>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};
