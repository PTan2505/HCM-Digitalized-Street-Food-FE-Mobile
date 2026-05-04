import { CustomInput } from '@components/CustomInput';
import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import {
  useCreateBranch,
  useRegisterVendor,
  useSubmitBranchImages,
  useSubmitBranchLicense,
} from '@manager/vendor-branches/hooks/useCreateBranchFlow';
import { useVendorInfo } from '@manager/vendor-branches/hooks/useVendorBranches';
import { useDietaryPreferenceQuery } from '@features/user/hooks/dietaryPreference/useDietaryPreferenceQuery';
import { normalizeAddressDetail } from '@manager/branch/utils/branchAddress';
import {
  getAddBranchSchema,
  getCreateVendorSchema,
  type AddBranchFormValues,
  type CreateVendorFormValues,
} from '@manager/branch/utils/createBranchSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import { selectUser } from '@slices/auth';
import { pickImagesFromLibrary, type PickedImage } from '@utils/imagePicker';
import { locationPickerBus } from '@features/shared/maps/utils/locationPickerBus';
import React, { useEffect, useMemo, useRef, useState, type JSX } from 'react';
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
import { useSelector } from 'react-redux';

type RouteParams = {
  mode: 'createVendor' | 'addBranch';
  vendorId?: number;
};

type FormValues = CreateVendorFormValues | AddBranchFormValues;

