import BlankAvatar from '@assets/avatar/blankAvatar.png';
import { CustomButton } from '@components/CustomButton';
import { CustomInput } from '@components/CustomInput';
import Header from '@components/Header';
import { APIErrorResponse } from '@custom-types/apiResponse';
import { User } from '@custom-types/user';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import useLogin from '@features/auth/hooks/useLogin';
import { getUpdateProfileSchema } from '@features/auth/utils/updateUserProfileSchema';
import { ContactVerificationOTPModal } from '@features/user/components/profile/ContactVerificationOTPModal';
import { useAvatarPicker } from '@features/user/hooks/profile/useAvatarPicker';
import { useContactVerification } from '@features/user/hooks/profile/useContactVerification';
import useProfile from '@features/user/hooks/profile/useProfile';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import { selectUser } from '@slices/auth';
import getHighResAvatar from '@utils/getHighResAvatar';
import { JSX, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

const VerifiedBadge = (): JSX.Element => (
  <MaterialCommunityIcons name="check-circle" size={18} color="#4CAF50" />
);

const UserProfileForm = ({
  initialSetup,
}: {
  initialSetup?: boolean;
}): JSX.Element => {
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  const navigation = useNavigation();
  const isFirstScreen = !navigation.canGoBack();
  const { updateUserProfile } = useProfile();
  const { avatarUri, isUploading, pickAvatar } = useAvatarPicker();
  const { onLogout } = useLogin();
  const {
    isStarting,
    isVerifying,
    isOTPVisible,
    channels,
    error: verifyError,
    startVerification,
    submitOtp,
    dismissOTP,
  } = useContactVerification();

  const emailVerified = user?.emailVerified === true;
  const phoneVerified = user?.phoneNumberVerified === true;

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

  const {
    handleSubmit,
    setError,
    reset,
    formState: { isDirty },
  } = methods;

  const onSubmit = async (data: Partial<User>): Promise<void> => {
    try {
      await updateUserProfile(data);
      reset(data);
      if (initialSetup) {
        navigation.navigate('DietaryPreferences');
      }
    } catch (error) {
      const err = error as APIErrorResponse;
      if (err.fieldErrors) {
        const errorKeys = Object.keys(err.fieldErrors);
        errorKeys.forEach((key) => {
          setError(key as keyof Partial<User>, {
            type: 'server',
            message: err.fieldErrors![key].join(', '),
          });
        });
      } else if (err.message) {
        // Handle flat 400 errors like "Số điện thoại đã tồn tại"
        if (
          err.message.toLowerCase().includes('điện thoại') ||
          err.message.toLowerCase().includes('phone')
        ) {
          setError('phoneNumber', { type: 'server', message: err.message });
        } else if (err.message.toLowerCase().includes('email')) {
          setError('email', { type: 'server', message: err.message });
        }
      }
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Header
          title={
            isFirstScreen
              ? t('profile.update_profile')
              : t('profile.edit_profile')
          }
          onBackPress={
            isFirstScreen ? onLogout : (): void => navigation.goBack()
          }
        />
        <ScrollView className="flex-1">
          <View className="items-center py-6">
            <Pressable
              className="relative"
              onPress={pickAvatar}
              disabled={isUploading}
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
              {isUploading ? (
                <View className="absolute inset-0 h-[128] w-[128] items-center justify-center rounded-[64] bg-black/40">
                  <ActivityIndicator color="white" />
                </View>
              ) : (
                <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <Ionicons name="camera-outline" size={16} color="black" />
                </View>
              )}
            </Pressable>
          </View>

          <FormProvider {...methods}>
            <View className="flex gap-8 px-4">
              <CustomInput<Partial<User>>
                name="username"
                label={t('edit_profile.username')}
                type="username"
                placeholder={t('edit_profile.enter_username')}
                required
              />

              <CustomInput<Partial<User>>
                name="email"
                label={t('edit_profile.email')}
                type="email"
                placeholder={t('edit_profile.enter_email')}
                keyboardType="email-address"
                readonly={emailVerified}
                labelBadge={
                  emailVerified ? (
                    <VerifiedBadge />
                  ) : (
                    <Text className="text-xs font-semibold text-red-500">
                      {t('verify.unverified', 'Chưa xác thực')}
                    </Text>
                  )
                }
                rightElement={
                  !emailVerified && user?.email && !isDirty ? (
                    <Pressable
                      onPress={startVerification}
                      disabled={isStarting}
                      hitSlop={8}
                    >
                      <Text className="text-sm font-semibold text-primary">
                        {isStarting
                          ? t('verify.sending')
                          : t('verify.verify_button')}
                      </Text>
                    </Pressable>
                  ) : undefined
                }
              />

              <CustomInput<Partial<User>>
                name="firstName"
                label={t('edit_profile.first_name')}
                type="name"
                placeholder={t('edit_profile.enter_first_name')}
                required
              />

              <CustomInput<Partial<User>>
                name="lastName"
                label={t('edit_profile.last_name')}
                type="name"
                placeholder={t('edit_profile.enter_last_name')}
                required
              />

              <CustomInput<Partial<User>>
                name="phoneNumber"
                label={t('edit_profile.phone_number')}
                type="phone"
                placeholder={t('edit_profile.enter_phone_number')}
                keyboardType="phone-pad"
                readonly={phoneVerified}
                labelBadge={
                  phoneVerified ? (
                    <VerifiedBadge />
                  ) : (
                    <Text className="text-xs font-semibold text-red-500">
                      {t('verify.unverified', 'Chưa xác thực')}
                    </Text>
                  )
                }
                rightElement={
                  !phoneVerified && user?.phoneNumber && !isDirty ? (
                    <Pressable
                      onPress={startVerification}
                      disabled={isStarting}
                      hitSlop={8}
                    >
                      <Text className="text-sm font-semibold text-primary">
                        {isStarting
                          ? t('verify.sending')
                          : t('verify.verify_button')}
                      </Text>
                    </Pressable>
                  ) : undefined
                }
              />
            </View>

            <View className="px-4 py-6">
              <View className="gap-3">
                <CustomButton
                  text={t('edit_profile.save_changes')}
                  onPress={handleSubmit(onSubmit)}
                  disabled={!isDirty}
                />
              </View>
            </View>
          </FormProvider>
        </ScrollView>
      </KeyboardAvoidingView>

      <ContactVerificationOTPModal
        visible={isOTPVisible}
        channels={channels}
        isLoading={isVerifying}
        isResending={isStarting}
        error={verifyError}
        onSubmit={submitOtp}
        onResend={startVerification}
        onDismiss={dismissOTP}
      />
    </>
  );
};

export default UserProfileForm;
