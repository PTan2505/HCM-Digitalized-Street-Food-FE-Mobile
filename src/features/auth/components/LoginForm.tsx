import type { LoginWithPhoneNumberRequest } from '@auth/types/login';
import { LoginWithPhoneNumberSchema } from '@auth/utils/loginFormSchema';
import { CustomButton } from '@components/CustomButton';
import { CustomInput } from '@components/CustomInput';
import { FontAwesome6 } from '@expo/vector-icons';
import useLogin from '@features/auth/hooks/useLogin';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectUserStatus } from '@slices/auth';
import { RefObject, type JSX } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

const initialValues: LoginWithPhoneNumberRequest = {
  phoneNumber: '',
};

interface LoginFormProps {
  setIsSendedOTP: (value: boolean) => void;
  phoneNumberRef: RefObject<string>;
  onBack: () => void;
}

export const LoginForm = ({
  setIsSendedOTP,
  phoneNumberRef,
  onBack,
}: LoginFormProps): JSX.Element => {
  const { t } = useTranslation();
  const userStatus = useAppSelector(selectUserStatus);
  const { onPhoneNumberLoginSubmit } = useLogin();

  const methods = useForm<LoginWithPhoneNumberRequest>({
    defaultValues: initialValues,
    resolver: zodResolver(LoginWithPhoneNumberSchema),
  });

  const { handleSubmit, control } = methods;

  const watchedValue = useWatch({
    name: 'phoneNumber',
    control,
    compute: (data: string) => {
      return data.length ? data : '';
    },
  });

  const onSubmit = async (data: LoginWithPhoneNumberRequest): Promise<void> => {
    try {
      phoneNumberRef.current = data.phoneNumber;
      console.log('Calling onPhoneNumberLoginSubmit with:', data);
      await onPhoneNumberLoginSubmit(data);
      console.log('API call successful, setting isSendedOTP to true');
      setIsSendedOTP(true);
    } catch (error) {
      console.error('Phone number login failed:', error);
      setIsSendedOTP(false);
    }
  };

  // const onSubmit = (data: LoginWithPhoneNumberRequest): void => {
  //   // Phone number is already cleaned by the schema transform
  //   setIsSendedOTP(true);
  //   phoneNumberRef.current = data.phoneNumber;
  //   console.log(data);
  //   // TODO: Call your login API here
  // };

  return (
    <FormProvider {...methods}>
      <View className="w-full gap-4 px-5">
        <Pressable
          onPress={onBack}
          className="mb-2 w-[100px] flex-row items-center gap-2 active:opacity-50"
        >
          <FontAwesome6 name="arrow-left" size={20} color="#000" />
          <Text className="text-base font-semibold">{t('auth.back')}</Text>
        </Pressable>

        <CustomInput
          name="phoneNumber"
          label={t('auth.phone_number')}
          placeholder={t('auth.enter_phone_number')}
          type="phone"
          autoFocus
          required
        />
        <CustomButton
          text={t('auth.login')}
          onPress={handleSubmit(onSubmit)}
          disabled={watchedValue.length === 0 || userStatus === 'pending'}
        />
      </View>
    </FormProvider>
  );
};
