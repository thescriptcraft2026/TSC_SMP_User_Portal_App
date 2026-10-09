import { navigate, navigationRef } from '../../navigationRef';
import {
  clearPendingDeepLink,
  getPendingDeepLink,
  setPendingDeepLink,
} from './deepLinkStore';

export const handleDeepLink = (url: string) => {
  if (!url) return;

  console.log('Deep Link URL:', url);

  // App stack not mounted yet (splash / auth bootstrap) — keep the link and
  // let SplashScreen open it once the user lands in the App stack.
  const rootRoutes = navigationRef.isReady()
    ? navigationRef.getRootState()?.routes
    : undefined;
  if (!rootRoutes?.some(r => r.name === 'App')) {
    setPendingDeepLink(url);
    return;
  }

  let route = '';

  // ==========================
  // CUSTOM SCHEME
  // ==========================
  if (url.startsWith('tsc://')) {
    route = url.replace('tsc://', '');
  }

  // ==========================
  // PRODUCTION DOMAIN
  // ==========================
  else if (url.startsWith('https://thescriptcraft.com/')) {
    route = url.replace('https://thescriptcraft.com/', '');
  } else if (url.startsWith('https://www.thescriptcraft.com/')) {
    route = url.replace('https://www.thescriptcraft.com/', '');
  }

  // ==========================
  // UNKNOWN URL
  // ==========================
  else {
    console.log('Unsupported Deep Link:', url);
    return;
  }

  console.log('Parsed Route:', route);

  // Strip query string / hash so "?utm=.." or "#.." don't break matching
  const parts = route
    .split(/[?#]/)[0]
    .split('/')
    .filter(Boolean);

  console.log('Parts:', parts);

  if (parts.length === 0) {
    return;
  }

  // =====================================================
  // WEBSITE POST URL
  //
  // https://thescriptcraft.com/{username}/status/{postId}
  //
  // Example:
  // https://thescriptcraft.com/aman/status/9300c958-...
  // =====================================================
  if (
    parts.length >= 3 &&
    parts[1].toLowerCase() === 'status'
  ) {
    const postId = decodeURIComponent(parts[2]);

    console.log('Opening Website Post:', postId);

    navigate('SinglePostDetailes', {
      postId,
    });

    return;
  }

  const type = parts[0].toLowerCase();

  // https://www.thescriptcraft.com/contests/{contestId}/participants/{id}
  if (
    (type === 'contest' || type === 'contests') &&
    parts.length >= 4 &&
    parts[2].toLowerCase() === 'participants'
  ) {
    navigate('ParticipateDetails', { id: decodeURIComponent(parts[3]) });
    return;
  }

  const KNOWN_TYPES = [
    'book', 'books', 'movie', 'movies', 'post', 'posts', 'contest',
    'contests', 'synopsis', 'synopses', 'synopsys', 'vision', 'visionx',
    'creators-zone', 'opportunity', 'opportunities', 'profile',
  ];

  // https://www.thescriptcraft.com/{username}  (shared profile link)
  if (parts.length === 1 && !KNOWN_TYPES.includes(type)) {
    navigate('Profile', { username: decodeURIComponent(parts[0]) });
    return;
  }

  const value = decodeURIComponent(parts.slice(1).join('/'));

  switch (type) {
    case 'book':
    case 'books':
      navigate('BookDetails', { bookId: value });
      break;

    case 'movie':
    case 'movies':
      navigate('SingleMovieDetails', { id: value });
      break;

    case 'post':
    case 'posts':
      navigate('SinglePostDetailes', { postId: value });
      break;

    case 'contest':
    case 'contests':
      navigate('ContestDetails', { contestId: value });
      break;

    case 'synopsis':
    case 'synopses':
    case 'synopsys':
      navigate('SynopsisDetails', { synopsisId: value });
      break;

    case 'vision':
    case 'visionx':
    case 'creators-zone':
      navigate('VisionXDetails', { visionxId: value });
      break;

    case 'opportunity':
    case 'opportunities':
      navigate('SingleOpportunityDetails', { opp_id: value });
      break;

    case 'profile':
      navigate('Profile', { username: value });
      break;

    default:
      console.log('Unknown deep link:', route);
  }
};

/**
 * Opens a link that was saved while the user was logged out / still setting up.
 * Called whenever navigation state changes, so it fires right after login,
 * signup or profile setup puts the user inside the App stack.
 */
let openingPending = false;
export const openPendingDeepLink = () => {
  if (openingPending || !navigationRef.isReady()) return;
  const url = getPendingDeepLink();
  if (!url) return;
  if (!navigationRef.getRootState()?.routes?.some(r => r.name === 'App')) {
    return;
  }

  openingPending = true;
  clearPendingDeepLink();
  // let the App stack finish mounting before navigating into it
  setTimeout(() => {
    openingPending = false;
    handleDeepLink(url);
  }, 500);
};
