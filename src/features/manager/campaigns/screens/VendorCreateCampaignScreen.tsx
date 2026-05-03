import { CustomInput } from '@components/CustomInput';
import Header from '@components/Header';
import { useCreateVendorCampaign } from '@manager/campaigns/hooks/useVendorCampaigns';
import {
  getCampaignSchema,
  type CampaignFormValues,
} from '@manager/campaigns/utils/campaignSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import React, { useMemo, type JSX } from 'react';
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
  const schema = useMemo(() => getCampaignSchema(t), [t]);

  const methods = useForm<CampaignFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
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
        startDate: values.startDate,
        endDate: values.endDate,
      },
      {
        onSuccess: () => {
          Alert.alert(t('manager_campaigns.create_success'));
          navigation.goBack();
        },
        onError: () => {
          Alert.alert(t('manager_campaigns.create_error'));
        },
      }
    );
  };

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
                disabled={isSubmitting || createCampaign.isPending}
              >
                <Text className="text-base font-bold text-white">
                  {createCampaign.isPending
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
