import useLogin from '@auth/hooks/useLogin';
import { LoginSchema } from '@auth/utils/loginFormSchema';
import { CustomInput } from '@components/CustomInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectUserStatus } from '@slices/auth';
import type { JSX } from 'react';
import { View, Text } from 'react-native';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import type { LoginRequest } from '@auth/types/login';
import { CustomButton } from '@auth/components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const initialValues: LoginRequest = {
  email: '',
  password: '',
};

export const LoginForm = (): JSX.Element => {
  const userStatus = useAppSelector(selectUserStatus);
  const { onLoginSubmit } = useLogin();
  const navigation = useNavigation();

  const methods = useForm<LoginRequest>({
    defaultValues: initialValues,
    resolver: zodResolver(LoginSchema),
  });

  const { control, handleSubmit } = methods;
  const onSubmit: SubmitHandler<LoginRequest> = async (values) => {
    await onLoginSubmit(values);
  };

  return (
    <FormProvider {...methods}>
      <View className="w-full gap-4 px-5">
        <CustomInput
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
        />

        <View className="flex-row items-center py-5">
          <View className="h-[2px] w-[100px] flex-1 rounded-full bg-[#BDBDBD]" />

          <Text className="mx-3 text-center font-semibold text-[#a1d973]">
            Hoặc tiếp tục với
          </Text>

          <View className="h-[2px] w-[100px] flex-1 rounded-full bg-[#BDBDBD]" />
        </View>

        <View className="flex-row justify-center gap-10">
          <MaterialCommunityIcons name="google" size={40} color="#a1d973" />
          <MaterialCommunityIcons name="facebook" size={40} color="#a1d973" />
        </View>
      </View>
    </FormProvider>
  );
};
