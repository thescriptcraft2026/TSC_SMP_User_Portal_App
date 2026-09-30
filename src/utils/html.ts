import he from 'he';

export const isHtmlContent = (text?: string): boolean => {
  if (!text) return false;

  return /<\/?[a-z][\s\S]*>/i.test(text);
};

export const cleanHtml = (html?: string) => {
  if (!html) return '';

  let result = he.decode(html);

  result = result.replace(/<div>/gi, '<p>');
  result = result.replace(/<\/div>/gi, '</p>');
  result = result.replace(/<p>\s*<\/p>/gi, '');
  result = result.replace(/<p><ul>/gi, '<ul>');
  result = result.replace(/<\/ul><\/p>/gi, '</ul>');
  result = result.replace(/<p><ol>/gi, '<ol>');
  result = result.replace(/<\/ol><\/p>/gi, '</ol>');

  return result;
};

export const stripHtml = (html?: string) => {
  if (!html) return '';

  return cleanHtml(html)
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};
