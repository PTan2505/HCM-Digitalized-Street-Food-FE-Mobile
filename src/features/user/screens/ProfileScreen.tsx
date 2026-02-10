import { Ionicons } from '@expo/vector-icons';
import useLogin from '@features/auth/hooks/useLogin';
import DietaryList from '@features/user/components/dietaryPreferences/DietaryList';
import useUserDietary from '@features/user/hooks/dietaryPreference/useUserDietary';
import { useAppSelector } from '@hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import { selectUser } from '@slices/auth';
import { selectUserDietaryPreferences } from '@slices/dietary';
import getHighResAvatar from '@utils/getHighResAvatar';
import React, { JSX, useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen = (): JSX.Element => {
  const user = useAppSelector(selectUser);
  const userDietaryPreferences = useAppSelector(selectUserDietaryPreferences);
  const { onLogout } = useLogin();
  const navigation = useNavigation();
  const { onGetUserDietaryPreferences } = useUserDietary();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editValues, setEditValues] = useState({
    lastName: user?.lastName ?? '',
    firstName: user?.firstName ?? '',
    email: user?.email ?? '',
    phoneNumber: user?.phoneNumber ?? '',
  });

  useEffect(() => {
    onGetUserDietaryPreferences();
  }, [onGetUserDietaryPreferences]);

  const handleSave = () => {
    // TODO: Save to API or Redux
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setEditValues({
      lastName: user?.lastName ?? '',
      firstName: user?.firstName ?? '',
      email: user?.email ?? '',
      phoneNumber: user?.phoneNumber ?? '',
    });
    setIsEditMode(false);
  };

  const isFieldEmpty = (value: string) => !value?.trim();

  const renderField = (
    label: string,
    icon: keyof typeof Ionicons.glyphMap,
    fieldKey: keyof typeof editValues,
    isEmpty: boolean
  ) => {
    const isDisabled = isEditMode && !isEmpty;

    if (!isEditMode || !isEmpty) {
      return (
        <View className={`mb-5 ${isDisabled ? 'opacity-50' : ''}`}>
          <Text className="mb-2 text-sm font-semibold text-black">{label}</Text>
          <View className="flex-row items-center rounded-xl border border-[#a1d973] px-4 py-3.5">
            <Ionicons name={icon} size={20} color="#999" />
            <Text className="ml-3 flex-1 text-sm text-[#999]">
              {editValues[fieldKey] ?? 'Chưa cập nhật'}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View className="mb-5">
        <Text className="mb-2 text-sm font-semibold text-black">{label}</Text>
        <View className="flex-row items-center rounded-xl border border-[#a1d973] px-4 py-3">
          <Ionicons name={icon} size={20} color="#999" />
          <TextInput
            className="ml-3 flex-1 text-sm text-black"
            placeholder="Nhập thông tin"
            placeholderTextColor="#999"
            value={editValues[fieldKey]}
            onChangeText={(text) =>
              setEditValues((prev) => ({ ...prev, [fieldKey]: text }))
            }
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <ScrollView>
        <View className="flex-row items-center justify-end px-4">
          <TouchableOpacity onPress={() => setIsEditMode(!isEditMode)}>
            <Ionicons
              name={isEditMode ? 'close' : 'pencil-outline'}
              size={24}
              color="#a1d973"
            />
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
          {renderField(
            'Họ',
            'person-outline',
            'lastName',
            isFieldEmpty(editValues.lastName)
          )}
          {renderField(
            'Tên',
            'person-outline',
            'firstName',
            isFieldEmpty(editValues.firstName)
          )}
          {renderField(
            'Email',
            'mail-outline',
            'email',
            isFieldEmpty(editValues.email)
          )}
          {renderField(
            'Số điện thoại',
            'call-outline',
            'phoneNumber',
            isFieldEmpty(editValues.phoneNumber)
          )}
        </View>

        <View className="mb-4 px-6">
          <Text className="mb-2 text-base font-semibold">Sở thích ăn uống</Text>
          <DietaryList
            dietaryOptions={userDietaryPreferences}
            selectedOptions={userDietaryPreferences.map(
              (pref) => pref.dietaryPreferenceId
            )}
            setSelectedOptions={() => {}}
          />
        </View>

        {isEditMode && (
          <View className="mb-4 flex-row gap-3 px-6">
            <Pressable
              onPress={handleSave}
              className="flex-1 items-center rounded-2xl bg-[#a1d973] py-4"
            >
              <Text className="text-base font-semibold text-white">Lưu</Text>
            </Pressable>
            <Pressable
              onPress={handleCancel}
              className="flex-1 items-center rounded-2xl border-[1px] border-[#a1d973] py-4"
            >
              <Text className="text-base font-semibold text-[#a1d973]">
                Hủy
              </Text>
            </Pressable>
          </View>
        )}

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
