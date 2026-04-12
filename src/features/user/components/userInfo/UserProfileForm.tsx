import BlankAvatar from '@assets/avatar/blankAvatar.png';
import { CustomButton } from '@components/CustomButton';
import { CustomInput } from '@components/CustomInput';
import Header from '@components/Header';
import { APIErrorResponse } from '@custom-types/apiResponse';
import { User } from '@custom-types/user';
import { Ionicons } from '@expo/vector-icons';
import { getUpdateProfileSchema } from '@features/auth/utils/updateUserProfileSchema';
import { useAvatarPicker } from '@features/user/hooks/profile/useAvatarPicker';
import useProfile from '@features/user/hooks/profile/useProfile';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import { selectUser } from '@slices/auth';
import getHighResAvatar from '@utils/getHighResAvatar';
import { JSX, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  const navigation = useNavigation();
  const { updateUserProfile } = useProfile();
  const { avatarUri, pickAvatar } = useAvatarPicker();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const schema = useMemo(() => getUpdateProfileSchema(t), [t]);
  const methods = useForm<Partial<User>>({
    defaultValues: {
      username: user?.username ?? null,
      email: user?.email ?? null,
      firstName: user?.firstName ?? null,
      lastName: user?.lastName ?? null,
      phoneNumber: user?.phoneNumber ?? null,
    },
    resolver: zodResolver(schema),
  });

  const { handleSubmit, setError } = methods;

  const onSubmit = async (data: Partial<User>): Promise<void> => {
    try {
      await updateUserProfile(data);
      setIsEditing(false);
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
      <Header
        title={t('profile.title')}
        onBackPress={() => navigation.goBack()}
        secondaryAction={{
          label: isEditing
            ? t('common.done', { defaultValue: 'Done' })
            : t('common.edit', { defaultValue: 'Edit' }),
          icon: (
            <Ionicons
              name={isEditing ? 'checkmark' : 'create-outline'}
              size={18}
              color="#111827"
            />
          ),
          onPress: () => setIsEditing((prev) => !prev),
        }}
      />
      <ScrollView className="flex-1">
        <View className="items-center py-6">
          <Pressable
            className="relative"
            onPress={pickAvatar}
            disabled={!isEditing}
          >
            <Image
              source={
                avatarUri
                  ? { uri: avatarUri }
                  : user?.avatarUrl
                    ? { uri: getHighResAvatar(user?.avatarUrl) }
                    : BlankAvatar
              }
              className="h-[128] w-[128] rounded-[64] border-[2px] border-primary shadow-2xl"
            />
            <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full bg-primary">
              <Text className="text-white">📷</Text>
            </View>
          </Pressable>
        </View>

        <FormProvider {...methods}>
          <View className="flex gap-8 px-4">
            <CustomInput<Partial<User>>
              name="username"
              label={t('edit_profile.username')}
              type="username"
              placeholder={t('edit_profile.enter_username')}
              readonly={!isEditing}
              required
            />

            <CustomInput<Partial<User>>
              name="email"
              label={t('edit_profile.email')}
              type="email"
              placeholder={t('edit_profile.enter_email')}
              keyboardType="email-address"
              readonly={!isEditing || !!user?.email}
            />

            <CustomInput<Partial<User>>
              name="firstName"
              label={t('edit_profile.first_name')}
              type="name"
              placeholder={t('edit_profile.enter_first_name')}
              readonly={!isEditing}
              required
            />

            <CustomInput<Partial<User>>
              name="lastName"
              label={t('edit_profile.last_name')}
              type="name"
              placeholder={t('edit_profile.enter_last_name')}
              readonly={!isEditing}
              required
            />

            <CustomInput<Partial<User>>
              name="phoneNumber"
              label={t('edit_profile.phone_number')}
              type="phone"
              placeholder={t('edit_profile.enter_phone_number')}
              keyboardType="phone-pad"
              readonly={!isEditing}
            />
          </View>

          {isEditing && (
            <View className="px-4 py-6">
              <View className="gap-3">
                <CustomButton
                  text={t('edit_profile.save_changes')}
                  onPress={handleSubmit(onSubmit)}
                />
              </View>
            </View>
          )}
        </FormProvider>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default UserProfileForm;
