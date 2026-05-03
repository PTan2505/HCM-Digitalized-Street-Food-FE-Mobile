import { CustomInput } from '@components/CustomInput';
import Header from '@components/Header';
import {
  getEditBranchSchema,
  type EditBranchFormValues,
} from '@manager/branch/utils/editBranchSchema';
import {
  useUpdateVendorBranch,
  useVendorBranchDetail,
} from '@manager/vendor-branches/hooks/useVendorBranches';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, type JSX } from 'react';
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
  branchId: number;
}

export const VendorEditBranchScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { branchId } = route.params as RouteParams;

  const { data: branch } = useVendorBranchDetail(branchId);
  const updateBranch = useUpdateVendorBranch(branchId);

  const schema = useMemo(() => getEditBranchSchema(t), [t]);

  const methods = useForm<EditBranchFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      email: '',
      addressDetail: '',
      ward: '',
      city: '',
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (branch) {
      reset({
        name: branch.name,
        phoneNumber: branch.phoneNumber,
        email: branch.email,
        addressDetail: branch.addressDetail,
        ward: branch.ward,
        city: branch.city,
      });
    }
  }, [branch, reset]);

  const onSubmit = (values: EditBranchFormValues): void => {
    updateBranch.mutate(values, {
      onSuccess: () => {
        Alert.alert(t('manager_branch.success_update'));
        navigation.goBack();
      },
      onError: () => {
        Alert.alert(t('manager_branch.error_update'));
      },
    });
  };

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      <Header
        title={t('manager_branch.edit_title')}
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
            <CustomInput<EditBranchFormValues>
              name="name"
              label={t('manager_branch.name')}
              required
            />
            <CustomInput<EditBranchFormValues>
              name="phoneNumber"
              label={t('manager_branch.phone')}
              type="phone"
              keyboardType="phone-pad"
              required
            />
            <CustomInput<EditBranchFormValues>
              name="email"
              label={t('manager_branch.email')}
              type="email"
              keyboardType="email-address"
              required
            />
            <CustomInput<EditBranchFormValues>
              name="addressDetail"
              label={t('manager_branch.address_detail')}
              required
            />
            <CustomInput<EditBranchFormValues>
              name="ward"
              label={t('manager_branch.ward')}
              required
            />
            <CustomInput<EditBranchFormValues>
              name="city"
              label={t('manager_branch.city')}
              required
            />

            <View className="mt-6">
              <TouchableOpacity
                className="items-center rounded-full bg-primary py-3"
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting || updateBranch.isPending}
              >
                <Text className="text-base font-bold text-white">
                  {updateBranch.isPending
                    ? t('manager_branch.saving')
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
