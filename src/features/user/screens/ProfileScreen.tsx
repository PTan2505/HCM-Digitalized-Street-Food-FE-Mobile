import { Ionicons } from '@expo/vector-icons';
import useLogin from '@features/auth/hooks/useLogin';
import DietaryList from '@features/user/components/dietaryPreferences/DietaryList';
import useUserDietary from '@features/user/hooks/dietaryPreference/useUserDietary';
import { DietaryPreference } from '@features/user/types/dietaryPreference';
import { useAppSelector } from '@hooks/reduxHooks';
import TranslationModule from '@modules/translation-module';
import { useNavigation } from '@react-navigation/native';
import { selectUser } from '@slices/auth';
import { selectUserDietaryPreferences } from '@slices/dietary';
import getHighResAvatar from '@utils/getHighResAvatar';
import React, { JSX, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen = (): JSX.Element => {
  const { i18n } = useTranslation();
  const user = useAppSelector(selectUser);
  const userDietaryPreferences = useAppSelector(selectUserDietaryPreferences);
  const { onLogout } = useLogin();
  const navigation = useNavigation();
  const { onGetUserDietaryPreferences } = useUserDietary();
  const [translatedOptions, setTranslatedOptions] = useState<
    DietaryPreference[]
  >([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const currentLanguage = i18n.language;

  useEffect(() => {
    onGetUserDietaryPreferences();
  }, [onGetUserDietaryPreferences]);

  // Translate dietary options when language is English
  useEffect(() => {
    const translateOptions = async (): Promise<void> => {
      if (userDietaryPreferences.length === 0) {
        setTranslatedOptions([]);
        return;
      }

      if (currentLanguage !== 'en') {
        setTranslatedOptions(userDietaryPreferences);
        return;
      }

      setIsTranslating(true);
      try {
        const translated = await Promise.all(
          userDietaryPreferences.map(async (option) => {
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
        setTranslatedOptions(userDietaryPreferences);
      } finally {
        setIsTranslating(false);
      }
    };

    translateOptions();
  }, [currentLanguage, userDietaryPreferences]);

  // Use translated options for display
  const displayOptions =
    translatedOptions.length > 0 ? translatedOptions : userDietaryPreferences;

  const renderField = (
    label: string,
    icon: keyof typeof Ionicons.glyphMap,
    value: string | undefined | null
  ): JSX.Element => {
    return (
      <View className="mb-5">
        <Text className="mb-2 text-sm font-semibold text-black">{label}</Text>
        <View className="flex-row items-center rounded-xl border border-[#a1d973] px-4 py-3.5">
          <Ionicons name={icon} size={20} color="#999" />
          <Text className="ml-3 flex-1 text-sm text-[#999]">
            {value ?? 'Chưa cập nhật'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <ScrollView>
        <View className="flex-row items-center justify-end px-4">
          <TouchableOpacity
            onPress={() => navigation.navigate('SetupUserInfo')}
          >
            <Ionicons name="pencil-outline" size={24} color="#a1d973" />
          </TouchableOpacity>
        </View>
        <View className="mb-8 mt-5 items-center">
          <View className="relative">
            <Image
              source={{ uri: getHighResAvatar(user?.avatarUrl) }}
              style={{
                width: 128,
                height: 128,
                borderRadius: 64,
              }}
              className="border-[2px] border-[#a1d973] shadow-2xl"
              resizeMode="cover"
            />
            <View className="absolute bottom-0 right-0 h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-[#a1d973] shadow-md">
              <Ionicons name="beer" size={18} color="white" />
            </View>
          </View>

          <Text className="my-2 text-xl font-bold text-black">
            {user?.username ?? 'Chưa cập nhật'}
          </Text>
          <Text className="text-[#ABABAB]">{user?.point} điểm</Text>
        </View>

        <View className="px-6">
          {renderField('Họ', 'person-outline', user?.lastName)}
          {renderField('Tên', 'person-outline', user?.firstName)}
          {renderField('Email', 'mail-outline', user?.email)}
          {renderField('Số điện thoại', 'call-outline', user?.phoneNumber)}
        </View>

        <View className="mb-4 px-6">
          <Text className="mb-2 text-base font-semibold">Sở thích ăn uống</Text>
          {isTranslating ? (
            <View className="items-center justify-center py-4">
              <ActivityIndicator size="small" color="#a1d973" />
            </View>
          ) : (
            <DietaryList
              dietaryOptions={displayOptions}
              selectedOptions={userDietaryPreferences.map(
                (pref) => pref.dietaryPreferenceId
              )}
              setSelectedOptions={() => {}}
            />
          )}
        </View>

        <Pressable
          onPress={() => navigation.navigate('DietaryPreferences')}
          className="mx-6 mb-4 items-center rounded-2xl bg-[#a1d973] py-4"
        >
          <Text className="text-base font-semibold text-white">
            Cập nhật sở thích ăn uống
          </Text>
        </Pressable>

        <Pressable
          onPress={onLogout}
          className="mx-6 mb-8 items-center rounded-2xl border-[1px] border-[#a1d973] py-4"
        >
          <Text className="text-base font-semibold text-[#a1d973]">
            Đăng xuất
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
