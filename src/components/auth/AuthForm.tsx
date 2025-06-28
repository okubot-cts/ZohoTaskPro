import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Button } from '../common/Button';

export const AuthForm: React.FC = () => {
  const handleZohoLogin = () => {
    window.location.href = "http://localhost:4000/auth/zoho";
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
          <p className="text-gray-600 mt-2">Authenticate with your Zoho account to get started</p>
        </div>

        <div className="pt-2">
          <Button 
            onClick={handleZohoLogin}
            fullWidth
          >
            Login with Zoho
          </Button>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Need help? <a href="#" className="text-primary-600 hover:text-primary-500">View the documentation</a>
        </p>
      </div>
    </div>
  );
};