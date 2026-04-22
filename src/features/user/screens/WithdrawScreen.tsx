import { AnimatedBackdrop } from '@components/AnimatedBackdrop';
import { CustomButton } from '@components/CustomButton';
import { CustomInput } from '@components/CustomInput';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import { selectUser } from '@slices/auth';
import { useWithdraw } from '@user/hooks/payment/useWithdraw';
import { BANK_OPTIONS } from '@user/types/payment';
import {
  getWithdrawSchema,
  type WithdrawFormValues,
} from '@user/utils/withdrawFormSchema';
import { JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import {
  default as Animated,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export const WithdrawScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const user = useAppSelector(selectUser);
  const { requestWithdraw, isLoading } = useWithdraw();
  const [bankPickerVisible, setBankPickerVisible] = useState(false);
  const [bankBackdropVisible, setBankBackdropVisible] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const insets = useSafeAreaInsets();
  const backdropProgress = useSharedValue(0);
  const sheetTranslateY = useSharedValue(0);
  const sheetContext = useSharedValue(0);
  const closeBackdropTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  const openBankPicker = useCallback(() => {
    if (closeBackdropTimeoutRef.current) {
      clearTimeout(closeBackdropTimeoutRef.current);
      closeBackdropTimeoutRef.current = null;
    }
    sheetTranslateY.value = 0;
    setBankBackdropVisible(true);
    setBankPickerVisible(true);
    backdropProgress.value = withTiming(1, { duration: 220 });
  }, [backdropProgress, sheetTranslateY]);

  const closeBankPicker = useCallback(() => {
    setBankPickerVisible(false);
    setBankSearch('');
    backdropProgress.value = withTiming(0, { duration: 220 });

    if (closeBackdropTimeoutRef.current) {
      clearTimeout(closeBackdropTimeoutRef.current);
    }

    closeBackdropTimeoutRef.current = setTimeout(() => {
      setBankBackdropVisible(false);
      closeBackdropTimeoutRef.current = null;
    }, 220);
  }, [backdropProgress]);

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onStart(() => {
      sheetContext.value = sheetTranslateY.value;
    })
    .onUpdate((e) => {
      const next = sheetContext.value + e.translationY;
      sheetTranslateY.value = Math.max(0, next);
    })
    .onEnd((e) => {
      const shouldDismiss = sheetTranslateY.value > 120 || e.velocityY > 500;
      if (shouldDismiss) {
        closeBankPicker();
      } else {
        sheetTranslateY.value = withSpring(0, {
          damping: 20,
          stiffness: 200,
          mass: 0.8,
        });
      }
    });

  const bankOptions = useMemo(
    () =>
      Object.entries(BANK_OPTIONS)
        .map(([bankCode, bank]) => ({ bankCode, ...bank }))
        .filter((bank) => bank.isDisburse),
    []
  );

  const formatBankTitle = useCallback(
    (shortName: string, bankCode: string): string =>
      `${shortName} (${bankCode})`,
    []
  );

  const filteredBanks = useMemo(
    () =>
      bankOptions.filter((b) => {
        const keyword = bankSearch.toLowerCase().trim();
        if (!keyword) return true;
        return (
          b.shortName.toLowerCase().includes(keyword) ||
          b.bankCode.toLowerCase().includes(keyword) ||
          b.name.toLowerCase().includes(keyword)
        );
      }),
    [bankOptions, bankSearch]
  );

  const schema = useMemo(
    () => getWithdrawSchema(t, user?.moneyBalance ?? 0),
    [t, user?.moneyBalance]
  );
  const methods = useForm<WithdrawFormValues>({
    defaultValues: {
      toBin: '',
      toAccountNumber: '',
      amount: '',
      description: 'Rut tien LOWCA',
    },
    resolver: zodResolver(schema),
  });

  const { handleSubmit, setValue, watch } = methods;
  const selectedBin = watch('toBin');
  const selectedBank = bankOptions.find((b) => b.bin === selectedBin);

  const onSubmit = async (data: WithdrawFormValues): Promise<void> => {
    await requestWithdraw(
      {
        toBin: data.toBin,
        toAccountNumber: data.toAccountNumber,
        amount: Number(data.amount),
        description: data.description,
      },
      () => navigation.goBack()
    );
  };

  useEffect((): (() => void) => {
    return (): void => {
      if (closeBackdropTimeoutRef.current) {
        clearTimeout(closeBackdropTimeoutRef.current);
      }
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-3">
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </Pressable>
          <Text className="ml-3 text-xl font-bold text-gray-900">
            {t('withdraw.title')}
          </Text>
        </View>

        <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
          {/* Balance info */}
          <View className="mb-6 rounded-2xl bg-primary/10 p-4">
            <Text className="text-base text-gray-500">
              {t('withdraw.available_balance')}
            </Text>
            <Text className="mt-1 text-2xl font-bold text-primary-dark">
              {(user?.moneyBalance ?? 0).toLocaleString('vi-VN')} đ
            </Text>
          </View>

          <FormProvider {...methods}>
            <View className="gap-6">
              {/* Bank Picker */}
              <View className="flex flex-col gap-1">
                <Text className="text-lg font-semibold text-[#616161]">
                  {t('withdraw.bank')}
                  <Text className="text-[#FE4763]"> *</Text>
                </Text>
                <Pressable
                  onPress={openBankPicker}
                  className="flex-row items-center border-b-2 border-b-[#E5E5E5] pb-2"
                >
                  {selectedBank ? (
                    <Image
                      source={{ uri: selectedBank.bankLogoUrl }}
                      style={{ width: 20, height: 20 }}
                      resizeMode="contain"
                    />
                  ) : (
                    <Ionicons
                      name="business-outline"
                      size={20}
                      color="#999999"
                    />
                  )}
                  <Text
                    className={`ml-3 flex-1 py-3 text-base ${
                      selectedBank ? 'text-[#333333]' : 'text-[#BDBDBD]'
                    }`}
                  >
                    {selectedBank
                      ? formatBankTitle(
                          selectedBank.shortName,
                          selectedBank.bankCode
                        )
                      : t('withdraw.select_bank')}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#999999" />
                </Pressable>
                {methods.formState.errors.toBin && (
                  <Text className="mt-1 text-base text-[#FE4763]">
                    {methods.formState.errors.toBin.message}
                  </Text>
                )}
              </View>

              <CustomInput<WithdrawFormValues>
                name="toAccountNumber"
                label={t('withdraw.account_number')}
                placeholder={t('withdraw.account_number_placeholder')}
                keyboardType="number-pad"
                required
              />

              <Controller
                name="amount"
                control={methods.control}
                render={({ field, fieldState }) => {
                  const displayValue = field.value
                    ? Number(field.value).toLocaleString('vi-VN')
                    : '';
                  return (
                    <View className="flex w-full flex-col gap-1">
                      <Text className="text-lg font-semibold text-[#616161]">
                        {t('withdraw.amount')}
                        <Text className="text-[#FE4763]"> *</Text>
                      </Text>
                      <View
                        className={
                          'flex-row items-center gap-3 border-b-2 pb-2 ' +
                          (fieldState.error
                            ? 'border-b-[#FE4763]'
                            : 'border-b-[#E5E5E5]')
                        }
                      >
                        <TextInput
                          ref={field.ref}
                          value={displayValue}
                          onChangeText={(text) => {
                            const raw = text.replace(/\D/g, '');
                            field.onChange(raw);
                          }}
                          onBlur={field.onBlur}
                          placeholder={t('withdraw.amount_placeholder')}
                          placeholderTextColor="#BDBDBD"
                          keyboardType="number-pad"
                          textAlignVertical="center"
                          className="flex-1 justify-center py-3 text-[#333333]"
                        />
                      </View>
                      {fieldState.error && (
                        <Text className="mt-1 text-base text-[#FE4763]">
                          {fieldState.error.message}
                        </Text>
                      )}
                    </View>
                  );
                }}
              />

              <CustomInput<WithdrawFormValues>
                name="description"
                label={t('withdraw.description')}
                placeholder={t('withdraw.description_placeholder')}
                required
              />
            </View>

            <View className="mt-2 flex-row items-start gap-2 rounded-xl bg-amber-50 px-3 py-3">
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#B45309"
                style={{ marginTop: 1 }}
              />
              <Text className="flex-1 text-sm leading-5 text-amber-700">
                {t('withdraw.account_privacy_notice')}
              </Text>
            </View>

            <View className="py-8">
              <CustomButton
                text={t('withdraw.submit')}
                loadingText={t('withdraw.submitting')}
                isLoading={isLoading}
                onPress={handleSubmit(onSubmit)}
              />
            </View>
          </FormProvider>
        </ScrollView>

        <AnimatedBackdrop
          mounted={bankBackdropVisible}
          visible={bankPickerVisible}
          onPress={closeBankPicker}
          progress={backdropProgress}
          dimOpacity={0.45}
          containerStyle={{
            top: -insets.top,
            bottom: -insets.bottom,
          }}
        />

        <Modal
          visible={bankPickerVisible}
          transparent
          animationType="slide"
          onRequestClose={closeBankPicker}
        >
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={closeBankPicker}
            />

            {/* Sheet */}
            <Animated.View
              style={[
                { paddingBottom: insets.bottom, height: SCREEN_HEIGHT * 0.75 },
                sheetAnimatedStyle,
              ]}
              className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white pt-4"
            >
              {/* Drag handle */}
              <GestureDetector gesture={panGesture}>
                <View className="mb-3 items-center py-2">
                  <View className="h-1 w-10 rounded-full bg-gray-300" />
                </View>
              </GestureDetector>

              <Text className="mb-3 px-4 text-lg font-bold text-gray-900">
                {t('withdraw.select_bank')}
              </Text>

              {/* Search */}
              <View className="mx-4 mb-3 flex-row items-center gap-2 rounded-xl bg-gray-100 px-3 py-2">
                <Ionicons name="search-outline" size={18} color="#999999" />
                <TextInput
                  value={bankSearch}
                  onChangeText={setBankSearch}
                  placeholder={t('withdraw.search_bank')}
                  placeholderTextColor="#BDBDBD"
                  className="flex-1 text-base text-[#333333]"
                  autoCorrect={false}
                />
                {bankSearch.length > 0 && (
                  <Pressable onPress={() => setBankSearch('')} hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color="#999999" />
                  </Pressable>
                )}
              </View>

              <ScrollView keyboardShouldPersistTaps="handled">
                {filteredBanks.length === 0 ? (
                  <Text className="py-8 text-center text-gray-400">
                    {t('withdraw.no_bank_found')}
                  </Text>
                ) : (
                  filteredBanks.map((bank) => (
                    <TouchableOpacity
                      key={`${bank.bankCode}-${bank.bin}`}
                      className={`mx-6 flex-row items-center justify-between border-b py-4 border-gray-200${
                        selectedBin === bank.bin ? 'bg-primary/10' : ''
                      }`}
                      onPress={() => {
                        setValue('toBin', bank.bin, { shouldValidate: true });
                        closeBankPicker();
                      }}
                    >
                      <View className="flex-1 flex-row items-start gap-3">
                        <Image
                          source={{ uri: bank.bankLogoUrl }}
                          className="mt-1 h-12 w-12 rounded-md"
                          resizeMode="contain"
                        />
                        <View className="flex-1">
                          <Text
                            className={`text-xl ${
                              selectedBin === bank.bin
                                ? 'font-bold text-primary-dark'
                                : 'font-semibold text-primary-dark'
                            }`}
                          >
                            {formatBankTitle(bank.shortName, bank.bankCode)}
                          </Text>
                          <Text className="mt-1 text-base leading-8 text-[#6B7280]">
                            {bank.name}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </Animated.View>
          </GestureHandlerRootView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
