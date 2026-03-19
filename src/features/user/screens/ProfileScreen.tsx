import { Ionicons } from '@expo/vector-icons';
import useLogin from '@features/auth/hooks/useLogin';
import DietaryList from '@features/user/components/dietaryPreferences/DietaryList';
import useUserDietary from '@features/user/hooks/dietaryPreference/useUserDietary';
import { useAppSelector } from '@hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import { selectUser } from '@slices/auth';
import { selectUserDietaryPreferences } from '@slices/dietary';
import getHighResAvatar from '@utils/getHighResAvatar';
import React, { JSX, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ProfileScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  const userDietaryPreferences = useAppSelector(selectUserDietaryPreferences);
  const { onLogout } = useLogin();
  const navigation = useNavigation();
  const { onGetUserDietaryPreferences } = useUserDietary();

  useEffect(() => {
    onGetUserDietaryPreferences();
  }, [onGetUserDietaryPreferences]);

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
            {value ?? t('profile.not_updated')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
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
            {user?.username ?? t('profile.not_updated')}
          </Text>
          <Text className="text-[#ABABAB]">
            {user?.point} {t('profile.points')}
          </Text>
        </View>

        <View className="px-6">
          {renderField(
            t('profile.last_name'),
            'person-outline',
            user?.lastName
          )}
          {renderField(
            t('profile.first_name'),
            'person-outline',
            user?.firstName
          )}
          {renderField(t('profile.email'), 'mail-outline', user?.email)}
          {renderField(
            t('profile.phone_number'),
            'call-outline',
            user?.phoneNumber
          )}
        </View>

        <View className="mb-4 px-6">
          <Text className="mb-2 text-base font-semibold">
            {t('profile.dietary_preferences')}
          </Text>
          <DietaryList
            dietaryOptions={userDietaryPreferences}
            selectedOptions={userDietaryPreferences.map(
              (pref) => pref.dietaryPreferenceId
            )}
            setSelectedOptions={() => {}}
          />
        </View>

        <Pressable
          onPress={() => navigation.navigate('DietaryPreferences')}
          className="mx-6 mb-4 items-center rounded-2xl bg-[#a1d973] py-4"
        >
          <Text className="text-base font-semibold text-white">
            {t('profile.update_dietary_preferences')}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('OrderHistory')}
          className="mx-6 mb-4 flex-row items-center justify-center rounded-2xl border-[1px] border-[#a1d973] py-4"
        >
          <Ionicons name="receipt-outline" size={20} color="#a1d973" />
          <Text className="ml-2 text-base font-semibold text-[#a1d973]">
            {t('order.my_orders')}
          </Text>
        </Pressable>

        <Pressable
          onPress={onLogout}
          className="mx-6 mb-8 items-center rounded-2xl border-[1px] border-[#a1d973] py-4"
        >
          <Text className="text-base font-semibold text-[#a1d973]">
            {t('profile.logout')}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};
