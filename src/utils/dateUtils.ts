export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString();
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString();
};

export const getRelativeTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else {
    return formatDate(d);
  }
};

export const isToday = (date: Date | string): boolean => {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};
