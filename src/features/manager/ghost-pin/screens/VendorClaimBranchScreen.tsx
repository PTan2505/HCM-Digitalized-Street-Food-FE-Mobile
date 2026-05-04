import Header from '@components/Header';
import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useClaimBranch } from '@manager/ghost-pin/hooks/useClaimBranch';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  compressImageForUpload,
  pickImagesFromLibrary,
  type PickedImage,
} from '@utils/imagePicker';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RouteParams {
  branchId: number;
  branchName: string;
}

const MAX_IMAGES = 4;

export const VendorClaimBranchScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  const route = useRoute();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigation = useNavigation<any>();
  const { branchId, branchName } = route.params as RouteParams;

  const [images, setImages] = useState<PickedImage[]>([]);
  const [isPicking, setIsPicking] = useState(false);
  const claimMutation = useClaimBranch();

  const handlePickImages = async (): Promise<void> => {
    if (images.length >= MAX_IMAGES) return;
    setIsPicking(true);
    try {
      const result = await pickImagesFromLibrary({
        maxImages: MAX_IMAGES - images.length,
      });
      if (result.error === 'permission_denied') {
        Alert.alert(
          t('vendor_claim.permission_title'),
          t('vendor_claim.permission_message')
        );
        return;
      }
      if (result.error === 'cancelled') return;
      const compressed = await Promise.all(
        result.images.map((img) => compressImageForUpload(img.uri, img.fileName))
      );
      setImages((prev) => [...prev, ...compressed].slice(0, MAX_IMAGES));
    } finally {
      setIsPicking(false);
    }
  };

  const handleRemoveImage = (index: number): void => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (): void => {
    if (images.length === 0) {
      Alert.alert(
        t('vendor_claim.no_images_title'),
        t('vendor_claim.no_images_message')
      );
      return;
    }
    claimMutation.mutate(
      { branchId, licenseImages: images },
      {
        onSuccess: () => {
          Alert.alert(
            t('vendor_claim.success_title'),
            t('vendor_claim.success_message'),
            [
              {
                text: t('common.ok'),
                onPress: () => navigation.goBack(),
              },
            ]
          );
        },
        onError: () => {
          Alert.alert(
            t('vendor_claim.error_title'),
            t('vendor_claim.error_message')
          );
        },
      }
    );
  };

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-gray-50">
      <Header
        title={t('vendor_claim.title')}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <Text className="text-xs font-semibold uppercase text-gray-500">
            {t('vendor_claim.branch')}
          </Text>
          <Text className="mt-1 text-base font-bold text-gray-900">
            {branchName}
          </Text>
        </View>

        <Text className="mb-2 text-sm font-bold text-gray-900">
          {t('vendor_claim.license_images')}
        </Text>
        <Text className="mb-3 text-xs text-gray-500">
          {t('vendor_claim.license_hint', { max: MAX_IMAGES })}
        </Text>

        {images.length > 0 && (
          <View className="mb-3 flex-row flex-wrap gap-3">
            {images.map((img, idx) => (
              <View key={`${img.uri}-${idx}`} className="relative">
                <Image
                  source={{ uri: img.uri }}
                  style={{ width: 96, height: 96, borderRadius: 12 }}
                />
                <TouchableOpacity
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1"
                  onPress={() => handleRemoveImage(idx)}
                >
                  <Ionicons name="close" size={14} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {images.length < MAX_IMAGES && (
          <TouchableOpacity
            className="flex-row items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-6"
            onPress={() => void handlePickImages()}
            disabled={isPicking}
            activeOpacity={0.7}
          >
            {isPicking ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <>
                <Ionicons name="image-outline" size={20} color={COLORS.primary} />
                <Text className="ml-2 text-sm font-semibold text-primary">
                  {t('vendor_claim.add_image')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4">
        <TouchableOpacity
          className={`items-center rounded-full py-3 ${
            claimMutation.isPending || images.length === 0
              ? 'bg-gray-300'
              : 'bg-primary'
          }`}
          onPress={handleSubmit}
          disabled={claimMutation.isPending || images.length === 0}
        >
          <Text className="text-base font-bold text-white">
            {claimMutation.isPending
              ? t('common.saving')
              : t('vendor_claim.submit')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
