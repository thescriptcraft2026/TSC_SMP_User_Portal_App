import { useCallback } from 'react';
import { Share } from 'react-native';

export type ShareProps = {
  title?: string;
  description?: string;
  value?: string;
  username?: string;
  image?: string;
  contestId?: string;

  type?:
  | 'movie'
  | 'post'
  | 'contest'
  | 'profile'
  | 'book'
  | 'synopsis'
  | 'visionx'
  | 'opportunity'
  | 'participateDetails'
};

export const useShare = (initialData?: ShareProps) => {
  const handleShare = useCallback(
    async (override?: ShareProps) => {
      const data = override ?? initialData;

      if (!data?.value) return;

      const {
        title,
        description,
        value,
        username,
        contestId,
        type = 'movie',
      } = data;

      const BASE_URL = 'https://www.thescriptcraft.com';

      let deepLink = '';

      switch (type) {
        case 'movie':
          deepLink = `${BASE_URL}/movies/${value}`;
          break;
        case 'book':
          deepLink = `${BASE_URL}/books/${value}`;
          break;
        case 'post':
          if (!username) {
            console.log('Username is required for post sharing');
            return;
          }

          deepLink = `${BASE_URL}/${encodeURIComponent(
            username,
          )}/status/${value}`;
          break;
        case 'contest':
          deepLink = `${BASE_URL}/contests/${value}`;
          break;
        case 'profile':
          deepLink = `${BASE_URL}/${value}`;
          break;
        case 'visionx':
          deepLink = `${BASE_URL}/vision/${value}`;
          break;
        case 'synopsis':
          deepLink = `${BASE_URL}/synopsys/${value}`;
          break;
        case 'opportunity':
          deepLink = `${BASE_URL}/opportunities/${value}`;
          break;
        case 'participateDetails':
          if (!contestId || !value) {
            console.log('Contest ID and Participant ID are required');
            return;
          }

          deepLink = `${BASE_URL}/contests/${contestId}/participants/${value}`;
          break;
        default:
          deepLink = BASE_URL;
      }
      console.log('Sharing URL:', deepLink);
      await Share.share({
        title: title || 'The Script Craft',
        message: deepLink,
      });
    },
    [initialData],
  );

  return { handleShare };
};