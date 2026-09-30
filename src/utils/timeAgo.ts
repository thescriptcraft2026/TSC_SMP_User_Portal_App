export const getTimeAgo = (
  createdAt?: string | null,
  updatedAt?: string | null,
) => {
  const dateString = createdAt || updatedAt;

  if (!dateString) return '';

  const now = new Date();
  const date = new Date(dateString);

  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(diffInSeconds / 3600);
  const days = Math.floor(diffInSeconds / 86400);

  // 🔥 Seconds / Minutes
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  // 🔥 Hours
  if (hours < 24) return `${hours}h ago`;

  // 🔥 Days
  if (days < 7) return `${days}d ago`;

  // 🔥 Older → show date
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };

  return date.toLocaleDateString('en-GB', options);
};

export const getContestStatus = (start: string, end: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);

  if (today < startDate) return 'upcoming';
  if (today > endDate) return 'completed';

  return 'active';
};

const formatDate = (date: string) => {
  if (!date) return '';
  const d = new Date(date);

  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });
};

export const getDaysLeft = (endDate: string) => {
  if (!endDate) return '';

  const now = new Date();
  const end = new Date(endDate);

  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Ended';
  if (diffDays === 1) return '1 day left';

  return `${diffDays} days left`;
};

export const getDisplayTime = (createdAt: string, updatedAt?: string) => {
  const created = new Date(createdAt);
  const updated = updatedAt ? new Date(updatedAt) : null;

  // ✅ Use updated date only if actually updated
  const useDate =
    updated && updated.getTime() !== created.getTime() ? updated : created;

  const now = new Date();

  const diffMs = now.getTime() - useDate.getTime();

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // ✅ Just now
  if (diffSeconds < 60) {
    return 'Just now';
  }

  // ✅ Minutes
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  // ✅ Hours
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  // ✅ Yesterday
  if (diffDays === 1) {
    return 'Yesterday';
  }

  // ✅ Within 48 hours
  if (diffDays < 2) {
    return `${diffDays}d ago`;
  }

  // ✅ Older than 48 hours → show actual date
  return useDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};
