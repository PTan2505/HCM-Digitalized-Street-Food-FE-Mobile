import Header from '@components/Header';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { CampaignForm } from '@manager/campaigns/components/CampaignForm';
import type { CampaignImageValue } from '@manager/campaigns/components/CampaignImageUpload';
import {
  useDeleteCampaignImage,
  useDeleteVendorCampaign,
  useUpdateVendorCampaign,
  useUploadCampaignImage,
  useVendorCampaignDetail,
} from '@manager/campaigns/hooks/useVendorCampaigns';
import {
  getCampaignSchema,
  type CampaignFormValues,
} from '@manager/campaigns/utils/campaignSchema';
import { useVouchersByCampaign } from '@manager/vouchers/hooks/useVendorVouchers';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useMemo, useState, type JSX } from 'react';
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
  campaignId: number;
}

export const VendorEditCampaignScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { campaignId } = route.params as RouteParams;

  const queryClient = useQueryClient();
  const { data: campaign, isLoading } = useVendorCampaignDetail(campaignId);
  const { data: vouchers = [] } = useVouchersByCampaign(campaignId);
  const updateCampaign = useUpdateVendorCampaign(campaignId);
  const uploadImage = useUploadCampaignImage(campaignId);
  const deleteImage = useDeleteCampaignImage(campaignId);
  const deleteCampaign = useDeleteVendorCampaign();
  const schema = useMemo(() => getCampaignSchema(t), [t]);
  const hasVouchers = vouchers.length > 0;

  const [image, setImage] = useState<CampaignImageValue | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [isSyncingVouchers, setIsSyncingVouchers] = useState(false);

  const methods = useForm<CampaignFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      targetSegment: '',
      startDate: '',
      endDate: '',
      branchIds: [],
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (campaign) {
      reset({
        name: campaign.name,
        description: campaign.description ?? '',
        targetSegment: campaign.targetSegment ?? '',
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        branchIds: campaign.branchIds ?? [],
      });
      setImage(null);
      setImageRemoved(false);
    }
  }, [campaign, reset]);

  const handleImageChange = (next: CampaignImageValue | null): void => {
    if (next === null) {
      setImageRemoved(true);
    } else {
      setImageRemoved(false);
    }
    setImage(next);
  };

  const syncVoucherDates = async (
    nextStart: string,
    nextEnd: string
  ): Promise<void> => {
    if (vouchers.length === 0) return;
    const datesUnchanged =
      campaign?.startDate === nextStart && campaign?.endDate === nextEnd;
    if (datesUnchanged) return;

    setIsSyncingVouchers(true);
    try {
      await Promise.all(
        vouchers.map((voucher) =>
          axiosApi.managerVoucherApi.update(voucher.voucherId, {
            name: voucher.name,
            voucherCode: voucher.voucherCode,
            description: voucher.description,
            type: voucher.type,
            discountValue: voucher.discountValue,
            maxDiscountValue: voucher.maxDiscountValue,
            minAmountRequired: voucher.minAmountRequired,
            quantity: voucher.quantity,
            redeemPoint: voucher.redeemPoint,
            isActive: voucher.isActive,
            campaignId: voucher.campaignId,
            startDate: nextStart,
            endDate: nextEnd,
          })
        )
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerVouchers.byCampaign(campaignId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.vouchers.campaignVoucher(campaignId),
      });
    } finally {
      setIsSyncingVouchers(false);
    }
  };

  const onSubmit = (values: CampaignFormValues): void => {
    if (!hasVouchers) {
      Alert.alert(t('manager_campaigns.requires_voucher_edit'));
      return;
    }
    updateCampaign.mutate(
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
        onSuccess: async () => {
          if (image && !image.isExisting) {
            try {
              await uploadImage.mutateAsync(image);
            } catch {
              Alert.alert(t('manager_campaigns.image_upload_error'));
            }
          } else if (imageRemoved && campaign?.imageUrl) {
            try {
              await deleteImage.mutateAsync();
            } catch {
              Alert.alert(t('manager_campaigns.image_delete_error'));
            }
          }
          try {
            await syncVoucherDates(values.startDate, values.endDate);
          } catch {
            Alert.alert(t('manager_campaigns.voucher_sync_error'));
            navigation.goBack();
            return;
          }
          Alert.alert(t('manager_campaigns.update_success'));
          navigation.goBack();
        },
        onError: () => {
          Alert.alert(t('manager_campaigns.update_error'));
        },
      }
    );
  };

  const onDelete = (): void => {
    Alert.alert(
      t('manager_campaigns.delete_title'),
      t('manager_campaigns.delete_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.remove'),
          style: 'destructive',
          onPress: (): void => {
            deleteCampaign.mutate(campaignId, {
              onSuccess: () => {
                Alert.alert(t('manager_campaigns.delete_success'));
                navigation.goBack();
              },
              onError: () => {
                Alert.alert(t('manager_campaigns.delete_error'));
              },
            });
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
        <Header
          title={t('manager_campaigns.edit_title')}
          onBackPress={() => navigation.goBack()}
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9FD356" />
        </View>
      </SafeAreaView>
    );
  }

  const isPending =
    (isSubmitting || updateCampaign.isPending || uploadImage.isPending) ??
    deleteImage.isPending ??
    deleteCampaign.isPending ??
    isSyncingVouchers;

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      <Header
        title={t('manager_campaigns.edit_title')}
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
            <CampaignForm
              image={image}
              onImageChange={handleImageChange}
              initialImageUrl={
                imageRemoved ? null : (campaign?.imageUrl ?? null)
              }
            />
            {!hasVouchers ? (
              <View className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <Text className="text-sm font-semibold text-amber-800">
                  {t('manager_campaigns.requires_voucher_edit')}
                </Text>
              </View>
            ) : null}
            <View className="mt-6">
              <TouchableOpacity
                className={`items-center rounded-full py-3 ${
                  isPending || !hasVouchers ? 'bg-gray-300' : 'bg-primary'
                }`}
                onPress={handleSubmit(onSubmit)}
                disabled={isPending ?? !hasVouchers}
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
