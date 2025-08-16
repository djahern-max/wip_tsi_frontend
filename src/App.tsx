import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';

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
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (token: string, userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-cyan-400 text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-400">
            TSI WIP Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-cyan-200">
              Welcome, {user?.username}
              <span className="ml-2 badge-primary">
                {user?.role}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <h2 className="text-xl font-semibold text-cyan-200 mb-4">
              🚧 Dashboard Coming Soon
            </h2>
            <p className="text-cyan-300">
              Your beautiful WIP dashboard with the React-inspired dark theme will appear here!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;