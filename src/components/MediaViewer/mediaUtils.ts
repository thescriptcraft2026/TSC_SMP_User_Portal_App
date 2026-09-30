export const isYoutubeUrl = (url?: string) =>
  !!url && (url.includes('youtube.com') || url.includes('youtu.be'));

export const isInstagramUrl = (url?: string) =>
  !!url && url.includes('instagram.com') && !url.includes('/stories/');

export const getYoutubeId = (url?: string) => {
  if (!url) return null;

  const regExp =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^?&/]+)/;

  return url.match(regExp)?.[1] || null;
};

export const getInstagramEmbedUrl = (url?: string) => {
  if (!url) return '';

  return url.endsWith('/embed') ? url : `${url.replace(/\/$/, '')}/embed`;
};

export const isFacebookUrl = (url?: string) =>
  !!url && /(facebook\.com|fb\.watch)/i.test(url);

export const isGoogleDriveUrl = (url?: string) =>
  !!url && /(drive\.google\.com)/i.test(url);

export const getFacebookEmbedUrl = (url: string) =>
  `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
    url,
  )}&show_text=false&width=560`;

export const getGoogleDrivePreviewUrl = (url: string) => {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);

  if (match?.[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }

  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  if (idMatch?.[1]) {
    return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
  }

  return url;
};

/* -------------------- Google Docs -------------------- */

export const isGoogleDocsUrl = (url?: string) =>
  !!url &&
  /(docs\.google\.com\/(document|presentation|spreadsheets))/i.test(url);

export const getGoogleDocsEmbedUrl = (url?: string) => {
  if (!url) return '';

  // Already embedded
  if (url.includes('/preview') || url.includes('/embed')) {
    return url;
  }

  // Docs
  if (url.includes('/document/')) {
    return `${url.replace(/\/edit.*$/, '')}/preview`;
  }

  // Sheets
  if (url.includes('/spreadsheets/')) {
    return `${url.replace(/\/edit.*$/, '')}/preview`;
  }

  // Slides
  if (url.includes('/presentation/')) {
    return `${url.replace(/\/edit.*$/, '')}/embed`;
  }

  return url;
};

/* -------------------- Twitter / X -------------------- */

export const isTwitterUrl = (url?: string) =>
  !!url && /(twitter\.com|x\.com)/i.test(url);

export const getTwitterEmbedUrl = (url?: string) => {
  if (!url) return '';

  return `https://twitframe.com/show?url=${encodeURIComponent(url)}`;
};

/* -------------------- Vimeo -------------------- */

export const isVimeoUrl = (url?: string) =>
  !!url && /vimeo\.com/i.test(url);

export const getVimeoId = (url?: string) => {
  if (!url) return null;

  const match = url.match(
    /(?:vimeo\.com\/(?:video\/)?)(\d+)|player\.vimeo\.com\/video\/(\d+)/,
  );

  return match?.[1] || match?.[2] || null;
};

export const getVimeoEmbedUrl = (url?: string) => {
  const id = getVimeoId(url);

  return id ? `https://player.vimeo.com/video/${id}` : '';
};