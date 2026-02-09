import noAvt from '@assets/avatar/no-avatar.png';
import { CustomButton } from '@components/CustomButton';
import { CustomInput } from '@components/CustomInput';
import { APIErrorResponse } from '@custom-types/apiResponse';
import { User } from '@custom-types/user';
import { UpdateProfileSchema } from '@features/auth/utils/updateUserProfileSchema';
import useProfile from '@features/user/hooks/profile/useProfile';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import { selectUser } from '@slices/auth';
import getHighResAvatar from '@utils/getHighResAvatar';
import { JSX } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

const UserProfileForm = (): JSX.Element => {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { updateUserProfile } = useProfile();

  const methods = useForm<Partial<User>>({
    defaultValues: {
      username: user?.username ?? null,
      email: user?.email ?? null,
      firstName: user?.firstName ?? null,
      lastName: user?.lastName ?? null,
      phoneNumber: user?.phoneNumber ?? null,
    },
    resolver: zodResolver(UpdateProfileSchema),
  });

  const { handleSubmit, setError } = methods;

  const onSubmit = async (data: Partial<User>): Promise<void> => {
    try {
      await updateUserProfile(data);
      navigation.navigate('Main');
    } catch (error) {
      const err = error as APIErrorResponse;
      if (err.fieldErrors) {
        console.error('Profile update error:', err.fieldErrors);
        // This gives you an array of strings: ["username", "email"]
        const errorKeys = Object.keys(err.fieldErrors);

        console.log('Fields with errors:', errorKeys);

        // Example: loop through them
        errorKeys.forEach((key) => {
          setError(key as keyof Partial<User>, {
            type: 'server',
            message: err.fieldErrors![key].join(', '),
          });
          console.log(`Field ${key} has errors:`, err.fieldErrors![key]);
        });
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView className="flex-1">
        <View className="items-center py-6">
          <Pressable className="relative">
            <Image
              source={
                user?.avatarUrl
                  ? { uri: getHighResAvatar(user?.avatarUrl) }
                  : noAvt
              }
              className="h-[128] w-[128] rounded-[64] border-[2px] border-[#a1d973] shadow-2xl"
            />
            <View className="bg-primary absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full">
              <Text className="text-white">📷</Text>
            </View>
          </Pressable>
        </View>

        <FormProvider {...methods}>
          <View className="flex gap-8 px-4">
            <CustomInput<Partial<User>>
              name="username"
              label="Tên người dùng"
              type="username"
              placeholder="Nhập tên người dùng"
              required
            />

            <CustomInput<Partial<User>>
              name="email"
              label="Email"
              type="email"
              placeholder="Nhập email"
              keyboardType="email-address"
              readonly={!!user?.email}
            />

            <CustomInput<Partial<User>>
              name="firstName"
              label="Tên"
              type="name"
              placeholder="Nhập tên"
              required
            />

            <CustomInput<Partial<User>>
              name="lastName"
              label="Họ"
              type="name"
              placeholder="Nhập họ"
              required
            />

            <CustomInput<Partial<User>>
              name="phoneNumber"
              label="Số điện thoại"
              type="phone"
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
            />
          </View>

          <View className="px-4 py-6">
            <View className="gap-3">
              <CustomButton
                text="Lưu thay đổi"
                onPress={handleSubmit(onSubmit)}
              />
            </View>
          </View>
        </FormProvider>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default UserProfileForm;
