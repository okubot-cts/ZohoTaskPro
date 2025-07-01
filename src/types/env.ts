export interface ZohoConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  authUrl: string;
  tokenUrl: string;
  apiUrl: string;
}

export interface EnvironmentVariables {
  VITE_ZOHO_CLIENT_ID: string;
  ZOHO_CLIENT_SECRET?: string;
  VITE_ZOHO_REDIRECT_URI: string;
  VITE_ZOHO_AUTH_URL: string;
  VITE_ZOHO_TOKEN_URL: string;
  VITE_ZOHO_CRM_API_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvironmentVariables {}
  }
}

export const getZohoConfig = (): ZohoConfig => {
  const config: ZohoConfig = {
    clientId: import.meta.env.VITE_ZOHO_CLIENT_ID,
    redirectUri: import.meta.env.VITE_ZOHO_REDIRECT_URI,
    authUrl: import.meta.env.VITE_ZOHO_AUTH_URL,
    tokenUrl: import.meta.env.VITE_ZOHO_TOKEN_URL,
    apiUrl: import.meta.env.VITE_ZOHO_CRM_API_URL,
  };

  if (!config.clientId) {
    throw new Error('VITE_ZOHO_CLIENT_ID is required');
  }
  if (!config.redirectUri) {
    throw new Error('VITE_ZOHO_REDIRECT_URI is required');
  }

  return config;
};