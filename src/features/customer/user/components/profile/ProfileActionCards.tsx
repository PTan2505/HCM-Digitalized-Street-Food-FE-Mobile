import { COLORS } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { ProfileActionCard } from '@features/customer/user/types/profileConfig';
import React, { JSX } from 'react';
import { Pressable, Text, View } from 'react-native';

interface ProfileActionCardsProps {
  cards: ProfileActionCard[];
}

export const ProfileActionCards = ({
  cards,
}: ProfileActionCardsProps): JSX.Element => {
  return (
    <View className="flex-row gap-3">
      {cards.map((card) => (
        <Pressable
          key={card.id}
          onPress={card.onPress}
          className="flex-1 rounded-2xl p-4"
          style={{
            backgroundColor: card.backgroundColor ?? '#F5F5F5',
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="mb-1 text-base font-semibold text-gray-900">
                {card.title}
              </Text>
              {card.subtitle && (
                <Text className="text-sm text-gray-600" numberOfLines={1}>
                  {card.subtitle}
                </Text>
              )}
            </View>
            {card.icon && (
              <Ionicons
                name={card.icon as keyof typeof Ionicons.glyphMap}
                size={24}
                color={COLORS.primary}
              />
            )}
          </View>
        </Pressable>
      ))}
    </View>
  );
};
