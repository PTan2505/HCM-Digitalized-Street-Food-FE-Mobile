import type { JSX } from 'react';
import { Text, View } from 'react-native';

interface QuestProgressBarProps {
  progress: number;
  current: number;
  target: number;
  description: string;
}

export const QuestProgressBar = ({
  progress,
  current,
  target,
  description,
}: QuestProgressBarProps): JSX.Element => {
  const isComplete = progress >= 100;

  return (
    <View className="rounded-xl bg-gray-50 p-4">
      <Text className="mb-2 text-sm text-gray-600">{description}</Text>

      <View className="mb-1 h-3 overflow-hidden rounded-full bg-gray-200">
        <View
          className={`h-full rounded-full ${isComplete ? 'bg-green-500' : 'bg-[#a1d973]'}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-gray-400">
          {current}/{target}
        </Text>
        <Text
          className={`text-xs font-semibold ${isComplete ? 'text-green-600' : 'text-gray-500'}`}
        >
          {progress}%
        </Text>
      </View>
    </View>
  );
};