export const CreateBranchScreen = (): JSX.Element => {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? { mode: 'createVendor' }) as RouteParams;
  const isCreateVendor = params.mode === 'createVendor';
  const sessionIdRef = useRef(`branch-create-${Date.now()}`);

  const user = useSelector(selectUser);
  const { dietaryPreferences } = useDietaryPreferenceQuery();

  const registerVendor = useRegisterVendor();
  const createBranchMutation = useCreateBranch(params.vendorId ?? 0);
  const submitLicense = useSubmitBranchLicense();
  const submitImages = useSubmitBranchImages();
  const { refetch: refetchVendorInfo } = useVendorInfo();

  const schema = useMemo(
    () => (isCreateVendor ? getCreateVendorSchema(t) : getAddBranchSchema(t)),
    [isCreateVendor, t]
  );

  const defaultValues = useMemo<FormValues>(() => {
    const base = {
      phoneNumber: user?.phoneNumber ?? '',
      email: '',
      branchName: '',
      addressDetail: '',
      ward: '',
      city: '',
      lat: 0,
      long: 0,
    };
    if (isCreateVendor) {
      return {
        ...base,
        ownerName: '',
        dietaryPreferenceIds: [] as number[],
      } as CreateVendorFormValues;
    }
    return base as AddBranchFormValues;
  }, [isCreateVendor, user?.phoneNumber]);

  const methods = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isValid, errors },
  } = methods;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formValues = watch() as any;
  const lat: number = formValues.lat ?? 0;
  const lng: number = formValues.long ?? 0;
  const dietaryIds: number[] = formValues.dietaryPreferenceIds ?? [];

  const [licenseImages, setLicenseImages] = useState<PickedImage[]>([]);
  const [storeImages, setStoreImages] = useState<PickedImage[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const sessionId = sessionIdRef.current;
    return locationPickerBus.subscribe(sessionId, (location) => {
      setValue('lat' as never, location.coordinate[1] as never, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue('long' as never, location.coordinate[0] as never, {
        shouldValidate: true,
        shouldDirty: true,
      });
      if (location.addressDetail) {
        setValue('addressDetail' as never, location.addressDetail as never, {
          shouldValidate: true,
          shouldDirty: true,
        });
      } else if (location.address) {
        setValue('addressDetail' as never, location.address as never, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
      if (location.ward) {
        setValue('ward' as never, location.ward as never, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
      if (location.city) {
        setValue('city' as never, location.city as never, {
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
        lat && lng ? ([lng, lat] as [number, number]) : undefined,
    });
  };

  const handlePickLicense = async (): Promise<void> => {
    const result = await pickImagesFromLibrary({ maxImages: 5 });
    if (result.error === 'permission_denied') {
      Alert.alert(t('auth.error'), t('common.permission_denied'));
      return;
    }
    if (result.images.length > 0) {
      setLicenseImages(result.images);
    }
  };

  const handlePickStoreImages = async (): Promise<void> => {
    const result = await pickImagesFromLibrary({ maxImages: 8 });
    if (result.error === 'permission_denied') {
      Alert.alert(t('auth.error'), t('common.permission_denied'));
      return;
    }
    if (result.images.length > 0) {
      setStoreImages(result.images);
    }
  };

  const toggleDietary = (id: number): void => {
    if (!isCreateVendor) return;
    const next = dietaryIds.includes(id)
      ? dietaryIds.filter((x) => x !== id)
      : [...dietaryIds, id];
    setValue('dietaryPreferenceIds' as never, next as never, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = async (values: FormValues): Promise<void> => {
    if (storeImages.length === 0) {
      Alert.alert(t('auth.error'), t('manager_branch.images_required'));
      return;
    }

    setSubmitting(true);
    try {
      const ward = values.ward?.trim() || 'Thành phố Hồ Chí Minh';
      const city = values.city?.trim() || 'Thành phố Hồ Chí Minh';
      const cleanedAddress = normalizeAddressDetail(values.addressDetail);

      let branchId: number;

      if (isCreateVendor) {
        const v = values as CreateVendorFormValues;
        const res = await registerVendor.mutateAsync({
          name: v.ownerName,
          phoneNumber: v.phoneNumber,
          email: v.email,
          branchName: v.branchName,
          addressDetail: cleanedAddress,
          ward,
          city,
          lat: v.lat,
          long: v.long,
          dietaryPreferenceIds: v.dietaryPreferenceIds,
        });
        branchId = res.branches[0]?.branchId ?? 0;
      } else {
        const v = values as AddBranchFormValues;
        const res = await createBranchMutation.mutateAsync({
          name: v.branchName,
          phoneNumber: v.phoneNumber,
          email: v.email,
          addressDetail: cleanedAddress,
          ward,
          city,
          lat: v.lat,
          long: v.long,
          dietaryPreferenceIds: [],
        });
        branchId = res.branchId;
      }

      if (!branchId) {
        Alert.alert(t('auth.error'), t('manager_branch.error_submit'));
        return;
      }

      if (licenseImages.length > 0) {
        await submitLicense.mutateAsync({ branchId, licenseImages });
      }
      if (storeImages.length > 0) {
        await submitImages.mutateAsync({ branchId, images: storeImages });
      }

      void refetchVendorInfo();

      // Reset image arrays so a stale picker selection doesn't carry over
      // if the screen is opened again later.
      setLicenseImages([]);
      setStoreImages([]);

      Alert.alert(
        screenTitle,
        isCreateVendor
          ? t('manager_branch.success_create_vendor')
          : t('manager_branch.success_add_branch'),
        [
          {
            text: t('common.ok'),
            onPress: (): void => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Branch creation failed:', error);
      Alert.alert(t('auth.error'), t('manager_branch.error_submit'));
    } finally {
      setSubmitting(false);
    }
  };

  const submitLabel = isCreateVendor
    ? t('manager_branch.submit_create_vendor')
    : t('manager_branch.submit_add_branch');

  const screenTitle = isCreateVendor
    ? t('manager_branch.create_vendor_title')
    : t('manager_branch.add_branch_title');

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      <Header title={screenTitle} onBackPress={() => navigation.goBack()} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FormProvider {...methods}>
          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 16 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {isCreateVendor ? (
              <View>
                <Text className="mb-4 text-base font-semibold text-gray-700">
                  {t('manager_branch.owner_section')}
                </Text>
                <CustomInput<CreateVendorFormValues>
                  name="ownerName"
                  label={t('manager_branch.owner_name')}
                  placeholder={t('manager_branch.owner_name_placeholder')}
                  required
                />
                <View className="h-3" />
                <CustomInput<CreateVendorFormValues>
                  name="phoneNumber"
                  label={t('manager_branch.phone')}
                  type="phone"
                  keyboardType="phone-pad"
                  required
                />
                <View className="h-3" />
                <CustomInput<CreateVendorFormValues>
                  name="email"
                  label={t('manager_branch.email')}
                  type="email"
                  keyboardType="email-address"
                  required
                />
              </View>
            ) : (
              <View>
                <Text className="mb-4 text-base font-semibold text-gray-700">
                  {t('manager_branch.contact_section')}
                </Text>
                <CustomInput<AddBranchFormValues>
                  name="phoneNumber"
                  label={t('manager_branch.phone')}
                  type="phone"
                  keyboardType="phone-pad"
                  required
                />
                <View className="h-3" />
                <CustomInput<AddBranchFormValues>
                  name="email"
                  label={t('manager_branch.email')}
                  type="email"
                  keyboardType="email-address"
                  required
                />
              </View>
            )}

            {isCreateVendor && (
              <View>
                <Text className="mb-3 text-base font-semibold text-gray-700">
                  {t('manager_branch.dietary_section')}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {dietaryPreferences.map((d) => {
                    const isSelected = dietaryIds.includes(
                      d.dietaryPreferenceId
                    );
                    return (
                      <TouchableOpacity
                        key={d.dietaryPreferenceId}
                        onPress={() => toggleDietary(d.dietaryPreferenceId)}
                        className={`rounded-full border px-3 py-1.5 ${
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        <Text
                          className={`text-sm ${isSelected ? 'font-semibold text-primary' : 'text-gray-700'}`}
                        >
                          {d.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {(errors as Record<string, { message?: string }>)
                  .dietaryPreferenceIds?.message ? (
                  <Text className="mt-1 text-sm text-[#FE4763]">
                    {
                      (errors as Record<string, { message?: string }>)
                        .dietaryPreferenceIds?.message
                    }
                  </Text>
                ) : (
                  <Text className="mt-2 text-xs text-gray-500">
                    {t('manager_branch.dietary_hint')}
                  </Text>
                )}
              </View>
            )}

            <View>
              <Text className="mb-4 text-base font-semibold text-gray-700">
                {isCreateVendor
                  ? t('manager_branch.store_section_create')
                  : t('manager_branch.store_section_add')}
              </Text>
              <CustomInput<FormValues>
                name="branchName"
                label={t('manager_branch.name')}
                placeholder={t('manager_branch.branch_name_placeholder')}
                required
              />
              <View className="h-3" />
              <CustomInput<FormValues>
                name="addressDetail"
                label={t('manager_branch.address_detail')}
                placeholder={t('manager_branch.address_placeholder')}
                required
              />

              <View className="mt-4">
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
                      {lat && lng
                        ? t('manager_branch.location_picked', {
                            lat: lat.toFixed(6),
                            lng: lng.toFixed(6),
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
            </View>

            <View>
              <Text className="mb-3 text-base font-semibold text-gray-700">
                {isCreateVendor
                  ? t('manager_branch.images_section_create')
                  : t('manager_branch.images_section_add')}
              </Text>
              <TouchableOpacity
                onPress={handlePickStoreImages}
                className="flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-4"
              >
                <Ionicons
                  name="image-outline"
                  size={20}
                  color={COLORS.primary}
                />
                <Text className="text-sm font-semibold text-gray-700">
                  {storeImages.length > 0
                    ? t('manager_branch.images_count', {
                        count: storeImages.length,
                      })
                    : t('manager_branch.images_pick')}
                </Text>
              </TouchableOpacity>
            </View>

            <View>
              <Text className="mb-3 text-base font-semibold text-gray-700">
                {isCreateVendor
                  ? t('manager_branch.license_section_create')
                  : t('manager_branch.license_section_add')}
              </Text>
              <TouchableOpacity
                onPress={handlePickLicense}
                className="flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-4"
              >
                <Ionicons
                  name="document-attach-outline"
                  size={20}
                  color={COLORS.primary}
                />
                <Text className="text-sm font-semibold text-gray-700">
                  {licenseImages.length > 0
                    ? t('manager_branch.license_count', {
                        count: licenseImages.length,
                      })
                    : t('manager_branch.license_pick')}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className={`mt-4 items-center rounded-full py-3 ${
                submitting || !isValid ? 'bg-gray-300' : 'bg-primary'
              }`}
              onPress={handleSubmit(onSubmit)}
              disabled={submitting || !isValid}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-base font-bold text-white">
                  {submitLabel}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </FormProvider>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
