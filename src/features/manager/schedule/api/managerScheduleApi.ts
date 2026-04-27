import type ApiClient from '@lib/api/apiClient';
import { apiUrl } from '@lib/api/apiUrl';

export interface WorkSchedule {
  workScheduleId: number;
  branchId: number;
  weekday: number;
  weekdayName: string;
  openTime: string; // "HH:mm:ss" from API
  closeTime: string; // "HH:mm:ss" from API
}

export class ManagerScheduleApi {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getWorkSchedules(branchId: number): Promise<WorkSchedule[]> {
    const res = await this.apiClient.get<WorkSchedule[]>({
      url: apiUrl.branch.workSchedules(branchId),
    });
    return res.data;
  }

  async createWorkSchedule(
    branchId: number,
    data: { weekdays: number[]; openTime: string; closeTime: string }
  ): Promise<void> {
    await this.apiClient.post<void, typeof data>({
      url: apiUrl.branch.workSchedules(branchId),
      data,
    });
  }

  async updateWorkSchedule(
    scheduleId: number,
    data: { weekday: number; openTime: string; closeTime: string }
  ): Promise<void> {
    await this.apiClient.put<void, typeof data>({
      url: apiUrl.branch.workScheduleById(scheduleId),
      data,
    });
  }

  async deleteWorkSchedule(scheduleId: number): Promise<void> {
    await this.apiClient.delete<void>({
      url: apiUrl.branch.workScheduleById(scheduleId),
    });
  }
}
