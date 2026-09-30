

const parseIST = (date?: string) => {
  if (!date) return new Date();
  return new Date(date.replace('Z', ''));
};

export const getContestStatus = (
  startDate?: string,
  endDate?: string,
): 'upcoming' | 'ongoing' | 'completed' => {
  if (!startDate || !endDate) return 'upcoming';

  const now = Date.now();

  if (now < parseIST(startDate).getTime()) {
    return 'upcoming';
  }

  if (now >= parseIST(endDate).getTime()) {
    return 'completed';
  }

  return 'ongoing';
};

export const getDaysLeftFromNow = (endDate?: string) => {
  if (!endDate) return '';

  const now = Date.now();
  const end = parseIST(endDate).getTime();

  const diff = end - now;

  if (diff < 0) return 'Completed';

  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Ends today';

  return `${days} day${days > 1 ? 's' : ''} left`;
};

export const hasContestStarted = (startDate?: string) => {
  if (!startDate) return false;

  return Date.now() >= parseIST(startDate).getTime();
};

export const hasContestExpired = (endDate?: string) => {
  if (!endDate) return false;

  return Date.now() >= parseIST(endDate).getTime();
};