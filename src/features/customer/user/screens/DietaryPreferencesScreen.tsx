import { CustomButton } from '@components/CustomButton';
import { COLORS } from '@constants/colors';
import DietaryList from '@features/customer/user/components/dietaryPreferences/DietaryList';
import useDietaryPreference from '@features/customer/user/hooks/dietaryPreference/useDietaryPreference';
import useUserDietary from '@features/customer/user/hooks/dietaryPreference/useUserDietary';
import { useAppSelector } from '@hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import {
  selectDietaryPreferences,
  selectDietaryState,
  selectUserDietaryPreferences,
} from '@slices/dietary';
import React, { JSX, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const DietaryPreferencesScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const dietaryStatus = useAppSelector(selectDietaryState);
  const dietaryOptions = useAppSelector(selectDietaryPreferences);
  const isSubmitting = dietaryStatus === 'pending';
  const userDietaryPreferences = useAppSelector(selectUserDietaryPreferences);
  const { onGetAllDietaryPreferences } = useDietaryPreference();
  const { onCreateOrUpdateUserDietaryPreferences } = useUserDietary();
  const navigation = useNavigation();

  useEffect(() => {
    setSelectedOptions(
      userDietaryPreferences.map((pref) => pref.dietaryPreferenceId)
    );
    onGetAllDietaryPreferences();
  }, [onGetAllDietaryPreferences, userDietaryPreferences]);

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

        {dietaryStatus === 'pending' ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <DietaryList
            dietaryOptions={dietaryOptions}
            setFocusOptionId={() => {}}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
          />
        )}
      </ScrollView>

      <View className="px-4 pb-4">
        {/* AI Disclaimer */}
        {/* <Pressable
          className="mb-6 mt-6 flex-row items-start"
          onPress={() => setAiDisclaimerChecked(!aiDisclaimerChecked)}
        >
          <View
            className={`mr-3 mt-0.5 h-5 w-5 items-center justify-center rounded border-2 ${
              aiDisclaimerChecked
                ? 'border-primary bg-primary'
                : 'border-gray-300 bg-white'
            }`}
          >
            {aiDisclaimerChecked && (
              <MaterialCommunityIcons name="check" size={14} color="white" />
            )}
          </View>
          <Text className="flex-1 text-base leading-5 text-gray-600">
            {t('dietary.ai_disclaimer')}
          </Text>
        </Pressable> */}
        <CustomButton
          onPress={handleSubmit}
          text={t('dietary.save')}
          loadingText={t('dietary.saving')}
          isLoading={isSubmitting}
          disabled={selectedOptions.length === 0}
        />
      </View>
    </SafeAreaView>
  );
};
