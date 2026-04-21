import UserProfileForm from '@features/user/components/userInfo/UserProfileForm';
import React, { JSX } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export const EditUserInfoScreen = (): JSX.Element => {
  return (
    <SafeAreaView
      className="bg-white"
      edges={['left', 'right', 'bottom']}
      style={{ flex: 1 }}
    >
      <UserProfileForm />
    </SafeAreaView>
  );
};
