import React, { useEffect, useState } from 'react';
import { ZohoAuthService } from '../services/zohoAuth';
import { useAuthStore } from '../store/authStore';

export const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState<string>('認証処理中...');
  const { setTokens } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
          throw new Error(`認証エラー: ${error}`);
        }

        if (!code) {
          throw new Error('認証コードが見つかりません');
        }

        setMessage('認証コードを処理しています...');

        // 開発環境では、トークン交換をシミュレートします
        // 本番環境では実際のAPI呼び出しを行います
        const mockTokens = {
          access_token: `mock_access_token_${Date.now()}`,
          refresh_token: `mock_refresh_token_${Date.now()}`,
          expires_in: 3600,
          token_type: 'Bearer',
          scope: 'ZohoCRM.modules.ALL,ZohoCRM.settings.modules.READ,ZohoCRM.settings.fields.READ'
        };

        // トークンを保存（開発環境用のモック）
        const authService = new ZohoAuthService();
        // authService.exchangeCodeForTokens(code, state); // 本番用
        
        // 認証ストアにトークンを保存
        setTokens(mockTokens);

        setStatus('success');
        setMessage('認証が完了しました！');

        // 3秒後にメイン画面に戻る
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);

      } catch (error) {
        console.error('Callback handling error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : '認証処理でエラーが発生しました');
      }
    };

    handleCallback();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        );
      case 'success':
        return (
          <div className="text-green-500 text-6xl">✓</div>
        );
      case 'error':
        return (
          <div className="text-red-500 text-6xl">✗</div>
        );
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6 flex justify-center">
          {getStatusIcon()}
        </div>
        
        <h1 className="text-2xl font-bold mb-4">Zoho認証</h1>
        
        <p className={`text-lg mb-6 ${getStatusColor()}`}>
          {message}
        </p>

        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-700">
              認証トークンが正常に保存されました。<br />
              まもなくメイン画面に戻ります...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">
                認証処理に失敗しました。もう一度お試しください。
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              メイン画面に戻る
            </button>
          </div>
        )}

        {status === 'processing' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              しばらくお待ちください...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};