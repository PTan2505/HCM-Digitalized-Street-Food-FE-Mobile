import Secure from '@assets/secure.png';
import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import {
  useChangePin,
  useRemovePin,
  useSetPin,
  useVerifyPin,
} from '@user/hooks/pin/usePinMutations';
import { JSX, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, View } from 'react-native';
import { OtpInput, OtpInputRef } from 'react-native-otp-entry';
import { SafeAreaView } from 'react-native-safe-area-context';

type Mode = 'setup' | 'change' | 'remove';
type Step = 'enter' | 'current' | 'new' | 'confirm';

type PinScreenProps = StaticScreenProps<{ mode: Mode }>;

const initialStep = (mode: Mode): Step =>
  mode === 'setup' ? 'enter' : 'current';

export const PinScreen = ({ route }: PinScreenProps): JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { mode } = route.params;

  const { mutateAsync: setPin, isPending: isSetPending } = useSetPin();
  const { mutateAsync: verifyPin, isPending: isVerifyPending } = useVerifyPin();
  const { mutateAsync: changePin, isPending: isChangePending } = useChangePin();
  const { mutateAsync: removePin, isPending: isRemovePending } = useRemovePin();

  const [step, setStep] = useState<Step>(() => initialStep(mode));
  const [savedPin, setSavedPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [error, setError] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(
    null
  );

  const otpRef = useRef<OtpInputRef>(null);

  const handleFilled = useCallback(
    async (value: string): Promise<void> => {
      setError('');

      if (mode === 'setup') {
        if (step === 'enter') {
          setSavedPin(value);
          setStep('confirm');
          return;
        }
        if (value !== savedPin) {
          setError(t('pin.mismatch_error'));
          return;
        }
        try {
          await setPin(value);
          navigation.goBack();
        } catch {
          setError(t('pin.save_error'));
        }
        return;
      }

      if (mode === 'remove') {
        try {
          await removePin(value);
          navigation.goBack();
          navigation.goBack();
        } catch {
          setError(t('pin.remove_error'));
        }
        return;
      }

      // mode === 'change'
      if (step === 'current') {
        try {
          const result = await verifyPin(value);
          if (result.success) {
            setCurrentPin(value);
            setAttemptsRemaining(null);
            setStep('new');
          } else {
            setAttemptsRemaining(result.attemptsRemaining ?? null);
            setError(
              result.attemptsRemaining === 0
                ? t('pin.locked_error')
                : t('pin.wrong_pin')
            );
          }
        } catch (err: unknown) {
          if (err !== null && typeof err === 'object' && 'response' in err) {
            const axiosErr = err as {
              response?: { status?: number };
            };
            if (axiosErr.response?.status === 429) {
              setError(t('pin.locked_error'));
              return;
            }
          }
          setError(t('pin.verify_error'));
        }
        return;
      }

      if (step === 'new') {
        setSavedPin(value);
        setStep('confirm');
        return;
      }

      // step === 'confirm'
      if (value !== savedPin) {
        setError(t('pin.mismatch_error'));
        return;
      }
      try {
        await changePin({ currentPin, newPin: savedPin });
        navigation.goBack();
      } catch {
        setError(t('pin.change_error'));
        setStep('current');
        setSavedPin('');
        setCurrentPin('');
      }
    },
    [
      changePin,
      currentPin,
      mode,
      navigation,
      removePin,
      savedPin,
      setPin,
      step,
      t,
      verifyPin,
    ]
  );

  const headerTitle: Record<Mode, string> = {
    setup: t('pin.setup_title'),
    change: t('pin.change_action'),
    remove: t('pin.remove_action'),
  };

  const subtitle = ((): string => {
    if (step === 'enter') return t('pin.setup_subtitle');
    if (step === 'new') return t('pin.change_new_title');
    if (step === 'confirm')
      return mode === 'setup'
        ? t('pin.confirm_subtitle')
        : t('pin.confirm_title');
    // step === 'current'
    return mode === 'remove'
      ? t('pin.remove_subtitle')
      : t('pin.change_current_title');
  })();

  const isPending =
    isSetPending || isVerifyPending || isChangePending || isRemovePending;

  const showAttemptsRemaining =
    mode === 'change' &&
    step === 'current' &&
    attemptsRemaining !== null &&
    error.length === 0;

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={['left', 'right', 'bottom']}
    >
      <Header
        title={headerTitle[mode]}
        onBackPress={() => navigation.goBack()}
      />

      <View className="flex-1 items-center justify-start gap-8 px-8 pt-10">
        <Image
          source={Secure}
          resizeMode="cover"
          className="h-56 w-56 self-center"
        />
        <View className="items-center gap-2">
          <Text className="text-center text-xl font-bold text-gray-500">
            {subtitle}
          </Text>
          {error.length > 0 ? (
            <Text className="text-center text-sm text-red-500">{error}</Text>
          ) : showAttemptsRemaining ? (
            <Text className="text-center text-sm text-orange-500">
              {t('pin.attempts_remaining', { count: attemptsRemaining })}
            </Text>
          ) : null}
        </View>

        <OtpInput
          ref={otpRef}
          key={step}
          numberOfDigits={6}
          focusColor={COLORS.primary}
          autoFocus
          hideStick
          blurOnFilled
          secureTextEntry
          type="numeric"
          disabled={isPending}
          onFilled={handleFilled}
          theme={{
            containerStyle: { width: '100%' },
            pinCodeContainerStyle: {
              borderRadius: 8,
              borderWidth: 1,
              minHeight: 52,
            },
            pinCodeTextStyle: { color: COLORS.primary },
          }}
        />
      </View>
    </SafeAreaView>
  );
};
