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

const initialValues: ResetPasswordRequest = {
  email: '',
  otp: '',
  newPassword: '',
};

export const ResetPasswordForm = (): JSX.Element => {
  const userStatus = useAppSelector(selectUserStatus);
  const { onResetPassword } = useForgetPassword();

  const methods = useForm<ResetPasswordRequest>({
    defaultValues: initialValues,
    resolver: zodResolver(ResetPasswordSchema),
  });
  const { control, handleSubmit } = methods;
  const onSubmit: SubmitHandler<ResetPasswordRequest> = async (values) => {
    await onResetPassword(values);
  };

  return (
    <FormProvider {...methods}>
      <View className="w-full gap-4">
        <CustomInput
          name="newPassword"
          control={control}
          label="Mật khẩu mới"
          placeholder="Nhập mật khẩu mới"
          type="password"
          required
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
            {userStatus === 'pending' ? 'Đang xác nhận...' : 'Xác nhận'}
          </Text>
        </Pressable>
      </View>
    </FormProvider>
  );
};
