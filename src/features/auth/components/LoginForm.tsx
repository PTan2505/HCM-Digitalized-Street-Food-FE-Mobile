import type { LoginWithPhoneNumberRequest } from '@auth/types/login';
import { getLoginWithPhoneNumberSchema } from '@auth/utils/loginFormSchema';
import { CustomButton } from '@components/CustomButton';
import { CustomInput } from '@components/CustomInput';
import { APIErrorResponse } from '@custom-types/apiResponse';
import { FontAwesome6 } from '@expo/vector-icons';
import useLogin from '@features/auth/hooks/useLogin';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectUserStatus } from '@slices/auth';
import { RefObject, useMemo, type JSX } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

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

  const schema = useMemo(() => getLoginWithPhoneNumberSchema(t), [t]);
  const methods = useForm<LoginWithPhoneNumberRequest>({
    defaultValues: initialValues,
    resolver: zodResolver(schema),
  });

  const { handleSubmit, control, setError } = methods;

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
    } catch (error: unknown) {
      const apiError = error as APIErrorResponse;
      console.error('Phone number login failed:', error);
      if (apiError?.status === 404) {
        setError('phoneNumber', { type: 'manual', message: apiError.message });
      } else if (apiError?.status === 400) {
        setError('phoneNumber', {
          type: 'manual',
          message: t('auth.phone_not_verified'),
        });
      }
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
