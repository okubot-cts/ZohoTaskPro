import React from 'react';
import { AuthForm } from './components/auth/AuthForm';
import { Dashboard } from './pages/Dashboard';
import { useAuthStore } from './store/authStore';

function App() {
  const { auth } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {auth.isConnected ? <Dashboard /> : <AuthForm />}
    </div>
  );
}

export default App;