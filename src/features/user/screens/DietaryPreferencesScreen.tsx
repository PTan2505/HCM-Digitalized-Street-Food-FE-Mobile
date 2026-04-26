import { CustomButton } from '@components/CustomButton';
import { COLORS } from '@constants/colors';
import DietaryList from '@features/user/components/dietaryPreferences/DietaryList';
import useUserDietary from '@features/user/hooks/dietaryPreference/useUserDietary';
import { useDietaryPreferenceQuery } from '@features/user/hooks/dietaryPreference/useDietaryPreferenceQuery';
import { useUserDietaryQuery } from '@features/user/hooks/dietaryPreference/useUserDietaryQuery';
import { useNavigation } from '@react-navigation/native';
import React, { JSX, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const DietaryPreferencesScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const { dietaryPreferences, isLoading } = useDietaryPreferenceQuery();
  const { userDietaryPreferences } = useUserDietaryQuery();
  const { onCreateOrUpdateUserDietaryPreferences } = useUserDietary();
  const navigation = useNavigation();

  useEffect(() => {
    setSelectedOptions(
      userDietaryPreferences.map((pref) => pref.dietaryPreferenceId)
    );
  }, [userDietaryPreferences]);

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
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <Text className="mb-2 mt-4 text-2xl font-bold text-gray-900">
          {t('dietary.preferences_title')}
        </Text>
        <Text className="mb-6 text-base leading-6 text-gray-600">
          {t('dietary.preferences_description')}
        </Text>

        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <DietaryList
            dietaryOptions={dietaryPreferences}
            setFocusOptionId={() => {}}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
          />
        )}
      </ScrollView>

      <View className="px-4 pb-4">
        <CustomButton
          onPress={handleSubmit}
          text={t('dietary.save')}
          loadingText={t('dietary.saving')}
          isLoading={false}
          disabled={selectedOptions.length === 0}
        />
      </View>
    </SafeAreaView>
  );
};
