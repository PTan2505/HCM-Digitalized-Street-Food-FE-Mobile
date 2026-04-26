import type ApiClient from '@lib/api/apiClient';

const DAY_OFF_URLS = {
  list: (branchId: number): string => `/api/Branch/${branchId}/day-offs`,
  byId: (dayOffId: number): string => `/api/Branch/day-offs/${dayOffId}`,
} as const;

export interface DayOff {
  dayOffId: number;
  branchId: number;
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
}

export interface CreateDayOffRequest {
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
}

export class ManagerDayOffApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getDayOffs(branchId: number): Promise<DayOff[]> {
    const res = await this.apiClient.get<DayOff[]>({
      url: DAY_OFF_URLS.list(branchId),
    });
    return res.data;
  }

  async createDayOff(
    branchId: number,
    data: CreateDayOffRequest
  ): Promise<DayOff> {
    const res = await this.apiClient.post<DayOff, CreateDayOffRequest>({
      url: DAY_OFF_URLS.list(branchId),
      data,
    });
    return res.data;
  }

  async deleteDayOff(dayOffId: number): Promise<void> {
    await this.apiClient.delete<void>({
      url: DAY_OFF_URLS.byId(dayOffId),
    });
  }
}
