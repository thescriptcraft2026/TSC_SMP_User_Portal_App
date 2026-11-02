export const isYoutubeUrl = (url?: string) =>
  !!url && /(youtube\.com|youtu\.be)/i.test(url);

export const isInstagramUrl = (url?: string) =>
  !!url && /instagram\.com/i.test(url) && !url.toLowerCase().includes('/stories/');

export const isInstagramPostUrl = (url?: string) =>
  !!url && /instagram\.com\/(reel|p|tv)\/[A-Za-z0-9_-]+/i.test(url);

export const isVideoUrl = (url?: string) =>
  !!url && /\.(mp4|m4v|mov|mkv|webm|m3u8|ts)(\?.*)?$/i.test(url.split('?')[0]);

export const getYoutubeId = (url?: string) => {
  if (!url) return null;

  const regExp =
    /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts|live)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;

  const match = url.match(regExp);

  return match?.[1] || null;
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