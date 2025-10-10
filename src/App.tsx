import React, { useState } from "react";
import { User } from "./types";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Login, DashboardDock, NotificationProvider } from "./components";
import "./App.css";

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <ThemeProvider>
      <NotificationProvider>
        <div className="App">
          {!currentUser ? (
            <Login onLogin={handleLogin} />
          ) : (
            <DashboardDock user={currentUser} onLogout={handleLogout} />
          )}
        </div>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;
