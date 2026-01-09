import { View, Text } from 'react-native'
import type { JSX } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = (): JSX.Element => {
    return (
        <SafeAreaView edges={["top", "left", "right"]}>
            <View className="flex-1 justify-center items-center">
                <Text className="text-green-500">HomeScreen</Text>
            </View>
        </SafeAreaView>
    )
}

export default HomeScreen