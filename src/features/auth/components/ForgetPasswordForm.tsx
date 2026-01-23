import { CustomButton } from '@auth/components/CustomButton';
import useForgetPassword from '@auth/hooks/useForgetPassword';
import type { ForgetPasswordRequest } from '@auth/types/forgetPassword';
import { ForgetPasswordSchema } from '@auth/utils/forgetPasswordFormSchema';
import { CustomInput } from '@components/CustomInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import { selectUserStatus } from '@slices/auth';
import type { JSX } from 'react';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import { View } from 'react-native';

const initialValues: ForgetPasswordRequest = {
  email: '',
};

export const ForgetPasswordForm = (): JSX.Element => {
  const userStatus = useAppSelector(selectUserStatus);
  const { onRequestForgetPassword } = useForgetPassword();
  const navigation = useNavigation();

  const methods = useForm<ForgetPasswordRequest>({
    defaultValues: initialValues,
    resolver: zodResolver(ForgetPasswordSchema),
  });

  const { control, handleSubmit } = methods;
  const onSubmit: SubmitHandler<ForgetPasswordRequest> = async (values) => {
    await onRequestForgetPassword(values);
    navigation.navigate('OTP', {
      otpFormProps: {
        username: '',
        email: values.email,
        otpType: 'password_reset',
      },
    });
  };

  return (
    <FormProvider {...methods}>
      <View className="w-full gap-4 px-5">
        <CustomInput
          name="email"
          label="Email"
          placeholder="Nhập email"
          type="email"
          required
        />

        <CustomButton
          onPress={handleSubmit(onSubmit)}
          isLoading={userStatus === 'pending'}
          text="Gửi yêu cầu"
          loadingText="Đang gửi yêu cầu..."
        />
      </View>
    </FormProvider>
  );
};
