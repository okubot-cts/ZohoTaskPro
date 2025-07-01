import { getZohoConfig } from '../types/env';
import { TokenManager, ZohoTokens } from '../utils/tokenManager';

export class ZohoAuthService {
  private config = getZohoConfig();

  generateAuthUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      scope: 'ZohoCRM.modules.ALL,ZohoCRM.settings.modules.READ,ZohoCRM.settings.fields.READ',
      redirect_uri: this.config.redirectUri,
      access_type: 'offline',
      state: this.generateState(),
    });

    return `${this.config.authUrl}?${params.toString()}`;
  }

  private generateState(): string {
    return btoa(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  }

  async exchangeCodeForTokens(code: string, state?: string): Promise<ZohoTokens> {
    try {
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          state,
          redirect_uri: this.config.redirectUri,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status}`);
      }

      const tokens = await response.json() as ZohoTokens;
      TokenManager.saveTokens(tokens);
      return tokens;
    } catch (error) {
      console.error('Token exchange error:', error);
      throw new Error('認証に失敗しました。もう一度お試しください。');
    }
  }

  async refreshTokensIfNeeded(): Promise<boolean> {
    if (!TokenManager.isAuthenticated()) {
      const tokens = TokenManager.getTokens();
      if (tokens && TokenManager.isTokenExpired(tokens)) {
        const refreshedTokens = await TokenManager.refreshTokens();
        return !!refreshedTokens;
      }
      return false;
    }
    return true;
  }

  logout(): void {
    TokenManager.clearTokens();
  }

  isAuthenticated(): boolean {
    return TokenManager.isAuthenticated();
  }

  getAccessToken(): string | null {
    return TokenManager.getAccessToken();
  }

  async validateTokens(): Promise<boolean> {
    const accessToken = this.getAccessToken();
    if (!accessToken) return false;

    try {
      const response = await fetch(`${this.config.apiUrl}/settings/modules`, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }
}