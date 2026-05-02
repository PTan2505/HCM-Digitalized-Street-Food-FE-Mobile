import { COLORS } from '@constants/colors';
import { useVerifyPin } from '@user/hooks/pin/usePinMutations';
import {
  forwardRef,
  JSX,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { OtpInput, OtpInputRef } from 'react-native-otp-entry';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.8;

export interface PinVerifyModalRef {
  open: () => Promise<boolean>;
}

export const PinVerifyModal = forwardRef<PinVerifyModalRef>(
  (_, ref): JSX.Element => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { mutateAsync: verifyPin } = useVerifyPin();

    const [modalVisible, setModalVisible] = useState(false);
    const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(
      null
    );
    const [cooldown, setCooldown] = useState(0);
    const [inputKey, setInputKey] = useState(0);

    const resolveRef = useRef<((value: boolean) => void) | null>(null);
    const otpRef = useRef<OtpInputRef>(null);
    const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
      null
    );

    const translateY = useSharedValue(SHEET_HEIGHT);
    const backdropOpacity = useSharedValue(0);

    const sheetStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
      opacity: backdropOpacity.value,
    }));

    const dismiss = useCallback(
      (result: boolean): void => {
        backdropOpacity.value = withTiming(0, { duration: 200 });
        translateY.value = withTiming(SHEET_HEIGHT, { duration: 250 });
        setTimeout(() => {
          setModalVisible(false);
          setAttemptsRemaining(null);
          setCooldown(0);
          resolveRef.current?.(result);
          resolveRef.current = null;
        }, 260);
      },
      [backdropOpacity, translateY]
    );

    useImperativeHandle(ref, () => ({
      open: (): Promise<boolean> => {
        setAttemptsRemaining(null);
        setCooldown(0);
        setInputKey((k) => k + 1);
        setModalVisible(true);
        backdropOpacity.value = withTiming(0.5, { duration: 220 });
        translateY.value = withTiming(0, { duration: 300 });
        return new Promise((resolve) => {
          resolveRef.current = resolve;
        });
      },
    }));

    useEffect(() => {
      if (cooldown <= 0) {
        if (cooldownIntervalRef.current) {
          clearInterval(cooldownIntervalRef.current);
          cooldownIntervalRef.current = null;
        }
        return;
      }
      cooldownIntervalRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownIntervalRef.current!);
            cooldownIntervalRef.current = null;
            setTimeout(() => {
              otpRef.current?.focus();
            }, 100);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return (): void => {
        if (cooldownIntervalRef.current)
          clearInterval(cooldownIntervalRef.current);
      };
    }, [cooldown]);

    const handleFilled = useCallback(
      async (value: string): Promise<void> => {
        if (cooldown > 0) return;
        setAttemptsRemaining(null);

        try {
          const result = await verifyPin(value);
          if (result.success) {
            dismiss(true);
          } else {
            setInputKey((k) => k + 1);
            if (result.attemptsRemaining !== undefined) {
              setAttemptsRemaining(result.attemptsRemaining);
            }
          }
        } catch (err: unknown) {
          setInputKey((k) => k + 1);
          if (err !== null && typeof err === 'object') {
            const apiErr = err as {
              status?: number;
              retryAfter?: number;
              message?: string;
            };
            if (apiErr.status === 429) {
              let retryAfter = apiErr.retryAfter;
              if (!retryAfter && apiErr.message) {
                const match = apiErr.message.match(/(\d+)\s*seconds?/i);
                if (match) retryAfter = parseInt(match[1], 10);
              }
              setCooldown(retryAfter ?? 30);
              return;
            }
          }
        }
      },
      [cooldown, dismiss, verifyPin]
    );

    const isLocked = cooldown > 0;

    return (
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={() => dismiss(false)}
      >
        <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            className="bg-black"
            onPress={() => dismiss(false)}
          />
        </Animated.View>

        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: SHEET_HEIGHT,
              paddingBottom: insets.bottom,
            },
            sheetStyle,
          ]}
          className="rounded-t-3xl bg-white pt-5"
        >
          <View className="mb-4 items-center">
            <View className="h-1 w-10 rounded-full bg-gray-300" />
          </View>

          <Text className="mb-6 text-center text-xl font-bold text-gray-900">
            {t('pin.verify_title')}
          </Text>

          <View className="px-8">
            <OtpInput
              ref={otpRef}
              key={inputKey}
              numberOfDigits={6}
              focusColor={COLORS.primary}
              autoFocus
              hideStick
              blurOnFilled
              secureTextEntry
              type="numeric"
              disabled={isLocked}
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

          <View className="mt-4 min-h-[20px] items-center px-4">
            {isLocked ? (
              <Text className="text-center text-sm text-orange-500">
                {t('pin.locked_cooldown', { seconds: cooldown })}
              </Text>
            ) : attemptsRemaining !== null && attemptsRemaining > 0 ? (
              <Text className="text-center text-sm text-red-500">
                {t('pin.wrong_pin_remaining', { count: attemptsRemaining })}
              </Text>
            ) : null}
          </View>
        </Animated.View>
      </Modal>
    );
  }
);
