export interface ZohoTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  expires_at?: number;
}

export class TokenManager {
  private static readonly STORAGE_KEY = 'zoho_tokens';
  private static readonly EXPIRES_BUFFER = 5 * 60 * 1000; // 5分のバッファ

  static saveTokens(tokens: ZohoTokens): void {
    try {
      const tokenData = {
        ...tokens,
        expires_at: tokens.expires_in 
          ? Date.now() + (tokens.expires_in * 1000)
          : undefined
      };
      
      const encryptedData = btoa(JSON.stringify(tokenData));
      localStorage.setItem(this.STORAGE_KEY, encryptedData);
    } catch (error) {
      console.error('Failed to save tokens:', error);
    }
  }

  static getTokens(): ZohoTokens | null {
    try {
      const encryptedData = localStorage.getItem(this.STORAGE_KEY);
      if (!encryptedData) return null;

      const tokenData = JSON.parse(atob(encryptedData)) as ZohoTokens;
      return tokenData;
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      this.clearTokens();
      return null;
    }
  }

  static getAccessToken(): string | null {
    const tokens = this.getTokens();
    if (!tokens || !tokens.access_token) return null;

    if (this.isTokenExpired(tokens)) {
      return null;
    }

    return tokens.access_token;
  }

  static getRefreshToken(): string | null {
    const tokens = this.getTokens();
    return tokens?.refresh_token || null;
  }

  static isTokenExpired(tokens?: ZohoTokens): boolean {
    const tokenData = tokens || this.getTokens();
    if (!tokenData || !tokenData.expires_at) return false;

    return Date.now() >= (tokenData.expires_at - this.EXPIRES_BUFFER);
  }

  static isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    return !!accessToken;
  }

  static clearTokens(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  static async refreshTokens(): Promise<ZohoTokens | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearTokens();
      return null;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const newTokens = await response.json() as ZohoTokens;
      this.saveTokens(newTokens);
      return newTokens;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return null;
    }
  }
}