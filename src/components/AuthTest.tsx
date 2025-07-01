import React, { useState, useEffect } from 'react';
import { getZohoConfig } from '../types/env';
import { ZohoAuthService } from '../services/zohoAuth';
import { TokenManager } from '../utils/tokenManager';
import { testConnection, fetchTasks, fetchDeals, fetchUsers } from '../services/api';

export const AuthTest: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [authService, setAuthService] = useState<ZohoAuthService | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tokens, setTokens] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiTestResults, setApiTestResults] = useState<any>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);

  useEffect(() => {
    try {
      const zohoConfig = getZohoConfig();
      setConfig(zohoConfig);
      
      const service = new ZohoAuthService();
      setAuthService(service);
      
      const authenticated = service.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      const currentTokens = TokenManager.getTokens();
      setTokens(currentTokens);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const handleLogin = () => {
    if (authService) {
      const authUrl = authService.generateAuthUrl();
      window.open(authUrl, '_blank');
    }
  };

  const handleLogout = () => {
    if (authService) {
      authService.logout();
      setIsAuthenticated(false);
      setTokens(null);
    }
  };

  const handleTokenRefresh = async () => {
    try {
      const refreshedTokens = await TokenManager.refreshTokens();
      if (refreshedTokens) {
        setTokens(refreshedTokens);
        setIsAuthenticated(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Token refresh failed');
    }
  };

  const handleApiTest = async () => {
    setIsTestingApi(true);
    setApiTestResults(null);
    
    try {
      const results = {
        connection: false,
        tasks: { count: 0, error: null },
        deals: { count: 0, error: null },
        users: { count: 0, error: null },
      };

      // Test connection
      results.connection = await testConnection();

      if (results.connection) {
        // Test tasks
        try {
          const tasks = await fetchTasks();
          results.tasks.count = tasks.length;
        } catch (err) {
          results.tasks.error = err instanceof Error ? err.message : 'Failed to fetch tasks';
        }

        // Test deals
        try {
          const deals = await fetchDeals();
          results.deals.count = deals.length;
        } catch (err) {
          results.deals.error = err instanceof Error ? err.message : 'Failed to fetch deals';
        }

        // Test users
        try {
          const users = await fetchUsers();
          results.users.count = users.length;
        } catch (err) {
          results.users.error = err instanceof Error ? err.message : 'Failed to fetch users';
        }
      }

      setApiTestResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API test failed');
    } finally {
      setIsTestingApi(false);
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">認証テストエラー</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Zoho認証テスト</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">環境設定</h3>
          <div className="bg-gray-50 p-3 rounded text-sm">
            <p><strong>Client ID:</strong> {config?.clientId ? `${config.clientId.substring(0, 20)}...` : 'Not loaded'}</p>
            <p><strong>Redirect URI:</strong> {config?.redirectUri || 'Not loaded'}</p>
            <p><strong>Auth URL:</strong> {config?.authUrl || 'Not loaded'}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">認証状態</h3>
          <div className="bg-gray-50 p-3 rounded text-sm">
            <p><strong>認証済み:</strong> {isAuthenticated ? '✅ はい' : '❌ いいえ'}</p>
            <p><strong>アクセストークン:</strong> {tokens?.access_token ? `${tokens.access_token.substring(0, 20)}...` : 'なし'}</p>
            <p><strong>リフレッシュトークン:</strong> {tokens?.refresh_token ? `${tokens.refresh_token.substring(0, 20)}...` : 'なし'}</p>
            <p><strong>有効期限:</strong> {tokens?.expires_at ? new Date(tokens.expires_at).toLocaleString() : 'なし'}</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={!authService}
          >
            Zohoログイン
          </button>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            disabled={!authService || !isAuthenticated}
          >
            ログアウト
          </button>
          
          <button
            onClick={handleTokenRefresh}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={!authService || !tokens?.refresh_token}
          >
            トークン更新
          </button>
          
          <button
            onClick={handleApiTest}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            disabled={!authService || !isAuthenticated || isTestingApi}
          >
            {isTestingApi ? 'API テスト中...' : 'API テスト'}
          </button>
        </div>

        {apiTestResults && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">API テスト結果</h3>
            <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
              <div className="flex items-center">
                <span className="font-medium w-20">接続:</span>
                <span className={apiTestResults.connection ? 'text-green-600' : 'text-red-600'}>
                  {apiTestResults.connection ? '✅ 成功' : '❌ 失敗'}
                </span>
              </div>
              
              <div className="flex items-center">
                <span className="font-medium w-20">タスク:</span>
                <span className={apiTestResults.tasks.error ? 'text-red-600' : 'text-green-600'}>
                  {apiTestResults.tasks.error ? `❌ ${apiTestResults.tasks.error}` : `✅ ${apiTestResults.tasks.count}件取得`}
                </span>
              </div>
              
              <div className="flex items-center">
                <span className="font-medium w-20">取引先:</span>
                <span className={apiTestResults.deals.error ? 'text-red-600' : 'text-green-600'}>
                  {apiTestResults.deals.error ? `❌ ${apiTestResults.deals.error}` : `✅ ${apiTestResults.deals.count}件取得`}
                </span>
              </div>
              
              <div className="flex items-center">
                <span className="font-medium w-20">ユーザー:</span>
                <span className={apiTestResults.users.error ? 'text-red-600' : 'text-green-600'}>
                  {apiTestResults.users.error ? `❌ ${apiTestResults.users.error}` : `✅ ${apiTestResults.users.count}件取得`}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>注意:</strong> 現在は開発環境のため、実際のZoho認証は完全には動作しません。
            バックエンドAPIエンドポイント（/api/auth/*）の実装が必要です。
          </p>
        </div>
      </div>
    </div>
  );
};