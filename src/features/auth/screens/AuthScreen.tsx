import authenticationBackground from '@assets/backgrounds/authenticationBackground.png';
import lowcaLogo from '@assets/logos/lowcaLogo.svg';
import { LoginForm } from '@auth/components/LoginForm';
import SvgIcon from '@components/SvgIcon';
import type { JSX } from 'react';
import { Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const AuthScreen = (): JSX.Element => {
  return (
    <SafeAreaView className="flex-1" edges={['left', 'right']}>
      <View className="relative">
        <SvgIcon
          width={150}
          height={150}
          icon={lowcaLogo}
          style={{
            marginTop: 200,
            alignSelf: 'center',
          }}
        />
        <Image
          source={authenticationBackground}
          style={{
            height: 'auto',
            width: '100%',
            aspectRatio: 393 / 627,
            position: 'absolute',
            zIndex: -1,
          }}
          resizeMode="cover"
        />
      </View>

      <View
        style={{
          marginTop: 250,
          paddingHorizontal: 16,
        }}
      >
        <LoginForm />
      </View>
    </SafeAreaView>
  );
};
