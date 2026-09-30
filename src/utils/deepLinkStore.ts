let pendingDeepLink: string | null = null;

export const setPendingDeepLink = (url: string) => {
  pendingDeepLink = url;
};

export const getPendingDeepLink = () => pendingDeepLink;

export const clearPendingDeepLink = () => {
  pendingDeepLink = null;
};