import { Ionicons } from '@expo/vector-icons';
import Header from '@components/Header';
import { useVendorCampaignDetail } from '@manager/campaigns/hooks/useVendorCampaigns';
import { VoucherForm } from '@manager/vouchers/components/VoucherForm';
import {
  useDeleteVoucher,
  useUpdateVoucher,
  useVoucherDetail,
} from '@manager/vouchers/hooks/useVendorVouchers';
import {
  getVoucherSchema,
  type VoucherFormValues,
} from '@manager/vouchers/utils/voucherSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, type JSX } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
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
  voucherId: number;
}

export const VendorEditVoucherScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { voucherId } = route.params as RouteParams;

  const { data: voucher, isLoading } = useVoucherDetail(voucherId);
  const updateVoucher = useUpdateVoucher(voucherId);
  const deleteVoucher = useDeleteVoucher();
  const { data: parentCampaign } = useVendorCampaignDetail(
    voucher?.campaignId ?? 0
  );
  const schema = useMemo(() => getVoucherSchema(t), [t]);

  const methods = useForm<VoucherFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      voucherCode: '',
      description: '',
      type: 'AMOUNT',
      discountValue: 0,
      maxDiscountValue: null,
      minAmountRequired: 0,
      quantity: 0,
      redeemPoint: 0,
      startDate: '',
      endDate: '',
      isActive: true,
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (voucher) {
      reset({
        name: voucher.name,
        voucherCode: voucher.voucherCode,
        description: voucher.description ?? '',
        type: voucher.type,
        discountValue: voucher.discountValue,
        maxDiscountValue: voucher.maxDiscountValue,
        minAmountRequired: voucher.minAmountRequired,
        quantity: voucher.quantity,
        redeemPoint: voucher.redeemPoint,
        startDate: voucher.startDate,
        endDate: voucher.endDate,
        isActive: voucher.isActive,
      });
    }
  }, [voucher, reset]);

  const onSubmit = (values: VoucherFormValues): void => {
    updateVoucher.mutate(
      {
        ...values,
        description: values.description ?? null,
        campaignId: voucher?.campaignId ?? null,
      },
      {
        onSuccess: () => {
          Alert.alert(t('manager_vouchers.update_success'));
          navigation.goBack();
        },
        onError: () => {
          Alert.alert(t('manager_vouchers.update_error'));
        },
      }
    );
  };

  const onDelete = (): void => {
    Alert.alert(
      t('manager_vouchers.delete_title'),
      t('manager_vouchers.delete_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.remove'),
          style: 'destructive',
          onPress: (): void => {
            deleteVoucher.mutate(
              {
                voucherId,
                campaignId: voucher?.campaignId ?? null,
              },
              {
                onSuccess: () => {
                  Alert.alert(t('manager_vouchers.delete_success'));
                  navigation.goBack();
                },
                onError: () => {
                  Alert.alert(t('manager_vouchers.delete_error'));
                },
              }
            );
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
        <Header
          title={t('manager_vouchers.edit_title')}
          onBackPress={() => navigation.goBack()}
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9FD356" />
        </View>
      </SafeAreaView>
    );
  }

  const isPending =
    isSubmitting || updateVoucher.isPending || deleteVoucher.isPending;

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      <Header
        title={t('manager_vouchers.edit_title')}
        onBackPress={() => navigation.goBack()}
        secondaryAction={{
          icon: <Ionicons name="trash-outline" size={20} color="#EF4444" />,
          onPress: onDelete,
        }}
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
            <VoucherForm
              campaignWindow={
                parentCampaign
                  ? {
                      startDate: parentCampaign.startDate,
                      endDate: parentCampaign.endDate,
                    }
                  : null
              }
            />
            <View className="mt-6">
              <TouchableOpacity
                className={`items-center rounded-full py-3 ${
                  isPending ? 'bg-gray-300' : 'bg-primary'
                }`}
                onPress={handleSubmit(onSubmit)}
                disabled={isPending}
              >
                <Text className="text-base font-bold text-white">
                  {isPending ? t('common.saving') : t('manager_branch.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </FormProvider>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
