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
import { View } from 'react-native';
import { CustomButton } from '@auth/components/CustomButton';

const initialValues: RegisterRequest & { confirmPassword: string } = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
};

export const RegisterForm = (): JSX.Element => {
  const registerEmail = useAppSelector(selectRegisterEmail);
  const userStatus = useAppSelector(selectUserStatus);
  const { onRegisterSubmit } = useRegister();
  const navigation = useNavigation();

  const methods = useForm<RegisterRequest & { confirmPassword: string }>({
    defaultValues: initialValues,
    resolver: zodResolver(RegisterSchema),
  });

  const { control, handleSubmit } = methods;
  const onSubmit: SubmitHandler<
    RegisterRequest & { confirmPassword: string }
  > = async (values) => {
    const { confirmPassword, ...registerData } = values;
    await onRegisterSubmit(registerData);
    navigation.navigate('OTP', {
      otpFormProps: {
        username: values.username,
        email: values.email,
        // password: values.password,
      },
    });
    // navigation.navigate('OTP');
  };

  return (
    <FormProvider {...methods}>
      {registerEmail ? (
        <></>
      ) : (
        <View className="w-full gap-4 px-5">
          <CustomInput
            name="username"
            control={control}
            label="Tên đăng nhập"
            placeholder="Nhập tên đăng nhập"
            type="username"
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
          <View className="flex-row gap-4">
            <View className="flex-1">
              <CustomInput
                name="lastName"
                control={control}
                label="Họ"
                type="name"
                placeholder="Nhập họ"
              />
            </View>
            <View className="flex-1">
              <CustomInput
                name="firstName"
                control={control}
                label="Tên"
                type="name"
                placeholder="Nhập tên"
              />
            </View>
          </View>
          <CustomInput
            name="phoneNumber"
            control={control}
            label="Số điện thoại"
            type="phone"
            placeholder="Nhập số điện thoại"
          />
          <View className="flex-row gap-4">
            <View className="flex-1">
              <CustomInput
                name="password"
                control={control}
                label="Mật khẩu"
                placeholder="Nhập mật khẩu"
                type="password"
                required
              />
            </View>
            <View className="flex-1">
              <CustomInput
                name="confirmPassword"
                control={control}
                label="Xác nhận mật khẩu"
                placeholder="Nhập lại mật khẩu"
                type="password"
                required
              />
            </View>
          </View>

          <CustomButton
            onPress={handleSubmit(onSubmit)}
            isLoading={userStatus === 'pending'}
            text="Đăng ký"
            loadingText="Đang đăng ký..."
          />
        </View>
      )}
    </FormProvider>
  );
};
