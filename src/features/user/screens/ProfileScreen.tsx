import { COLORS } from '@constants/colors';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import useLogin from '@features/auth/hooks/useLogin';
import { ProfileActionCards } from '@features/user/components/profile/ProfileActionCards';
import { ProfileFeatureButtons } from '@features/user/components/profile/ProfileFeatureButtons';
import { ProfileListItem } from '@features/user/components/profile/ProfileListItem';
import { ProfileTabs } from '@features/user/components/profile/ProfileTabs';
import { getProfileSections } from '@features/user/config/profileSections';
import { ProfileSection } from '@features/user/types/profileConfig';
import { useAppSelector } from '@hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { selectUser } from '@slices/auth';
import getHighResAvatar from '@utils/getHighResAvatar';
import React, { JSX, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ProfileScreen = (): JSX.Element => {
  const { t, i18n } = useTranslation();
  const user = useAppSelector(selectUser);
  const { onLogout } = useLogin();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();

  // Get profile sections configuration
  const changeLanguage = useCallback(
    async (lng: string): Promise<void> => {
      await i18n.changeLanguage(lng);
    },
    [i18n]
  );

  const sections = useMemo(
    () =>
      getProfileSections(
        t,
        navigation,
        onLogout,
        user,
        i18n.language,
        changeLanguage
      ),
    [t, navigation, onLogout, user, i18n.language, changeLanguage]
  );

  const renderSection = (section: ProfileSection): JSX.Element | null => {
    // Don't render if section is not visible
    if (section.visible === false) {
      return null;
    }

    const containerClass = section.containerClassName ?? '';

    switch (section.type) {
      case 'action-cards':
        return section.actionCards ? (
          <View key={section.id} className={containerClass}>
            <ProfileActionCards cards={section.actionCards} />
          </View>
        ) : null;

      case 'tabs':
        return section.tabs ? (
          <View key={section.id} className={containerClass}>
            <ProfileTabs tabs={section.tabs} />
          </View>
        ) : null;

      case 'feature-buttons':
        return section.items ? (
          <View key={section.id} className={containerClass}>
            <ProfileFeatureButtons items={section.items} />
          </View>
        ) : null;

      case 'list-items':
        return (
          <View key={section.id} className={containerClass}>
            {section.title && (
              <Text
                className={
                  section.titleClassName ??
                  'mb-3 px-4 text-base font-bold text-gray-900'
                }
              >
                {section.title}
              </Text>
            )}
            <View className="overflow-hidden rounded-2xl bg-white">
              {section.items?.map((item, index) => (
                <ProfileListItem
                  key={item.id}
                  item={item}
                  isLastItem={index === (section.items?.length ?? 0) - 1}
                />
              ))}
            </View>
          </View>
        );

      case 'custom':
        return section.component ? (
          <View key={section.id} className={containerClass}>
            <section.component />
          </View>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="mb-6 bg-white pb-6 pt-4">
          <View className="mb-4 flex-row items-center justify-between px-4">
            <Text className="text-xl font-bold text-gray-900">
              {t('profile.title', 'Hồ sơ')}
            </Text>
            <Pressable onPress={() => navigation.navigate('PersonalCart', {})}>
              <Ionicons name="cart-outline" size={24} color="black" />
            </Pressable>
          </View>

          <View className="items-center">
            <View className="relative">
              {getHighResAvatar(user?.avatarUrl) ? (
                <Image
                  source={{ uri: getHighResAvatar(user?.avatarUrl) }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                  }}
                  resizeMode="cover"
                />
              ) : (
                <FontAwesome
                  name="user-circle-o"
                  size={80}
                  color={COLORS.primary}
                />
              )}
            </View>

            <Text className="mt-3 text-lg font-bold text-gray-900">
              {user?.username ?? t('profile.not_updated')}
            </Text>
            <Pressable
              className="mt-1 flex-row items-center rounded-full bg-gray-100 px-3 py-1"
              onPress={() => navigation.navigate('SetupUserInfo')}
            >
              <Text className="mr-1 text-base text-gray-600">
                {t('profile.view_profile', 'Xem hồ sơ')}
              </Text>
              <Ionicons name="chevron-forward" size={14} color="#666" />
            </Pressable>
          </View>
        </View>

        {/* Render all sections from config */}
        {sections.map((section) => renderSection(section))}
      </ScrollView>
    </SafeAreaView>
  );
};
