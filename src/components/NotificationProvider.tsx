import React, { createContext, useContext, useState, ReactNode } from "react";
import SuccessNotification from "./SuccessNotification";

interface NotificationData {
  id: string;
  message: string;
  subMessage?: string;
  type: "success" | "info" | "warning" | "error";
  duration?: number;
}

interface NotificationContextType {
  showNotification: (
    message: string,
    subMessage?: string,
    type?: "success" | "info" | "warning" | "error",
    duration?: number
  ) => void;
  showSuccess: (message: string, subMessage?: string) => void;
  showError: (message: string, subMessage?: string) => void;
  showWarning: (message: string, subMessage?: string) => void;
  showInfo: (message: string, subMessage?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = (
    message: string,
    subMessage?: string,
    type: "success" | "info" | "warning" | "error" = "success",
    duration: number = 4000
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: NotificationData = {
      id,
      message,
      subMessage,
      type,
      duration,
    };

    setNotifications((prev) => [...prev, newNotification]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const showNotification = (
    message: string,
    subMessage?: string,
    type: "success" | "info" | "warning" | "error" = "success",
    duration: number = 4000
  ) => {
    addNotification(message, subMessage, type, duration);
  };

  const showSuccess = (message: string, subMessage?: string) => {
    addNotification(message, subMessage, "success");
  };

  const showError = (message: string, subMessage?: string) => {
    addNotification(message, subMessage, "error");
  };

  const showWarning = (message: string, subMessage?: string) => {
    addNotification(message, subMessage, "warning");
  };

  const showInfo = (message: string, subMessage?: string) => {
    addNotification(message, subMessage, "info");
  };

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}

      {/* Render Notifications */}
      {notifications.map((notification, index) => (
        <SuccessNotification
          key={notification.id}
          message={notification.message}
          subMessage={notification.subMessage}
          type={notification.type}
          isVisible={true}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
};
