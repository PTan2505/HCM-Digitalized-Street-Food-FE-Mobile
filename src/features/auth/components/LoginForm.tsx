import useLogin from '@auth/hooks/useLogin';
import { LoginSchema } from '@auth/utils/loginFormSchema';
import { CustomInput } from '@components/CustomInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectUserStatus } from '@slices/auth';
import type { JSX } from 'react';
import { Pressable, Text, View } from 'react-native';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import type { LoginRequest } from '@auth/types/login';

const initialValues: LoginRequest = {
    email: '',
    password: '',
}

export const LoginForm = (): JSX.Element => {
    const userStatus = useAppSelector(selectUserStatus);
    const { onLoginSubmit } = useLogin();

    const methods = useForm<LoginRequest>({
        defaultValues: initialValues,
        resolver: zodResolver(LoginSchema),
    });

    const { control, handleSubmit } = methods;
    const onSubmit: SubmitHandler<LoginRequest> = async (values) => {
        await onLoginSubmit(values);
    };

    return (
        <FormProvider {...methods}>
            <View className="w-full gap-4">
                <CustomInput
                    name="email"
                    control={control}
                    label="Email"
                    placeholder="Nhập email"
                    type="email"
                    required
                />
                <CustomInput
                    name="password"
                    control={control}
                    label="Mật khẩu"
                    placeholder="Nhập mật khẩu"
                    type="password"
                    required
                />

                <Pressable
                    onPress={handleSubmit(onSubmit)}
                    disabled={userStatus === 'pending'}
                    accessibilityRole="button"
                    className={
                        'w-full items-center justify-center rounded-md px-4 py-3 ' +
                        (userStatus === 'pending' ? 'opacity-60' : '')
                    }
                >
                    <Text className="title-medium text-primary-900">
                        {userStatus === 'pending' ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Text>
                </Pressable>
            </View>
        </FormProvider>
    );
}