import FaceBookLogo from '@assets/logos/facebookLogo.svg';
import GoogleLogo from '@assets/logos/googleLogo.svg';
import useLogin from '@auth/hooks/useLogin';
import type { LoginRequest } from '@auth/types/login';
import { LoginSchema } from '@auth/utils/loginFormSchema';
import SvgIcon from '@components/SvgIcon';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@hooks/reduxHooks';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { selectUserStatus } from '@slices/auth';
import { useEffect, type JSX } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Alert, Pressable, Text, View } from 'react-native';

const initialValues: LoginRequest = {
  email: '',
  password: '',
};

export const LoginForm = (): JSX.Element => {
  const userStatus = useAppSelector(selectUserStatus);
  const { onGoogleLoginSubmit, onFacebookLoginSubmit } = useLogin();

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      offlineAccess: true,
    });
  }, []);

  const methods = useForm<LoginRequest>({
    defaultValues: initialValues,
    resolver: zodResolver(LoginSchema),
  });

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

  return (
    <FormProvider {...methods}>
      <View className="w-full gap-4 px-5">
        {/* <CustomInput
          name="email"
          control={control}
          label="Email"
          placeholder="Nhập email"
          type="email"
          required
        />
        <CustomInput
          name="password"
          control={control}
          label="Mật khẩu"
          placeholder="Nhập mật khẩu"
          type="password"
          required
        />

        <View className="mt-2 flex-row justify-end">
          <Text
            className="font-semibold text-[#a1d973]"
            onPress={() => navigation.navigate('ForgetPassword')}
          >
            Quên mật khẩu?
          </Text>
        </View>

        <CustomButton
          onPress={handleSubmit(onSubmit)}
          isLoading={userStatus === 'pending'}
          text="Đăng nhập"
          loadingText="Đang đăng nhập..."
        /> */}

        {/* <View className="flex-row items-center py-5">
          <View className="h-[2px] w-[100px] flex-1 rounded-full bg-[#BDBDBD]" />

          <Text className="mx-3 text-center font-semibold text-[#a1d973]">
            Hoặc tiếp tục với
          </Text>

          <View className="h-[2px] w-[100px] flex-1 rounded-full bg-[#BDBDBD]" />
        </View> */}

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
              onPress={() => console.log('Login with phone')}
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
      </View>
    </FormProvider>
  );
};
