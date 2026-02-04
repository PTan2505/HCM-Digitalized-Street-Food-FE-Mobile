import useLogin from '@features/auth/hooks/useLogin';
import React, { JSX, useEffect, useState } from 'react';
import { Image, Text, View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectUser } from '@slices/auth';
import { useNavigation } from '@react-navigation/native';
import DietaryList from '@features/user/components/DietaryList';
import useUserDietary from '@features/user/hooks/useUserDietary';
import { DietaryPreference } from '@features/user/types/dietaryPreference';

const ProfileScreen = (): JSX.Element => {
  const user = useAppSelector(selectUser);
  const { onLogout } = useLogin();
  const navigation = useNavigation();
  const [dietaryOptions, setDietaryOptions] = useState<DietaryPreference[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const { getUserDietaryPreferences } = useUserDietary();

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const userPreferences = await getUserDietaryPreferences();
      setDietaryOptions(userPreferences);
      setSelectedOptions(
        userPreferences.map((pref) => pref.dietaryPreferenceId)
      );
    };
    fetchData();
  }, [getUserDietaryPreferences]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        <View className="mb-8 mt-6 items-center">
          <View className="relative">
            <Image
              source={{ uri: user?.avatarUrl }}
              className="h-[120px] w-[120px] rounded-full bg-[#f0f0f0]"
            />
          </View>

          <Text className="my-2 text-xl font-bold text-black">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className="text-[#ABABAB]">{user?.email}</Text>
        </View>

        <View className="my-4 px-6">
          <Text className="mb-2 text-base font-semibold">
            Sở thích ăn kiêng của tôi
          </Text>
          <DietaryList
            dietaryOptions={dietaryOptions}
            selectedOptions={selectedOptions}
            setSelectedOptions={() => {}}
          />
        </View>

        <Pressable
          onPress={() => navigation.navigate('DietaryPreferences')}
          className="mx-6 mb-4 items-center rounded-xl bg-[#06AA4C] py-4"
        >
          <Text className="text-base font-semibold text-white">
            Chỉnh sửa sở thích ăn kiêng
          </Text>
        </Pressable>

        <Pressable
          onPress={onLogout}
          className="mx-6 mb-8 items-center rounded-xl border-2 border-[#06AA4C] py-4"
        >
          <Text className="text-base font-semibold text-[#06AA4C]">
            Đăng xuất
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
