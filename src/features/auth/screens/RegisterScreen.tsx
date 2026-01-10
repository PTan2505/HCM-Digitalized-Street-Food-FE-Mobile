import { RegisterForm } from '@auth/components/RegisterForm';
import { Title } from '@auth/components/Title';
import { HaveAccountText } from '@auth/components/HaveAccountText';
import type { JSX } from 'react';
import { ScrollView, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import authenticationBackground from '@assets/backgrounds/authenticationBackground.png';

export const RegisterScreen = (): JSX.Element => {
  return (
    <SafeAreaView className="flex-1" edges={['left', 'right']}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="relative h-[321px] w-full overflow-hidden">
          <Image
            source={authenticationBackground}
            className="absolute top-[-266px] h-auto w-full"
            resizeMode="cover"
          />
        </View>

        <View
          className="mt-[-5px]"
          style={{
            paddingHorizontal: 16,
          }}
        >
          <Title title="Đăng ký" />
          <RegisterForm />
          <HaveAccountText
            text="Bạn đã có tài khoản?"
            linkText="Đăng nhập"
            navigateTo="Login"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
