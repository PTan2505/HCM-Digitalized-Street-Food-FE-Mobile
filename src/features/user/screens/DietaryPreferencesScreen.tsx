import DietaryList from '@features/user/components/DietaryList';
import useDietaryPreference from '@features/user/hooks/useDietaryPreference';
import { DietaryPreference } from '@features/user/types/dietaryPreference';
import React, { JSX, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DietaryPreferencesScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const [focusOptionId, setFocusOptionId] = useState<number | null>(null);
  const [dietaryOptions, setDietaryOptions] = useState<DietaryPreference[]>([]);
  const { getAllDietaryPreferences } = useDietaryPreference();

  useEffect(() => {
    const fetchDietaryPreferences = async (): Promise<void> => {
      const preferences = await getAllDietaryPreferences();
      setDietaryOptions(preferences);
    };
    fetchDietaryPreferences();
  }, [getAllDietaryPreferences]);

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
    </SafeAreaView>
  );
};

export default DietaryPreferencesScreen;
