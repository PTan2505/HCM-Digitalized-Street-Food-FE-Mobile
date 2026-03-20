import lowcaLogo from '@assets/logos/lowcaLogo.svg';
import SvgIcon from '@components/SvgIcon';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { JSX } from 'react';
import { TouchableOpacity, View } from 'react-native';
import LanguageButton from './LanguageButton';

const HomeHeader = (): JSX.Element => {
  const navigation = useNavigation();
  return (
    <View className="flex-row items-center justify-between px-4 pb-6 pt-4">
      {/* <Text className="title-xl text-gray-900">Lowca</Text> */}
      <SvgIcon width={100} height={100} icon={lowcaLogo} />

      <View className="flex-row gap-3">
        <LanguageButton />

        <TouchableOpacity
          onPress={() => navigation.navigate('Map')}
          className="h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <Ionicons name="map-outline" size={20} color="#588d22" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('CurrentPicks')}
          className="h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <Ionicons name="bookmark-outline" size={20} color="#588d22" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeHeader;
