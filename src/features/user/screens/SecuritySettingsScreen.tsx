import Header from '@components/Header';
import { Ionicons } from '@expo/vector-icons';
import { usePinStatus } from '@user/hooks/pin/usePinStatus';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const SecuritySettingsScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();
  const { hasPin, isLoading } = usePinStatus();

  const handleRemovePin = (): void => {
    Alert.alert(
      t('pin.remove_confirm_title'),
      t('pin.remove_confirm_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('pin.remove_confirm_action'),
          style: 'destructive',
          onPress: (): void => navigation.navigate('Pin', { mode: 'remove' }),
        },
      ]
    );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50"
      edges={['left', 'right', 'bottom']}
    >
      <Header
        title={t('pin.security_title')}
        onBackPress={() => navigation.goBack()}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <View className="mx-4 mt-4 overflow-hidden rounded-2xl bg-white">
          {!hasPin && (
            <SecurityRow
              icon="lock-closed-outline"
              title={t('pin.setup_action')}
              subtitle={t('pin.setup_action_subtitle')}
              onPress={() => navigation.navigate('Pin', { mode: 'setup' })}
            />
          )}

          {hasPin && (
            <>
              <SecurityRow
                icon="key-outline"
                title={t('pin.change_action')}
                subtitle={t('pin.change_action_subtitle')}
                onPress={() => navigation.navigate('Pin', { mode: 'change' })}
              />
              <View className="mx-4 h-px bg-gray-100" />
              <SecurityRow
                icon="trash-outline"
                title={t('pin.remove_action')}
                subtitle={t('pin.remove_action_subtitle')}
                onPress={handleRemovePin}
                destructive
              />
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

interface SecurityRowProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

const SecurityRow = ({
  icon,
  title,
  subtitle,
  onPress,
  destructive = false,
  disabled = false,
}: SecurityRowProps): JSX.Element => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    className="flex-row items-center gap-3 px-4 py-4 active:bg-gray-50"
  >
    <View
      className={`h-9 w-9 items-center justify-center rounded-full ${
        destructive ? 'bg-red-100' : 'bg-primary/10'
      }`}
    >
      <Ionicons
        name={icon as never}
        size={18}
        color={destructive ? '#EF4444' : '#7AB82D'}
      />
    </View>
    <View className="flex-1">
      <Text
        className={`text-base font-medium ${
          destructive ? 'text-red-500' : 'text-gray-900'
        }`}
      >
        {title}
      </Text>
      {subtitle && (
        <Text className="mt-0.5 text-sm text-gray-400">{subtitle}</Text>
      )}
    </View>
    {!destructive && (
      <Ionicons name="chevron-forward" size={18} color="#BDBDBD" />
    )}
  </Pressable>
);
