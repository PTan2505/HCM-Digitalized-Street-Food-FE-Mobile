import DietaryList from '@features/user/components/DietaryList';
import React, { JSX, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DietaryPreferencesScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const [focusOptionId, setFocusOptionId] = useState<number | null>(null);

  const dietaryOptions = [
    { id: 1, name: t('dietary.vegan'), description: t('dietary.vegan_desc') },
    {
      id: 2,
      name: t('dietary.vegetarian'),
      description: t('dietary.vegetarian_desc'),
    },
    {
      id: 3,
      name: t('dietary.gluten_free'),
      description: t('dietary.gluten_free_desc'),
    },
    {
      id: 4,
      name: t('dietary.dairy_free'),
      description: t('dietary.dairy_free_desc'),
    },
    {
      id: 5,
      name: t('dietary.nut_free'),
      description: t('dietary.nut_free_desc'),
    },
    { id: 6, name: t('dietary.halal'), description: t('dietary.halal_desc') },
    { id: 7, name: t('dietary.kosher'), description: t('dietary.kosher_desc') },
    {
      id: 8,
      name: t('dietary.pescatarian'),
      description: t('dietary.pescatarian_desc'),
    },
  ];

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
        <View className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white px-6 py-8 shadow-2xl">
          <Text className="text-base leading-6 text-gray-600">
            {
              dietaryOptions.find((option) => option.id === focusOptionId)
                ?.description
            }
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default DietaryPreferencesScreen;
