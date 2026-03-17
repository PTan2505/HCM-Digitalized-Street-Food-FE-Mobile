import { CustomButton } from '@components/CustomButton';
import DietaryList from '@features/user/components/dietaryPreferences/DietaryList';
import useDietaryPreference from '@features/user/hooks/dietaryPreference/useDietaryPreference';
import useUserDietary from '@features/user/hooks/dietaryPreference/useUserDietary';
import { useAppSelector } from '@hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import { selectDietaryPreferences, selectDietaryState } from '@slices/dietary';
import React, { JSX, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const DietaryPreferencesScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const [focusOptionId, setFocusOptionId] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const dietaryStatus = useAppSelector(selectDietaryState);
  const dietaryOptions = useAppSelector(selectDietaryPreferences);
  const isSubmitting = dietaryStatus === 'pending';
  const { onGetAllDietaryPreferences } = useDietaryPreference();
  const { onCreateOrUpdateUserDietaryPreferences } = useUserDietary();
  const navigation = useNavigation();

  useEffect(() => {
    onGetAllDietaryPreferences();
  }, [onGetAllDietaryPreferences]);

  const handleSubmit = async (): Promise<void> => {
    try {
      await onCreateOrUpdateUserDietaryPreferences(selectedOptions);
      Alert.alert(
        t('dietary.success_title') ?? 'Success',
        t('dietary.success_message') ??
          'Dietary preferences updated successfully'
      );
      navigation.navigate('Main');
    } catch (error) {
      console.error(error);

      Alert.alert(
        t('dietary.error_title') ?? 'Error',
        t('dietary.error_message') ?? 'Failed to update dietary preferences'
      );
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
      {dietaryStatus === 'pending' ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#a1d973" />
        </View>
      ) : (
        <>
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
        </>
      )}
      <View className="mt-auto pb-4">
        <CustomButton
          onPress={handleSubmit}
          text={t('dietary.confirm')}
          loadingText={t('dietary.saving')}
          isLoading={isSubmitting}
          disabled={selectedOptions.length === 0}
        />
      </View>
    </SafeAreaView>
  );
};
