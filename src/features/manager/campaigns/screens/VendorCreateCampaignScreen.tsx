import Header from '@components/Header';
import { CampaignForm } from '@manager/campaigns/components/CampaignForm';
import type { CampaignImageValue } from '@manager/campaigns/components/CampaignImageUpload';
import { useCreateVendorCampaign } from '@manager/campaigns/hooks/useVendorCampaigns';
import {
  getCampaignSchema,
  type CampaignFormValues,
} from '@manager/campaigns/utils/campaignSchema';
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
  const queryClient = useQueryClient();
  const schema = useMemo(() => getCampaignSchema(t), [t]);
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
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

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
          Alert.alert(t('manager_campaigns.create_success'));
          navigation.goBack();
        },
        onError: () => {
          Alert.alert(t('manager_campaigns.create_error'));
        },
      }
    );
  };

  const isPending = isSubmitting || createCampaign.isPending;

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
            <CampaignForm image={image} onImageChange={setImage} />
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
