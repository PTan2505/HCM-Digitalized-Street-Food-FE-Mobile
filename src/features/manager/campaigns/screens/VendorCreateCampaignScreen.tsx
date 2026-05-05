import Header from '@components/Header';
import { CampaignForm } from '@manager/campaigns/components/CampaignForm';
import type { CampaignImageValue } from '@manager/campaigns/components/CampaignImageUpload';
import { useCreateVendorCampaign } from '@manager/campaigns/hooks/useVendorCampaigns';
import {
  getCampaignSchema,
  type CampaignFormValues,
  type VoucherDraftValues,
} from '@manager/campaigns/utils/campaignSchema';
import { useCreateVouchers } from '@manager/vouchers/hooks/useVendorVouchers';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import React, { useMemo, useState, type JSX } from 'react';
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

export const VendorCreateCampaignScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const createCampaign = useCreateVendorCampaign();
  const createVouchers = useCreateVouchers();
  const queryClient = useQueryClient();
  const schema = useMemo(
    () => getCampaignSchema(t, { requireVouchers: true }),
    [t]
  );
  const [image, setImage] = useState<CampaignImageValue | null>(null);

  const methods = useForm<CampaignFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      targetSegment: '',
      startDate: '',
      endDate: '',
      branchIds: [],
      vouchers: [],
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const submitVouchers = async (
    campaignId: number,
    drafts: VoucherDraftValues[],
    startDate: string,
    endDate: string
  ): Promise<void> => {
    if (drafts.length === 0) return;
    await createVouchers.mutateAsync(
      drafts.map((draft) => ({
        name: draft.name,
        voucherCode: draft.voucherCode,
        description: draft.description?.trim() ? draft.description : null,
        type: draft.type,
        discountValue: draft.discountValue,
        maxDiscountValue:
          draft.type === 'PERCENT' ? draft.maxDiscountValue : null,
        minAmountRequired: draft.minAmountRequired,
        quantity: draft.quantity,
        redeemPoint: draft.redeemPoint,
        startDate,
        endDate,
        isActive: true,
        campaignId,
      }))
    );
  };

  const onSubmit = (values: CampaignFormValues): void => {
    createCampaign.mutate(
      {
        name: values.name,
        description: values.description ?? null,
        targetSegment: values.targetSegment?.trim()
          ? values.targetSegment
          : null,
        startDate: values.startDate,
        endDate: values.endDate,
        branchIds:
          values.branchIds && values.branchIds.length > 0
            ? values.branchIds
            : null,
      },
      {
        onSuccess: async (created) => {
          if (image) {
            try {
              await axiosApi.managerCampaignApi.uploadCampaignImage(
                created.campaignId,
                image
              );
              void queryClient.invalidateQueries({
                queryKey: queryKeys.managerCampaigns.detail(created.campaignId),
              });
            } catch {
              Alert.alert(t('manager_campaigns.image_upload_error'));
            }
          }
          try {
            await submitVouchers(
              created.campaignId,
              values.vouchers ?? [],
              values.startDate,
              values.endDate
            );
          } catch {
            Alert.alert(t('manager_campaigns.create_voucher_error'));
            navigation.goBack();
            return;
          }
          Alert.alert(t('manager_campaigns.create_success'));
          navigation.goBack();
        },
        onError: () => {
          Alert.alert(t('manager_campaigns.create_error'));
        },
      }
    );
  };

  const isPending =
    isSubmitting || createCampaign.isPending || createVouchers.isPending;

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      <Header
        title={t('manager_campaigns.create_title')}
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
            <CampaignForm
              image={image}
              onImageChange={setImage}
              showVoucherSection
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
                  {isPending
                    ? t('common.saving')
                    : t('manager_campaigns.create_submit')}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </FormProvider>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
