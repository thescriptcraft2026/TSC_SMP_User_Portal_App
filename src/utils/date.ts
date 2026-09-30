export const formatDate = (dateString: string): string => {
  if (!dateString) return '';

  return new Date(dateString).toLocaleDateString('en-IN', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';

  return new Date(dateString).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const formatTime = (time: string | number | Date) => {
  if (!time) return '';

  const now = new Date();
  const msgTime = new Date(time);

  const diffInSeconds = Math.floor((now.getTime() - msgTime.getTime()) / 1000);

  if (diffInSeconds < 10) return 'Just now'; // 🔥 NEW
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;

  return msgTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCount = (count: number | string) => {
  const num = Number(count);

  if (num >= 1000000) {
    const value = Math.floor((num / 1000000) * 10) / 10;
    return `${value % 1 === 0 ? value.toFixed(0) : value}M`;
  }

  if (num >= 1000) {
    const value = Math.floor((num / 1000) * 10) / 10;
    return `${value % 1 === 0 ? value.toFixed(0) : value}K`;
  }

  return num.toString();
};
