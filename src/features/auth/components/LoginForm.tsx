import type { LoginWithPhoneNumberRequest } from '@auth/types/login';
import { LoginWithPhoneNumberSchema } from '@auth/utils/loginFormSchema';
import { CustomInput } from '@components/CustomInput';
import { FontAwesome6 } from '@expo/vector-icons';
import { CustomButton } from '@features/auth/components/CustomButton';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectUserStatus } from '@slices/auth';
import { type JSX } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';

const initialValues: LoginWithPhoneNumberRequest = {
  phoneNumber: '',
};

interface LoginFormProps {
  onBack: () => void;
}

export const LoginForm = ({ onBack }: LoginFormProps): JSX.Element => {
  const userStatus = useAppSelector(selectUserStatus);

  const methods = useForm<LoginWithPhoneNumberRequest>({
    defaultValues: initialValues,
    resolver: zodResolver(LoginWithPhoneNumberSchema),
  });

  const { handleSubmit } = methods;

  const onSubmit = (data: LoginWithPhoneNumberRequest): void => {
    // Phone number is already cleaned by the schema transform
    console.log(data);
    // TODO: Call your login API here
  };

  return (
    <FormProvider {...methods}>
      <View className="w-full gap-4 px-5">
        <Pressable
          onPress={onBack}
          className="mb-2 w-[100px] flex-row items-center gap-2 active:opacity-50"
        >
          <FontAwesome6 name="arrow-left" size={20} color="#000" />
          <Text className="text-base font-semibold">Quay lại</Text>
        </Pressable>

        <CustomInput
          name="phoneNumber"
          label="Số điện thoại"
          placeholder="Nhập số điện thoại"
          type="phone"
          autoFocus
          required
        />
        <CustomButton text="Đăng nhập" onPress={handleSubmit(onSubmit)} />
      </View>
    </FormProvider>
  );
};
