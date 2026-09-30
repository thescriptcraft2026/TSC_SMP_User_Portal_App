import { navigate } from '../../navigationRef';

export const handleDeepLink = (url: string) => {
  if (!url) return;

  console.log('Deep Link URL:', url);

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

  const parts = route.split('/').filter(Boolean);

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
  const value = decodeURIComponent(parts.slice(1).join('/'));

  console.log('Type:', type);
  console.log('Value:', value);

  switch (type) {
    // ==========================
    // BOOK
    // ==========================
    case 'book':
    case 'books':
      navigate('BookDetails', {
        bookId: value,
      });
      break;

    // ==========================
    // MOVIE
    // ==========================
    case 'movie':
    case 'movies':
      navigate('SingleMovieDetails', {
        id: value,
      });
      break;

    // ==========================
    // POST
    // ==========================
    case 'post':
    case 'posts':
      console.log('Opening Post:', value);

      navigate('SinglePostDetailes', {
        postId: value,
      });
      break;

    // ==========================
    // CONTEST
    // ==========================
    case 'contest':
    case 'contests':
      navigate('ContestDetails', {
        id: value,
      });
      break;

    // ==========================
    // SYNOPSIS
    // ==========================
    case 'synopsis':
    case 'synopses':
      navigate('SynopsisDetails', {
        synopsisId: value,
      });
      break;

    // ==========================
    // VISION X
    // ==========================
    case 'vision':
    case 'visionx':
      navigate('VisionXDetails', {
        visionxId: value,
      });
      break;

    // ==========================
    // OPPORTUNITY
    // ==========================
    case 'opportunity':
    case 'opportunities':
      navigate('SingleOpportunityDetails', {
        id: value,
      });
      break;

    // ==========================
    // PROFILE
    // ==========================
    case 'profile': {
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          value,
        );

      navigate(
        'Profile',
        isUUID
          ? { id: value }
          : { username: value },
      );

      break;
    }

    default:
      console.log('Unknown deep link:', route);
  }
};