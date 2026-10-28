import { navigate } from '../../navigationRef';

export const handleDeepLink = (url: string) => {
  if (!url) return;

  console.log('Deep Link URL:', url);

  let route = url.trim();

  // Strip query strings and hash anchors before parsing route path
  route = route.split('?')[0].split('#')[0];

  // Normalize: strip custom scheme, full HTTP/HTTPS domains, or leading slashes
  route = route
    .replace(/^tsc:\/\//i, '')
    .replace(/^https?:\/\/(www\.)?thescriptcraft\.com\//i, '')
    .replace(/^https?:\/\/betatscapi\.thescriptcraft\.com\//i, '')
    .replace(/^\/+/, '');

  if (!route) {
    console.log('Empty route after normalizing:', url);
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
  if (parts.length >= 3 && parts[1].toLowerCase() === 'status') {
    const postId = decodeURIComponent(parts[2]);

    console.log('Opening Website Post:', postId);

    navigate('SinglePostDetailes', {
      postId,
      id: postId,
    });

    return;
  }

  const type = parts[0].toLowerCase();
  const value = decodeURIComponent(parts.slice(1).join('/'));

  console.log('Type:', type);
  console.log('Value:', value);

  switch (type) {
    // ==========================
    // NOTIFICATION / ANNOUNCEMENTS
    // ==========================
    case 'notification':
    case 'notifications':
    case 'announcement':
    case 'announcements':
      navigate('Notification');
      break;

    // ==========================
    // CHAT / MESSAGING
    // ==========================
    case 'chat':
    case 'chats':
    case 'messaging':
      if (value) {
        navigate('ChatRoom', {
          chatId: value,
        });
      } else {
        navigate('Chats');
      }
      break;

    // ==========================
    // BOOK
    // ==========================
    case 'book':
    case 'books':
      if (value) {
        navigate('BookDetails', {
          bookId: value,
          id: value,
        });
      } else {
        navigate('AllBooks');
      }
      break;

    // ==========================
    // MOVIE
    // ==========================
    case 'movie':
    case 'movies':
      if (value) {
        navigate('SingleMovieDetails', {
          id: value,
          movieId: value,
        });
      } else {
        navigate('AllMovies');
      }
      break;

    // ==========================
    // POST
    // ==========================
    case 'post':
    case 'posts':
      if (value) {
        console.log('Opening Post:', value);
        navigate('SinglePostDetailes', {
          postId: value,
          id: value,
        });
      } else {
        navigate('BottomTab', {
          screen: 'Feed',
        });
      }
      break;

    // ==========================
    // CONTEST
    // ==========================
    case 'contest':
    case 'contests':
      if (value) {
        navigate('ContestDetails', {
          contestId: value,
          id: value,
        });
      } else {
        navigate('AllContest');
      }
      break;

    // ==========================
    // SYNOPSIS
    // ==========================
    case 'synopsis':
    case 'synopses':
    case 'synopsys':
      if (value) {
        navigate('SynopsisDetails', {
          synopsisId: value,
          id: value,
        });
      } else {
        navigate('AllSynopsis');
      }
      break;

    // ==========================
    // VISION X / CREATORS ZONE
    // ==========================
    case 'vision':
    case 'visionx':
    case 'creators-zone':
      if (value) {
        navigate('VisionXDetails', {
          visionxId: value,
          id: value,
        });
      } else {
        navigate('AllVisionX');
      }
      break;

    // ==========================
    // OPPORTUNITY / JOBS
    // ==========================
    case 'opportunity':
    case 'opportunities':
    case 'job':
    case 'jobs':
      if (value) {
        navigate('SingleOpportunityDetails', {
          opp_id: value,
          id: value,
          opportunity_id: value,
        });
      } else {
        navigate('AllOpportunity');
      }
      break;

    // ==========================
    // FEED / HOME TABS
    // ==========================
    case 'feed':
      navigate('BottomTab', {
        screen: 'Feed',
      });
      break;

    case 'home':
      navigate('BottomTab', {
        screen: 'Home',
      });
      break;

    case 'requests':
    case 'connections':
      navigate('BottomTab', {
        screen: 'Connections',
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
        isUUID ? { id: value } : { username: value },
      );

      break;
    }

    default: {
      // Single-segment route that didn't match a known keyword is treated as a username profile
      const staticPages = ['privacy', 'terms', 'about', 'contact', 'help', 'onboarding', 'login', 'signup'];
      if (parts.length === 1 && parts[0] && !staticPages.includes(type)) {
        navigate('Profile', {
          username: parts[0],
        });
        break;
      }
      console.log('Unknown deep link:', route);
    }
  }
};
