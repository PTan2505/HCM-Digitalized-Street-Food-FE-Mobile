import { CustomButton } from '@components/CustomButton';
import { CustomOTPInput } from '@components/CustomOTPInput';
import { FontAwesome6 } from '@expo/vector-icons';
import { LoginWithPhoneNumberRequest } from '@features/auth/types/login';
import { LoginWithPhoneNumberSchema } from '@features/auth/utils/loginFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectUserStatus } from '@slices/auth';
import { formatCountDownTime } from '@utils/formatCountDownTime';
import { useEffect, useRef, useState, type JSX } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import { OtpInputRef } from 'react-native-otp-entry';

const initialValues: LoginWithPhoneNumberRequest = {
  phoneNumber: '',
  otp: '',
};

const RESEND_COOLDOWN = 180;

const maskPhoneNumber = (phoneNumber: string): string => {
  // Keep country code and last 3 digits visible, mask the rest
  // Example: +84334974582 -> +84****4582
  if (!phoneNumber) return '';

  const countryCodeMatch = phoneNumber.match(/^(\+\d{1,3})/);
  if (countryCodeMatch) {
    const countryCode = countryCodeMatch[1];
    const localNumber = phoneNumber.slice(countryCode.length);

    if (localNumber.length > 4) {
      const lastFour = localNumber.slice(-4);
      const masked = '*'.repeat(localNumber.length - 4);
      return `${countryCode} ${masked} ${lastFour}`;
    }
  }

  // Fallback: show last 4 digits
  if (phoneNumber.length > 4) {
    const visible = phoneNumber.slice(-4);
    const masked = '*'.repeat(phoneNumber.length - 4);
    return masked + visible;
  }

  return phoneNumber;
};

export interface OTPFormProps {
  phoneNumber: string;
  onBack: () => void;
  shouldFocus?: boolean;
  // password: string;
}

export const OTPForm = (props: OTPFormProps): JSX.Element => {
  const userStatus = useAppSelector(selectUserStatus);
  const otpRef = useRef<OtpInputRef>(null);

  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [isResending, setIsResending] = useState(false);

  const methods = useForm<LoginWithPhoneNumberRequest>({
    defaultValues: { ...initialValues, ...props },
    resolver: zodResolver(LoginWithPhoneNumberSchema),
  });
  const { handleSubmit } = methods;

  useEffect(() => {
    otpRef.current?.clear();
    // Reset countdown when component becomes visible
    setCountdown(RESEND_COOLDOWN);

    const myInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 0) {
          return prev - 1;
        } else {
          clearInterval(myInterval);
          return 0;
        }
      });
    }, 1000);
    return (): void => {
      clearInterval(myInterval);
    };
  }, [props.phoneNumber]); // Reset when phoneNumber changes (new OTP screen)

  // Handle auto focus when the form becomes visible
  useEffect(() => {
    if (props.shouldFocus) {
      // Wait for animation to complete before focusing
      const timer = setTimeout(() => {
        otpRef.current?.focus();
      }, 300); // Match animation duration
      return (): void => clearTimeout(timer);
    }
    return;
  }, [props.shouldFocus]);

  // eslint-disable-next-line @typescript-eslint/require-await
  const handleResendOTP = async (): Promise<void> => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    //  TODO: call api to resend OTP for login
    setCountdown(RESEND_COOLDOWN);
    setIsResending(false);
  };

  const onSubmit = (data: LoginWithPhoneNumberRequest): void => {
    console.log(data?.otp);
  };

  return (
    <FormProvider {...methods}>
      <View className="w-full gap-4 px-5">
        <Pressable
          onPress={props.onBack}
          className="mb-2 w-[100px] flex-row items-center gap-2 active:opacity-50"
        >
          <FontAwesome6 name="arrow-left" size={20} color="#000" />
          <Text className="text-base font-semibold">Quay lại</Text>
        </Pressable>
        <View className="gap-2 px-5">
          <Text className="text-xl font-semibold">
            Nhập mã OTP đã được gửi đến số điện thoại:{' '}
            {maskPhoneNumber(props.phoneNumber)}
          </Text>
        </View>
        <CustomOTPInput
          ref={otpRef}
          name="otp"
          label="Mã OTP"
          required
          numberOfDigits={6}
        />
        <View className="flex-row justify-center">
          <Pressable
            onPress={handleResendOTP}
            disabled={countdown > 0 || isResending}
          >
            <Text
              className={`text-lg font-semibold ${
                countdown > 0 || isResending
                  ? 'text-gray-400'
                  : 'text-[#a1d973]'
              }`}
            >
              {isResending
                ? 'Đang gửi...'
                : countdown > 0
                  ? 'Gửi lại mã sau'
                  : 'Gửi lại mã'}{' '}
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
