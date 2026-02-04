import { CustomButton } from '@components/CustomButton';
import DietaryList from '@features/user/components/DietaryList';
import useDietaryPreference from '@features/user/hooks/useDietaryPreference';
import useUserDietary from '@features/user/hooks/useUserDietary';
import { DietaryPreference } from '@features/user/types/dietaryPreference';
import React, { JSX, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DietaryPreferencesScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const [focusOptionId, setFocusOptionId] = useState<number | null>(null);
  const [dietaryOptions, setDietaryOptions] = useState<DietaryPreference[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getAllDietaryPreferences } = useDietaryPreference();
  const { createOrUpdateUserDietaryPreferences } = useUserDietary();

  useEffect(() => {
    const fetchDietaryPreferences = async (): Promise<void> => {
      const preferences = await getAllDietaryPreferences();
      setDietaryOptions(preferences);
    };
    fetchDietaryPreferences();
  }, [getAllDietaryPreferences]);

  const handleSubmit = async (): Promise<void> => {
    try {
      setIsSubmitting(true);
      const response =
        await createOrUpdateUserDietaryPreferences(selectedOptions);
      Alert.alert(
        t('dietary.success_title') ?? 'Success',
        response.message ??
          t('dietary.success_message') ??
          'Dietary preferences updated successfully'
      );
    } catch (error) {
      Alert.alert(
        t('dietary.error_title') ?? 'Error',
        t('dietary.error_message') ?? 'Failed to update dietary preferences'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 px-4">
      <Text className="mb-4 text-lg font-semibold">
        {t('dietary.preferences_title')}
      </Text>
      <Text className="mb-6 text-base text-gray-600">
        {t('dietary.preferences_description')}
      </Text>
      <DietaryList
        dietaryOptions={dietaryOptions}
        setFocusOptionId={setFocusOptionId}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
      />
      {focusOptionId && (
        <View className="px-6 py-8">
          <Text className="text-base leading-6 text-gray-600">
            {
              dietaryOptions.find(
                (option) => option.dietaryPreferenceId === focusOptionId
              )?.description
            }
          </Text>
        </View>
      )}
      <View className="mt-auto pb-4">
        <CustomButton
          onPress={handleSubmit}
          text={t('Confirm') ?? 'Save Preferences'}
          loadingText={t('dietary.submitting') ?? 'Saving...'}
          isLoading={isSubmitting}
          disabled={selectedOptions.length === 0}
        />
      </View>
    </SafeAreaView>
  );
};

export default DietaryPreferencesScreen;
