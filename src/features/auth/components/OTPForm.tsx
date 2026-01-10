import useRegister from '@auth/hooks/useRegister';
import type { VerifyRegistrationRequest, ResendRegistrationOTPRequest } from '@auth/types/register';
import { VerifyRegistrationSchema } from '@auth/utils/registerFormSchema';
import { CustomOTPInput } from '@components/CustomOTPInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import { selectUserStatus } from '@slices/auth';
import { type JSX, useState, useEffect } from 'react';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import { CustomButton } from '@auth/components/CustomButton';
import { formatCountDownTime } from '@utils/formatCountDownTime';

const initialValues: VerifyRegistrationRequest = {
  // username: '',
  email: '',
  // password: '',
  otp: '',
};

const RESEND_COOLDOWN = 180;

export interface OTPFormProps {
  username: string;
  email: string;
  // password: string;
}

export const OTPForm = (props: OTPFormProps): JSX.Element => {
  const userStatus = useAppSelector(selectUserStatus);
  const { onVerifyRegistration, onResendRegistrationOTP } = useRegister();
  const navigation = useNavigation();

  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [isResending, setIsResending] = useState(false);

  const methods = useForm<VerifyRegistrationRequest>({
    defaultValues: { ...initialValues, ...props },
    resolver: zodResolver(VerifyRegistrationSchema),
  });

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendOTP = async (): Promise<void> => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    await onResendRegistrationOTP({
      email: props.email,
      username: props.username,
    });
    setCountdown(RESEND_COOLDOWN);
    setIsResending(false);
  };

  const { control, handleSubmit } = methods;
  const onSubmit: SubmitHandler<VerifyRegistrationRequest> = async (values) => {
    await onVerifyRegistration(values);
    navigation.navigate('Main');
  };

  return (
    <FormProvider {...methods}>
      <View className="w-full gap-4 px-5">
        <CustomOTPInput
          name="otp"
          control={control}
          label="Mã OTP"
          required
          numberOfDigits={6}
        />
        <View className="flex-row justify-center ">
          <Pressable
            onPress={handleResendOTP}
            disabled={countdown > 0 || isResending}
          >
            <Text
              className={`text-lg font-semibold ${countdown > 0 || isResending
                ? 'text-gray-400'
                : 'text-[#a1d973]'
                }`}
            >
              {isResending ? 'Đang gửi...' : countdown > 0 ? 'Gửi lại mã sau' : 'Gửi lại mã'}{' '}
              {countdown > 0 && (
                <Text className="text-lg font-semibold text-[#616161]">
                  {formatCountDownTime(countdown)}
                </Text>
              )}
            </Text>
          </Pressable>
        </View>
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
