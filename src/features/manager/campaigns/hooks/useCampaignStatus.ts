export type CampaignStatusKey =
  | 'active'
  | 'registerable'
  | 'notStarted'
  | 'pendingStart'
  | 'ended'
  | 'inactive'
  | 'upcoming';

export interface CampaignStatusInput {
  isActive?: boolean | null;
  isRegisterable?: boolean | null;
  startDate?: string | null;
  endDate?: string | null;
  registrationStartDate?: string | null;
  registrationEndDate?: string | null;
}

const parseTime = (s?: string | null): number | null => {
  if (!s) return null;
  const t = new Date(s).getTime();
  return isNaN(t) ? null : t;
};

/**
 * Returns the campaign's effective status. Falls back to a 3-state model
 * (upcoming / active / ended) when registration dates are absent (vendor-owned
 * campaigns) and uses the 5-state model for system campaigns.
 */
export const computeCampaignStatus = (
  input: CampaignStatusInput
): CampaignStatusKey => {
  const now = Date.now();
  const start = parseTime(input.startDate);
  const end = parseTime(input.endDate);
  const regStart = parseTime(input.registrationStartDate);
  const regEnd = parseTime(input.registrationEndDate);

  const hasRegistration = regStart !== null && regEnd !== null;

  if (input.isRegisterable === true) return 'registerable';

  if (start !== null && end !== null) {
    if (now >= start && now <= end) return 'active';
    if (now > end) return 'ended';
  }

  if (hasRegistration && regStart !== null && regEnd !== null) {
    if (now < regStart) return 'notStarted';
    if (now > regEnd && start !== null && now < start) return 'pendingStart';
  }

  if (start !== null && now < start) return 'upcoming';

  if (input.isActive === false) return 'inactive';

  return 'active';
};
