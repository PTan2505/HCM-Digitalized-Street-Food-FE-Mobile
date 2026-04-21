import UserProfileForm from '@features/user/components/userInfo/UserProfileForm';
import { StaticScreenProps } from '@react-navigation/native';
import React, { JSX } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

type EditUserInfoScreenProps = StaticScreenProps<{
  initialSetup?: boolean;
}>;

export const EditUserInfoScreen = ({
  route,
}: EditUserInfoScreenProps): JSX.Element => {
  const { initialSetup } = route.params;

  return (
    <SafeAreaView
      className="bg-white"
      edges={['left', 'right', 'bottom']}
      style={{ flex: 1 }}
    >
      <UserProfileForm initialSetup={initialSetup} />
    </SafeAreaView>
  );
};
