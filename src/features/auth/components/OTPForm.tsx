import useRegister from '@auth/hooks/useRegister';
import { VerifyRegistrationSchema } from '@auth/utils/registerFormSchema';
import { CustomOTPInput } from '@components/CustomOTPInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectUserStatus } from '@slices/auth';
import type { JSX } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  FormProvider,
  useForm,
  useWatch,
  type SubmitHandler,
} from 'react-hook-form';
import type { VerifyRegistrationRequest } from '@auth/types/register';

const initialValues: VerifyRegistrationRequest = {
  username: '',
  email: '',
  password: '',
  otp: '',
};

export const OTPForm = (): JSX.Element => {
  const userStatus = useAppSelector(selectUserStatus);
  const { onVerifyRegistration } = useRegister();

  const methods = useForm<VerifyRegistrationRequest>({
    defaultValues: initialValues,
    resolver: zodResolver(VerifyRegistrationSchema),
  });

  const { control, handleSubmit } = methods;
  const onSubmit: SubmitHandler<VerifyRegistrationRequest> = async (values) => {
    await onVerifyRegistration(values);
  };

  return (
    <FormProvider {...methods}>
      <View className="w-full gap-4">
        <CustomOTPInput
          name="otp"
          control={control}
          label="Mã OTP"
          required
          numberOfDigits={6}
        />
        ;
        <Pressable
          className="items-center rounded-lg bg-blue-500 p-3"
          onPress={handleSubmit(onSubmit)}
          disabled={userStatus === 'pending'}
        >
          <Text className="text-base font-medium text-white">Xác nhận</Text>
        </Pressable>
      </View>
    </FormProvider>
  );
};
