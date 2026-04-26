import lowcaLogo from '@assets/logos/lowcaLogo.svg';
import SvgIcon from '@components/SvgIcon';
import { Ionicons } from '@expo/vector-icons';
import { useUnreadNotificationCount } from '@features/notifications/hooks/useUnreadNotificationCount';
import { useNavigation } from '@react-navigation/native';
import type { JSX } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const HomeHeader = (): JSX.Element => {
  const navigation = useNavigation();
  const { unreadCount } = useUnreadNotificationCount();

  return (
    <View className="flex-row items-center justify-between px-4">
      <SvgIcon width={150} height={100} icon={lowcaLogo} />

      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={() => navigation.navigate('Map', {})}
          className="h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <Ionicons name="map-outline" size={20} color="#588d22" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Favorites')}
          className="h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <Ionicons name="heart-outline" size={20} color="#588d22" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          className="h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <Ionicons name="notifications" size={20} color="#588d22" />
          {unreadCount > 0 && (
            <View className="absolute -right-1 -top-1 h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1">
              <Text className="text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeHeader;
