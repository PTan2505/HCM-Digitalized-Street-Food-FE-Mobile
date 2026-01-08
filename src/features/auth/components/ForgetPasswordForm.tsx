import useForgetPassword from '@auth/hooks/useForgetPassword';
import { ForgetPasswordSchema } from '@auth/utils/forgetPasswordFormSchema';
import { CustomInput } from '@components/CustomInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectUserStatus } from '@slices/auth';
import type { JSX } from 'react';
import { Pressable, Text, View } from 'react-native';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import type { ForgetPasswordRequest } from '@auth/types/forgetPassword';

const initialValues: ForgetPasswordRequest = {
  email: '',
};

export const ForgetPasswordForm = (): JSX.Element => {
  const userStatus = useAppSelector(selectUserStatus);
  const { onRequestForgetPassword } = useForgetPassword();

  const methods = useForm<ForgetPasswordRequest>({
    defaultValues: initialValues,
    resolver: zodResolver(ForgetPasswordSchema),
  });

  const { control, handleSubmit } = methods;
  const onSubmit: SubmitHandler<ForgetPasswordRequest> = async (values) => {
    await onRequestForgetPassword(values);
  };

  return (
    <FormProvider {...methods}>
      <View className="w-full gap-4">
        <CustomInput
          name="email"
          control={control}
          label="Email"
          placeholder="Nhập email"
          type="email"
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
            {userStatus === 'pending' ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu'}
          </Text>
        </Pressable>
      </View>
    </FormProvider>
  );
};
