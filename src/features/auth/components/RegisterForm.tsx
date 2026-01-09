import useRegister from '@auth/hooks/useRegister';
import type { RegisterRequest } from '@auth/types/register';
import { RegisterSchema } from '@auth/utils/registerFormSchema';
import { CustomInput } from '@components/CustomInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import { selectRegisterEmail, selectUserStatus } from '@slices/auth';
import type { JSX } from 'react';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';

const initialValues: RegisterRequest = {
  username: '',
  email: '',
  password: '',
  firstName: '',
  lastName: '',
};

export const RegisterForm = (): JSX.Element => {
  const registerEmail = useAppSelector(selectRegisterEmail);
  const userStatus = useAppSelector(selectUserStatus);
  const { onRegisterSubmit } = useRegister();
  const navigation = useNavigation();

  const methods = useForm<RegisterRequest>({
    defaultValues: initialValues,
    resolver: zodResolver(RegisterSchema),
  });

  const { control, handleSubmit } = methods;
  const onSubmit: SubmitHandler<RegisterRequest> = async (values) => {
    await onRegisterSubmit(values);
    navigation.navigate('OTP', {
      otpFormProps: {
        username: values.username,
        email: values.email,
        password: values.password,
      },
    });
  };

  return (
    <FormProvider {...methods}>
      {registerEmail ? (
        <></>
      ) : (
        <View className="w-full gap-4">
          <CustomInput
            name="username"
            control={control}
            label="Tên đăng nhập"
            placeholder="Nhập tên đăng nhập"
            required
          />
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
          <CustomInput
            name="firstName"
            control={control}
            label="Tên"
            placeholder="Nhập tên"
          />
          <CustomInput
            name="lastName"
            control={control}
            label="Họ"
            placeholder="Nhập họ"
          />

          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={userStatus === 'pending'}
            accessibilityRole="button"
            className={
              'w-full items-center justify-center rounded-md px-4 py-3 ' +
              (userStatus === 'pending' ? 'opacity-60' : '')
            }
          >
            <Text className="title-medium text-primary-900">
              {userStatus === 'pending' ? 'Đang đăng ký...' : 'Đăng ký'}
            </Text>
          </Pressable>
        </View>
      )}
    </FormProvider>
  );
};
