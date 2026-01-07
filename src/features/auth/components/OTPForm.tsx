import useRegister from '@auth/hooks/useRegister';
import { VerifyRegistrationSchema } from '@auth/utils/registerFormSchema';
import { OtpInput } from "react-native-otp-entry";
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectRegisterEmail, selectUserStatus } from '@slices/auth';
import type { JSX } from 'react';
import { Pressable, Text, View } from 'react-native';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import type { VerifyRegistrationRequest } from '@auth/types/register';

const initialValues: VerifyRegistrationRequest = {
    username: '',
    email: '',
    password: '',
    otp: '',
}

export const OTPForm = (): JSX.Element => {
    const userStatus = useAppSelector(selectUserStatus);
    const { onVerifyRegistration } = useRegister();

    const methods = useForm<VerifyRegistrationRequest>({
        defaultValues: initialValues,
        resolver: zodResolver(VerifyRegistrationSchema),
    });

    const { control, handleSubmit } = methods;
    const onSubmit: SubmitHandler<VerifyRegistrationRequest> = async (values) => {
        await onVerifyRegistration(values);
    };

    return (
        <FormProvider {...methods}>
            <View className="w-full gap-4">
                <Pressable
                    className="bg-blue-500 rounded-lg p-3 items-center"
                    onPress={handleSubmit(onSubmit)}
                    disabled={userStatus === 'pending'}
                >
                    <Text className="text-white text-base font-medium">
                        Xác nhận
                    </Text>
                </Pressable>
            </View>
        </FormProvider>
    );
}