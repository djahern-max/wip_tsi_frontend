import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import { WIPDashboard } from './components/WIPDashboard';

interface User {
  username: string;
  role: 'admin' | 'viewer';
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('access_token'); // Updated to match your API
    if (token) {
      setIsAuthenticated(true);
      // TODO: Verify token and get user data from API
      // For now, we'll check if there's stored user data
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (token: string, userData: { username: string; role: string }) => {
    // Store both token and user data
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(userData));

    setUser({
      username: userData.username,
      role: userData.role as 'admin' | 'viewer'
    });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            TSI WIP Reporting
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              Welcome, <span className="font-semibold">{user?.username}</span>
              <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full uppercase">
                {user?.role}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* WIP Dashboard */}
      <WIPDashboard />
    </div>
  );
}

export default App;