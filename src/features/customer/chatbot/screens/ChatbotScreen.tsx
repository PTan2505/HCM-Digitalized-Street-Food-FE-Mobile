import Header from '@components/Header';
import { useNavigation } from '@react-navigation/native';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ChatbotScreen = (): React.JSX.Element => {
  const navigation = useNavigation();

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={['left', 'right', 'bottom']}
    >
      <Header title="AI Assistant" onBackPress={() => navigation.goBack()} />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="title-lg mb-2 text-center">Coming Soon</Text>
        <Text className="text-center text-gray-500">
          The AI chatbot feature is under development. Stay tuned!
        </Text>
      </View>
    </SafeAreaView>
  );
};
