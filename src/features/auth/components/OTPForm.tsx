import { CustomButton } from '@components/CustomButton';
import { CustomOTPInput } from '@components/CustomOTPInput';
import { FontAwesome6 } from '@expo/vector-icons';
import useLogin from '@features/auth/hooks/useLogin';
import { LoginWithPhoneNumberRequest } from '@features/auth/types/login';
import { getLoginWithPhoneNumberSchema } from '@features/auth/utils/loginFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectUserStatus } from '@slices/auth';
import { formatCountDownTime } from '@utils/formatCountDownTime';
import { useEffect, useMemo, useRef, useState, type JSX } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const userStatus = useAppSelector(selectUserStatus);
  const { onVerifyPhoneNumberSubmit } = useLogin();
  const otpRef = useRef<OtpInputRef>(null);

  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [isResending, setIsResending] = useState(false);

  const schema = useMemo(() => getLoginWithPhoneNumberSchema(t), [t]);
  const methods = useForm<LoginWithPhoneNumberRequest>({
    defaultValues: { ...initialValues, phoneNumber: props.phoneNumber },
    resolver: zodResolver(schema),
  });
  const {
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  // Update form when phoneNumber changes (from LoginForm)
  useEffect(() => {
    if (props.phoneNumber) {
      reset({ ...initialValues, phoneNumber: props.phoneNumber });
    }
  }, [props.phoneNumber, reset]);

  // Debug: Log form errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('Form validation errors:', errors);
    }
  }, [errors]);

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

  const onSubmit = async (data: LoginWithPhoneNumberRequest): Promise<void> => {
    try {
      console.log('Verifying OTP with data:', data);
      await onVerifyPhoneNumberSubmit({
        phoneNumber: props.phoneNumber,
        otp: data.otp ?? '',
      });
    } catch (error) {
      console.error('OTP verification failed:', error);
    }
  };

  return (
    <FormProvider {...methods}>
      <View className="w-full gap-4 px-5">
        <Pressable
          onPress={props.onBack}
          className="mb-2 w-[100px] flex-row items-center gap-2 active:opacity-50"
        >
          <FontAwesome6 name="arrow-left" size={20} color="#000" />
          <Text className="text-base font-semibold">{t('auth.back')}</Text>
        </Pressable>
        <View className="gap-2 px-1">
          <Text className="text-xl font-semibold text-primary">
            {t('auth.enter_otp_message')} {maskPhoneNumber(props.phoneNumber)}
          </Text>
        </View>
        <CustomOTPInput
          ref={otpRef}
          name="otp"
          label={t('auth.otp_code')}
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
                  : 'text-primary'
              }`}
            >
              {isResending
                ? t('auth.sending')
                : countdown > 0
                  ? t('auth.resend_code_after')
                  : t('auth.resend_code')}{' '}
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
          text={t('auth.confirm')}
          loadingText={t('auth.confirming')}
        />
      </View>
    </FormProvider>
  );
};
