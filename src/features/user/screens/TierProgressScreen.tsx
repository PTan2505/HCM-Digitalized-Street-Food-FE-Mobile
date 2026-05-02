import DiamondIcon from '@assets/icons/diamond-icon.svg';
import GoldIcon from '@assets/icons/gold-icon.svg';
import SilverIcon from '@assets/icons/silver-icon.svg';
import Header from '@components/Header';
import SvgIcon from '@components/SvgIcon';
import { COLORS } from '@constants/colors';
import { QuestRewardBadge } from '@features/customer/quests/components/QuestRewardBadge';
import type { QuestTaskRewardItem } from '@features/customer/quests/types/quest';
import { XPProgressBar } from '@features/user/components/profile/XPProgressBar';
import { useTierUpRewards } from '@features/user/hooks/profile/useTierUpRewards';
import { useAppSelector } from '@hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { selectUser } from '@slices/auth';
import React, { FC, JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgProps } from 'react-native-svg';

const GOLD_MIN_XP = 3000;
const DIAMOND_MIN_XP = 10000;

const TIER_SILVER = 2;

interface TierStep {
  tierId: number;
  labelKey: string;
  descKey: string;
  color: string;
  minXP: number;
  svg: FC<SvgProps>;
  nextMinXP: number | null;
  nextLabelKey: string | null;
}

const TIER_STEPS: TierStep[] = [
  {
    tierId: 2,
    labelKey: 'profile.tier_silver',
    descKey: 'profile.tier_silver_desc',
    color: '#A8A8A8',
    minXP: 0,
    svg: SilverIcon,
    nextMinXP: GOLD_MIN_XP,
    nextLabelKey: 'profile.tier_gold',
  },
  {
    tierId: 3,
    labelKey: 'profile.tier_gold',
    descKey: 'profile.tier_gold_desc',
    color: '#F5A623',
    minXP: GOLD_MIN_XP,
    svg: GoldIcon,
    nextMinXP: DIAMOND_MIN_XP,
    nextLabelKey: 'profile.tier_diamond',
  },
  {
    tierId: 4,
    labelKey: 'profile.tier_diamond',
    descKey: 'profile.tier_diamond_desc',
    color: '#7B61FF',
    minXP: DIAMOND_MIN_XP,
    svg: DiamondIcon,
    nextMinXP: null,
    nextLabelKey: null,
  },
];

type StepState = 'completed' | 'current' | 'locked';

function getStepState(stepTierId: number, currentTierId: number): StepState {
  if (currentTierId > stepTierId) return 'completed';
  if (currentTierId === stepTierId) return 'current';
  return 'locked';
}

interface TierNodeProps {
  step: TierStep;
  state: StepState;
  currentXP: number;
  isLast: boolean;
  rewards: QuestTaskRewardItem[];
}

const TierNode = ({
  step,
  state,
  currentXP,
  isLast,
  rewards,
}: TierNodeProps): JSX.Element => {
  const { t } = useTranslation();

  const isCompleted = state === 'completed';
  const isCurrent = state === 'current';
  const isLocked = state === 'locked';

  const lineColor = isCompleted ? COLORS.primary : '#E5E7EB';
  const iconBg = isLocked ? '#F3F4F6' : step.color + '22';
  const iconBorder = isLocked ? '#D1D5DB' : step.color;

  const xpRemaining =
    isCurrent && step.nextMinXP != null
      ? Math.max(step.nextMinXP - currentXP, 0)
      : 0;

  return (
    <View className="flex-row">
      {/* Left: icon + connector line */}
      <View className="mr-4 w-11 items-center">
        <View
          className="h-11 w-11 items-center justify-center rounded-full border-2"
          style={{ backgroundColor: iconBg, borderColor: iconBorder }}
        >
          <SvgIcon icon={step.svg} width={24} height={24} />
        </View>

        {!isLast && (
          <View
            style={{
              flex: 1,
              width: 2,
              backgroundColor: lineColor,
              minHeight: 64,
            }}
          />
        )}
      </View>

      {/* Right: content */}
      <View className="flex-1 pb-2 pt-1">
        {/* Tier label + status badge */}
        <View className="flex-row items-center gap-2">
          <Text
            className="text-base font-bold"
            style={{ color: isLocked ? '#9CA3AF' : '#111827' }}
          >
            {t(step.labelKey)}
          </Text>

          {isCompleted && (
            <View
              className="rounded-full px-2 py-0.5"
              style={{ backgroundColor: COLORS.primary + '22' }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: COLORS.primaryDark }}
              >
                {t('profile.tier_reached')}
              </Text>
            </View>
          )}
          {isCurrent && (
            <View
              className="rounded-full px-2 py-0.5"
              style={{ backgroundColor: step.color + '22' }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: step.color }}
              >
                {t('profile.tier_current')}
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        <Text
          className="mt-0.5 text-sm"
          style={{ color: isLocked ? '#D1D5DB' : '#6B7280' }}
        >
          {t(step.descKey)}
        </Text>

        {/* XP threshold */}
        <Text
          className="mt-1 text-xs font-semibold"
          style={{ color: isLocked ? '#D1D5DB' : step.color }}
        >
          {step.minXP === 0 ? '0 XP' : `${step.minXP.toLocaleString()} XP`}
        </Text>

        {/* Rewards — only shown if this tier has any */}
        {rewards.length > 0 && (
          <View className="mt-2">
            <QuestRewardBadge
              rewards={rewards}
              claimed={isCompleted || isCurrent}
            />
          </View>
        )}

        {/* Connector info block — shown between current/completed tier and the next */}
        {!isLast && (
          <View
            className="mb-2 mt-3 rounded-2xl px-4 py-3"
            style={{ backgroundColor: isLocked ? '#FAFAFA' : '#F3F4F6' }}
          >
            {step.nextMinXP != null && step.nextLabelKey != null && (
              <Text
                className="text-sm"
                style={{ color: isLocked ? '#D1D5DB' : '#6B7280' }}
              >
                {t(
                  step.tierId === 2
                    ? 'profile.xp_to_gold'
                    : 'profile.xp_to_diamond',
                  { xp: step.nextMinXP.toLocaleString() }
                )}
              </Text>
            )}

            {isCurrent && step.nextMinXP != null && xpRemaining > 0 && (
              <View className="mt-2 self-start rounded-full bg-gray-200 px-3 py-0.5">
                <Text className="text-xs font-semibold text-gray-600">
                  {t('profile.xp_remaining', {
                    xp: xpRemaining.toLocaleString(),
                  })}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Max tier message */}
        {isLast && isCurrent && (
          <View className="mt-3 rounded-2xl bg-gray-50 px-4 py-3">
            <Text className="text-sm font-semibold text-gray-600">
              {t('profile.max_tier')} 🎉
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export const TierProgressScreen = (): JSX.Element => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();
  const user = useAppSelector(selectUser);

  const currentTierId = user?.tierId ?? TIER_SILVER;
  const currentXP = user?.xp ?? 0;

  const { rewardsByTierId } = useTierUpRewards();

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      <Header
        title={t('profile.tier_progress_title')}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <XPProgressBar xp={currentXP} tierId={currentTierId} />

        <Text className="mx-4 mb-6 mt-3 text-sm text-gray-500">
          {t('profile.tier_progress_subtitle')}
        </Text>

        <View className="mx-4">
          {TIER_STEPS.map((step, index) => (
            <TierNode
              key={step.tierId}
              step={step}
              state={getStepState(step.tierId, currentTierId)}
              currentXP={currentXP}
              isLast={index === TIER_STEPS.length - 1}
              rewards={rewardsByTierId[step.tierId] ?? []}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
