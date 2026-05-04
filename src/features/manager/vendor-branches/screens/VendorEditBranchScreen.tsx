import { CustomInput } from '@components/CustomInput';
import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { normalizeAddressDetail } from '@manager/branch/utils/branchAddress';
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
import { locationPickerBus } from '@features/shared/maps/utils/locationPickerBus';
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
  branchId: number;
}

export const VendorEditBranchScreen = (): JSX.Element => {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { branchId } = route.params as RouteParams;
  const sessionIdRef = useRef(`branch-edit-${branchId}-${Date.now()}`);

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
      lat: 0,
      long: 0,
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = methods;

  const lat = watch('lat');
  const long = watch('long');

  useEffect(() => {
    if (branch) {
      reset({
        name: branch.name,
        phoneNumber: branch.phoneNumber,
        email: branch.email,
        addressDetail: branch.addressDetail,
        ward: branch.ward,
        city: branch.city,
        lat: branch.lat ?? 0,
        long: branch.long ?? 0,
      });
    }
  }, [branch, reset]);

  useEffect(() => {
    const sessionId = sessionIdRef.current;
    return locationPickerBus.subscribe(sessionId, (location) => {
      setValue('lat', location.coordinate[1], {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue('long', location.coordinate[0], {
        shouldValidate: true,
        shouldDirty: true,
      });
      if (location.addressDetail) {
        setValue('addressDetail', location.addressDetail, {
          shouldValidate: true,
          shouldDirty: true,
        });
      } else if (location.address) {
        setValue('addressDetail', location.address, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
      if (location.ward) {
        setValue('ward', location.ward, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
      if (location.city) {
        setValue('city', location.city, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    });
  }, [setValue]);

  const handlePickLocation = (): void => {
    navigation.navigate('LocationPicker', {
      sessionId: sessionIdRef.current,
      initialCoordinate:
        lat && long ? ([long, lat] as [number, number]) : undefined,
    });
  };

  const onSubmit = (values: EditBranchFormValues): void => {
    const ward = values.ward?.trim() || 'Thành phố Hồ Chí Minh';
    const city = values.city?.trim() || 'Thành phố Hồ Chí Minh';
    updateBranch.mutate(
      {
        ...values,
        addressDetail: normalizeAddressDetail(values.addressDetail),
        ward,
        city,
        dietaryPreferenceIds: [],
      },
      {
        onSuccess: () => {
          Alert.alert(t('manager_branch.success_update'));
          navigation.goBack();
        },
        onError: (error) => {
          console.error('Vendor update branch failed:', error);
          Alert.alert(t('manager_branch.error_update'));
        },
      }
    );
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

            <View className="mt-5">
              <Text className="mb-2 text-sm font-semibold text-gray-700">
                {t('manager_branch.location_section')}{' '}
                <Text className="text-[#FE4763]">*</Text>
              </Text>
              <TouchableOpacity
                onPress={handlePickLocation}
                className="flex-row items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3"
              >
                <View className="flex-1 flex-row items-center gap-2">
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                  <Text
                    className="flex-1 text-sm text-gray-700"
                    numberOfLines={2}
                  >
                    {lat && long
                      ? t('manager_branch.location_picked', {
                          lat: lat.toFixed(6),
                          lng: long.toFixed(6),
                        })
                      : t('manager_branch.location_pick')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </TouchableOpacity>
              {(errors.lat?.message ?? errors.long?.message) && (
                <Text className="mt-1 text-sm text-[#FE4763]">
                  {errors.lat?.message ?? errors.long?.message}
                </Text>
              )}
            </View>

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
