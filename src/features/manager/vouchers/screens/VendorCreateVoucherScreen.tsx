import Header from '@components/Header';
import { useVendorCampaignDetail } from '@manager/campaigns/hooks/useVendorCampaigns';
import { VoucherForm } from '@manager/vouchers/components/VoucherForm';
import { useCreateVouchers } from '@manager/vouchers/hooks/useVendorVouchers';
import {
  getVoucherSchema,
  type VoucherFormValues,
} from '@manager/vouchers/utils/voucherSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, type JSX } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RouteParams {
  campaignId?: number | string;
}

const buildDefaults = (
  startDate = '',
  endDate = ''
): VoucherFormValues => ({
  name: '',
  voucherCode: '',
  description: '',
  type: 'AMOUNT',
  discountValue: 0,
  maxDiscountValue: null,
  minAmountRequired: 0,
  quantity: 0,
  redeemPoint: 0,
  startDate,
  endDate,
  isActive: true,
});

export const VendorCreateVoucherScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const rawParams = (route.params ?? {}) as RouteParams;
  const campaignId =
    rawParams.campaignId !== undefined && rawParams.campaignId !== null
      ? Number(rawParams.campaignId)
      : undefined;

  const { data: campaign } = useVendorCampaignDetail(campaignId ?? 0);

  const createVouchers = useCreateVouchers();
  const schema = useMemo(() => getVoucherSchema(t), [t]);

  const methods = useForm<VoucherFormValues>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaults(),
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const hasPrefilled = useRef(false);

  // When entering from a campaign, lock the voucher's validity window to the
  // campaign window — matches web behavior in VoucherFormModal (campaign mode).
  useEffect(() => {
    if (campaign && !hasPrefilled.current) {
      reset(buildDefaults(campaign.startDate, campaign.endDate));
      hasPrefilled.current = true;
    }
  }, [campaign, reset]);

  const submit = (
    values: VoucherFormValues,
    onDone: () => void
  ): void => {
    createVouchers.mutate(
      [
        {
          ...values,
          description: values.description ?? null,
          isActive: true,
          campaignId: campaignId ?? null,
        },
      ],
      {
        onSuccess: onDone,
        onError: () => {
          Alert.alert(t('manager_vouchers.create_error'));
        },
      }
    );
  };

  const onSaveAndClose = handleSubmit((values) => {
    submit(values, () => {
      Alert.alert(t('manager_vouchers.create_success'));
      navigation.goBack();
    });
  });

  const onSaveAndAddAnother = handleSubmit((values) => {
    submit(values, () => {
      Alert.alert(t('manager_vouchers.create_success'));
      reset(
        buildDefaults(
          campaign?.startDate ?? '',
          campaign?.endDate ?? ''
        )
      );
    });
  });

  const isPending = isSubmitting || createVouchers.isPending;

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      <Header
        title={t('manager_vouchers.create_title')}
        onBackPress={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FormProvider {...methods}>
          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {campaign ? (
              <View className="mb-3 rounded-xl bg-primary/10 p-3">
                <Text className="text-xs font-semibold uppercase text-primary">
                  {t('manager_vouchers.linked_campaign')}
                </Text>
                <Text className="text-sm font-bold text-gray-800">
                  {campaign.name}
                </Text>
                <Text className="mt-1 text-xs text-gray-500">
                  {t('manager_vouchers.campaign_window_hint')}
                </Text>
              </View>
            ) : null}

            <VoucherForm
              showActiveToggle={false}
              campaignWindow={
                campaign
                  ? {
                      startDate: campaign.startDate,
                      endDate: campaign.endDate,
                    }
                  : null
              }
            />
            <View className="mt-6 gap-3">
              <TouchableOpacity
                className={`items-center rounded-full py-3 ${
                  isPending ? 'bg-gray-300' : 'bg-primary'
                }`}
                onPress={onSaveAndClose}
                disabled={isPending}
              >
                <Text className="text-base font-bold text-white">
                  {isPending
                    ? t('common.saving')
                    : t('manager_vouchers.save_and_close')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`items-center rounded-full border-2 py-3 ${
                  isPending
                    ? 'border-gray-200'
                    : 'border-primary bg-white'
                }`}
                onPress={onSaveAndAddAnother}
                disabled={isPending}
              >
                <Text
                  className={`text-base font-bold ${
                    isPending ? 'text-gray-400' : 'text-primary'
                  }`}
                >
                  {t('manager_vouchers.save_and_add_another')}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </FormProvider>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
