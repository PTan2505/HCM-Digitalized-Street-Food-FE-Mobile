import useRegister from '@auth/hooks/useRegister';
import type { VerifyRegistrationRequest } from '@auth/types/register';
import { VerifyRegistrationSchema } from '@auth/utils/registerFormSchema';
import { CustomOTPInput } from '@components/CustomOTPInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import { selectUserStatus } from '@slices/auth';
import type { JSX } from 'react';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';

const initialValues: VerifyRegistrationRequest = {
  // username: '',
  email: '',
  // password: '',
  otp: '',
};

export interface OTPFormProps {
  // username: string;
  email: string;
  // password: string;
}

export const OTPForm = (props: OTPFormProps): JSX.Element => {
  const userStatus = useAppSelector(selectUserStatus);
  const { onVerifyRegistration } = useRegister();
  const navigation = useNavigation();

  const methods = useForm<VerifyRegistrationRequest>({
    defaultValues: { ...initialValues, ...props },
    resolver: zodResolver(VerifyRegistrationSchema),
  });

  const { control, handleSubmit } = methods;
  const onSubmit: SubmitHandler<VerifyRegistrationRequest> = async (values) => {
    await onVerifyRegistration(values);
    navigation.navigate('Main');
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
