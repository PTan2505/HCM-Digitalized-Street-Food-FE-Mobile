import { CustomInput } from '@components/CustomInput';
import Header from '@components/Header';
import {
  useUpdateVendorCampaign,
  useVendorCampaignDetail,
} from '@manager/campaigns/hooks/useVendorCampaigns';
import {
  getCampaignSchema,
  type CampaignFormValues,
} from '@manager/campaigns/utils/campaignSchema';
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
  campaignId: number;
}

export const VendorEditCampaignScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { campaignId } = route.params as RouteParams;

  const { data: campaign, isLoading } = useVendorCampaignDetail(campaignId);
  const updateCampaign = useUpdateVendorCampaign(campaignId);
  const schema = useMemo(() => getCampaignSchema(t), [t]);

  const methods = useForm<CampaignFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', startDate: '', endDate: '' },
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
        startDate: campaign.startDate.split('T')[0],
        endDate: campaign.endDate.split('T')[0],
      });
    }
  }, [campaign, reset]);

  const onSubmit = (values: CampaignFormValues): void => {
    updateCampaign.mutate(
      {
        name: values.name,
        description: values.description ?? null,
        startDate: values.startDate,
        endDate: values.endDate,
      },
      {
        onSuccess: () => {
          Alert.alert(t('manager_campaigns.update_success'));
          navigation.goBack();
        },
        onError: () => {
          Alert.alert(t('manager_campaigns.update_error'));
        },
      }
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

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      <Header
        title={t('manager_campaigns.edit_title')}
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
            <CustomInput<CampaignFormValues>
              name="name"
              label={t('manager_campaigns.field_name')}
              required
            />
            <CustomInput<CampaignFormValues>
              name="description"
              label={t('manager_campaigns.field_description')}
            />
            <CustomInput<CampaignFormValues>
              name="startDate"
              label={t('manager_campaigns.field_start_date')}
              placeholder="YYYY-MM-DD"
              required
            />
            <CustomInput<CampaignFormValues>
              name="endDate"
              label={t('manager_campaigns.field_end_date')}
              placeholder="YYYY-MM-DD"
              required
            />
            <View className="mt-6">
              <TouchableOpacity
                className="items-center rounded-full bg-primary py-3"
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting || updateCampaign.isPending}
              >
                <Text className="text-base font-bold text-white">
                  {updateCampaign.isPending
                    ? t('common.saving')
                    : t('manager_branch.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </FormProvider>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
