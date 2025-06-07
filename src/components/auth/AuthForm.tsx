import { useState } from 'react';
import { KeyRound, Building2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { testConnection } from '../../services/api';
import { Button } from '../common/Button';

export const AuthForm: React.FC = () => {
  const { auth, setApiKey, setOrganizationId, setConnected } = useAuthStore();
  const [apiKey, setApiKeyLocal] = useState(auth.apiKey);
  const [orgId, setOrgIdLocal] = useState(auth.organizationId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!apiKey.trim()) {
        throw new Error('API Key is required');
      }
      
      if (!orgId.trim()) {
        throw new Error('Organization ID is required');
      }

      setApiKey(apiKey);
      setOrganizationId(orgId);

      const isConnected = await testConnection({ apiKey, organizationId: orgId, isConnected: false });
      
      if (isConnected) {
        setConnected(true);
      } else {
        throw new Error('Connection test failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <div className="bg-primary-100 p-3 rounded-full">
              <KeyRound className="h-8 w-8 text-primary-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Connect to Zoho CRM</h1>
          <p className="text-gray-600 mt-2">Enter your API credentials to get started</p>
        </div>

        {error && (
          <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKeyLocal(e.target.value)}
                className="pl-10 w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Enter your Zoho API Key"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Find this in your Zoho CRM Developer Console
            </p>
          </div>

          <div>
            <label htmlFor="orgId" className="block text-sm font-medium text-gray-700 mb-1">
              Organization ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="orgId"
                type="text"
                value={orgId}
                onChange={(e) => setOrgIdLocal(e.target.value)}
                className="pl-10 w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Enter your Organization ID"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              fullWidth 
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Connecting...' : 'Connect to Zoho CRM'}
            </Button>
          </div>
        </form>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Need help? <a href="#" className="text-primary-600 hover:text-primary-500">View the documentation</a>
        </p>
      </div>
    </div>
  );
};