import { CustomButton } from '@components/CustomButton';
import { CustomOTPInput } from '@components/CustomOTPInput';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState, type JSX } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { OtpInputRef } from 'react-native-otp-entry';
import { z } from 'zod';

const RESEND_COUNTDOWN_SECONDS = 120;

interface Props {
  visible: boolean;
  channels: string[];
  isLoading: boolean;
  isResending: boolean;
  error: string | null;
  onSubmit: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onDismiss: () => void;
}

const schema = z.object({ otp: z.string().min(6, '') });
type FormValues = z.infer<typeof schema>;

const formatCountdown = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const ContactVerificationOTPModal = ({
  visible,
  channels,
  isLoading,
  isResending,
  error,
  onSubmit,
  onResend,
  onDismiss,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const otpRef = useRef<OtpInputRef>(null);
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN_SECONDS);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = (): void => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(RESEND_COUNTDOWN_SECONDS);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          countdownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (visible) {
      startCountdown();
      return;
    }
  }, [visible]);

  const methods = useForm<FormValues>({
    defaultValues: { otp: '' },
    resolver: zodResolver(schema),
  });
  const { handleSubmit, reset } = methods;

  const channelLabel =
    channels.includes('email') && channels.includes('phone')
      ? t('verify.channel_both')
      : channels.includes('email')
        ? t('verify.channel_email')
        : t('verify.channel_phone');

  const handleClose = (): void => {
    reset();
    otpRef.current?.clear();
    onDismiss();
  };

  const onFormSubmit = async ({ otp }: FormValues): Promise<void> => {
    await onSubmit(otp);
    reset();
    otpRef.current?.clear();
  };

  const handleResend = async (): Promise<void> => {
    reset();
    otpRef.current?.clear();
    await onResend();
    startCountdown();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      <View className="rounded-t-3xl bg-white px-5 pb-10 pt-14">
        <View className="flex-row items-center justify-between">
          <Text className="mt-4 text-2xl font-bold text-[#333]">
            {t('verify.otp_title')}
          </Text>
          <TouchableOpacity
            onPress={handleClose}
            className="absolute right-6 top-4"
          >
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <Text className="mb-6 mt-1 text-base text-[#616161]">
          {t('verify.otp_sent_to')} {channelLabel}
        </Text>

        <FormProvider {...methods}>
          <CustomOTPInput
            ref={otpRef}
            name="otp"
            label={t('verify.otp_label')}
            required
            numberOfDigits={6}
          />
        </FormProvider>

        {error && (
          <Text className="mt-3 text-base text-[#FE4763]">{error}</Text>
        )}

        <View className="mt-4 items-center">
          {countdown > 0 ? (
            <Text className="text-sm text-[#616161]">
              {t('verify.resend_in', { time: formatCountdown(countdown) })}
            </Text>
          ) : (
            <Pressable
              onPress={handleResend}
              disabled={isResending}
              className="py-2"
            >
              <Text className="text-sm font-semibold text-primary">
                {isResending
                  ? t('verify.resending_otp')
                  : t('verify.resend_otp')}
              </Text>
            </Pressable>
          )}
        </View>

        <View className="mt-4 gap-3">
          <CustomButton
            text={t('verify.confirm')}
            loadingText={t('verify.confirming')}
            isLoading={isLoading}
            onPress={handleSubmit(onFormSubmit)}
          />
        </View>
      </View>
    </Modal>
  );
};
