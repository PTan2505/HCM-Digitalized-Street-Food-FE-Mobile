import { axiosApi } from '@lib/api/apiInstance';
import type { Setting } from '@lib/api/settingsApi';
import { queryKeys } from '@lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

const parseSettingsMap = (items: Setting[]): Record<string, number> => {
  const map: Record<string, number> = {};
  for (const item of items) {
    const parsed = parseFloat(item.value);
    if (!isNaN(parsed)) map[item.name] = parsed;
  }
  return map;
};

export const useSettings = (): {
  settings: Record<string, number>;
  isLoading: boolean;
  isError: boolean;
} => {
  const {
    data: settings = {},
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.settings.all,
    queryFn: async () =>
      parseSettingsMap(await axiosApi.settingsApi.getSettings()),
    staleTime: 10 * 60 * 1000,
  });

  return { settings, isLoading, isError };
};

export const useOrderXP = (): number => {
  const { settings } = useSettings();
  return settings['orderXP'] ?? 50;
};

export const useFeedbackXP = (): number => {
  const { settings } = useSettings();
  return settings['feedbackXP'] ?? 20;
};

export const useGhostPinXP = (): number => {
  const { settings } = useSettings();
  return settings['ghostpinXP'] ?? 100;
};
