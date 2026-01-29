import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'accessToken';

interface NewTokenData {
  newAccessToken?: string;
}

interface ITokenManagement {
  setTokens: (data: NewTokenData) => Promise<void>;
  getAccessToken: () => Promise<string>;
  clearTokens: () => Promise<void>;
}

export class TokenManagement implements ITokenManagement {
  async setTokens({ newAccessToken }: NewTokenData): Promise<void> {
    if (newAccessToken) {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
    }
  }

  async getAccessToken(): Promise<string> {
    return (await AsyncStorage.getItem(ACCESS_TOKEN_KEY)) ?? '';
  }

  async clearTokens(): Promise<void> {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

export const tokenManagement = new TokenManagement();
