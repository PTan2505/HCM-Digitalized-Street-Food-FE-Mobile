import { CustomButton } from '@components/CustomButton';
import { User } from '@custom-types/user';
import useLogin from '@features/auth/hooks/useLogin';
import { StaticScreenProps } from '@react-navigation/native';
import React, { JSX } from 'react';
import { Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectUser } from '@slices/auth';

type ProfileScreenProps = StaticScreenProps<{ user: User }>;

const ProfileScreen = ({ route }: ProfileScreenProps): JSX.Element => {
  // const { user } = route.params;
  const user = useAppSelector(selectUser);
  const { onLogout } = useLogin();

  return (
    <SafeAreaView>
      <View>
        <Text>{user?.firstName}</Text>
        <Text>{user?.lastName}</Text>
        <Image
          source={{ uri: user?.avatarUrl }}
          style={{ width: 100, height: 100 }}
        />
        <Text>{user?.email}</Text>
      </View>
      <CustomButton onPress={onLogout} text="Logout" />
    </SafeAreaView>
  );
};

export default ProfileScreen;
