import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ManagerScheduleScreen = (): React.JSX.Element => {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Text className="title-lg">ManagerScheduleScreen</Text>
      </View>
    </SafeAreaView>
  );
};
