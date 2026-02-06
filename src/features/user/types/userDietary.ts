export type CreateOrUpdateUserDietaryRequest = number[];

export interface CreateOrUpdateUserDietaryResponse {
  message?: string;
}

export interface UserDietary {
  dietaryPreferenceId: number;
  name: string;
  description?: string;
}
