import { CustomButton } from '@components/CustomButton';
import DietaryList from '@features/user/components/dietaryPreferences/DietaryList';
import useDietaryPreference from '@features/user/hooks/dietaryPreference/useDietaryPreference';
import useUserDietary from '@features/user/hooks/dietaryPreference/useUserDietary';
import { DietaryPreference } from '@features/user/types/dietaryPreference';
import { useAppSelector } from '@hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import { selectDietaryPreferences, selectDietaryState } from '@slices/dietary';
import TranslationModule from '@modules/translation-module';
import React, { JSX, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DietaryPreferencesScreen = (): JSX.Element => {
  const { t, i18n } = useTranslation();
  const [focusOptionId, setFocusOptionId] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [translatedOptions, setTranslatedOptions] = useState<
    DietaryPreference[]
  >([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const dietaryStatus = useAppSelector(selectDietaryState);
  const dietaryOptions = useAppSelector(selectDietaryPreferences);
  const isSubmitting = dietaryStatus === 'pending';
  const { onGetAllDietaryPreferences } = useDietaryPreference();
  const { onCreateOrUpdateUserDietaryPreferences } = useUserDietary();
  const navigation = useNavigation();
  const currentLanguage = i18n.language;

  useEffect(() => {
    onGetAllDietaryPreferences();
  }, [onGetAllDietaryPreferences]);

  // Translate dietary options when language is English
  useEffect(() => {
    const translateOptions = async (): Promise<void> => {
      if (dietaryOptions.length === 0) {
        return;
      }

      if (currentLanguage !== 'en') {
        setTranslatedOptions(dietaryOptions);
        return;
      }

      setIsTranslating(true);
      try {
        const translated = await Promise.all(
          dietaryOptions.map(async (option) => {
            const [translatedName, translatedDescription] = await Promise.all([
              TranslationModule.translate(option.name, 'vi', 'en'),
              option.description
                ? TranslationModule.translate(option.description, 'vi', 'en')
                : Promise.resolve(undefined),
            ]);

            return {
              ...option,
              name: translatedName,
              description: translatedDescription,
            };
          })
        );
        setTranslatedOptions(translated);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedOptions(dietaryOptions);
      } finally {
        setIsTranslating(false);
      }
    };

    translateOptions();
  }, [currentLanguage, dietaryOptions]);

  // Use translated options for display
  const displayOptions =
    translatedOptions.length > 0 ? translatedOptions : dietaryOptions;

  // Show loading when fetching or translating
  const isLoading = dietaryStatus === 'pending' || isTranslating;

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
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#a1d973" />
        </View>
      ) : (
        <>
          <DietaryList
            dietaryOptions={displayOptions}
            setFocusOptionId={setFocusOptionId}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
          />
          {focusOptionId && (
            <View className="px-6 py-8">
              <Text className="text-base leading-6 text-gray-600">
                {
                  displayOptions.find(
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
          text={t('Xác nhận') ?? 'Lưu lại'}
          loadingText={t('Đang lưu...') ?? 'Đang lưu...'}
          isLoading={isSubmitting}
          disabled={selectedOptions.length === 0}
        />
      </View>
    </SafeAreaView>
  );
};

export default DietaryPreferencesScreen;
