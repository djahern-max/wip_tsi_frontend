import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import { EditableWIPDashboard } from './components/EditableWIPDashboard'; // Changed import
import { Header } from './components/Header';
import { wipService } from './services/wipService';

interface User {
  username: string;
  role: 'admin' | 'viewer';
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardKey, setDashboardKey] = useState(0);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsAuthenticated(true);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (token: string, userData: { username: string; role: string }) => {
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

  const handleRefresh = () => {
    setDashboardKey(prev => prev + 1);
  };

  const handleExport = async () => {
    try {
      await wipService.downloadExcel();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Component */}
      <Header
        user={user}
        onRefresh={handleRefresh}
        onExport={handleExport}
        onLogout={handleLogout}
      />

      {/* Editable WIP Dashboard */}
      <EditableWIPDashboard
        key={dashboardKey}
        currentUser={user} // Pass the current user
      />
    </div>
  );
}

export default App;