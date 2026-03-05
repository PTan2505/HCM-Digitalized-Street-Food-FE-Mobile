import UserProfileForm from '@features/user/components/userInfo/UserProfileForm';
import React, { JSX } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const EditUserInfoScreen = (): JSX.Element => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <UserProfileForm />
    </SafeAreaView>
  );
};

export default EditUserInfoScreen;
