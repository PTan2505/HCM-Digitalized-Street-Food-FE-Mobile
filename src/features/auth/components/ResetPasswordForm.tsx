import useForgetPassword from '@auth/hooks/useForgetPassword';
import { ResetPasswordSchema } from '@auth/utils/forgetPasswordFormSchema';
import { CustomInput } from '@components/CustomInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectUserStatus } from '@slices/auth';
import type { JSX } from 'react';
import { Pressable, Text, View } from 'react-native';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import type { ResetPasswordRequest } from '@auth/types/forgetPassword';
import { CustomButton } from '@auth/components/CustomButton';
import { useNavigation } from '@react-navigation/native';

const initialValues: ResetPasswordRequest & { confirmPassword: string } = {
  email: '',
  otp: '',
  newPassword: '',
  confirmPassword: '',
};

export interface ResetPasswordFormProps {
  email: string;
  otp: string;
}

export const ResetPasswordForm = (
  props: ResetPasswordFormProps
): JSX.Element => {
  const userStatus = useAppSelector(selectUserStatus);
  const { onResetPassword } = useForgetPassword();
  const navigation = useNavigation();

  const methods = useForm<ResetPasswordRequest & { confirmPassword: string }>({
    defaultValues: { ...initialValues, ...props },
    resolver: zodResolver(ResetPasswordSchema),
  });
  const { control, handleSubmit } = methods;
  const onSubmit: SubmitHandler<
    ResetPasswordRequest & { confirmPassword: string }
  > = async (values) => {
    const { confirmPassword, ...resetData } = values;
    await onResetPassword(resetData);
    navigation.navigate('Login');
  };

  return (
    <FormProvider {...methods}>
      <View className="w-full gap-4 px-5">
        <CustomInput
          name="newPassword"
          control={control}
          label="Mật khẩu mới"
          placeholder="Nhập mật khẩu mới"
          type="password"
          required
        />

        <CustomInput
          name="confirmPassword"
          control={control}
          label="Xác nhận mật khẩu"
          placeholder="Nhập lại mật khẩu mới"
          type="password"
          required
        />

        <CustomButton
          onPress={handleSubmit(onSubmit)}
          isLoading={userStatus === 'pending'}
          text="Xác nhận"
          loadingText="Đang xác nhận..."
        />
      </View>
    </FormProvider>
  );
};
