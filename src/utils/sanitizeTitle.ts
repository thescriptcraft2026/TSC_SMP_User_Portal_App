export const sanitizeTitle = (text: string): string => {
  return text
    .replace(/[^a-zA-Z0-9\s'-]/g, '') // allow letters, numbers, space, ' and -
    .replace(/\s{2,}/g, ' ') // remove multiple spaces
    .replace(/^\s+/, ''); // prevent leading spaces
};

export const isValidTitle = (title: string): boolean => {
  return /^[a-zA-Z0-9\s'-]+$/.test(title.trim());
};