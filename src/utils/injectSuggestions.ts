export const injectSuggestions = (posts: any[], interval = 5) => {
  const result: any[] = [];

  posts.forEach((post, index) => {
    result.push({ type: 'post', data: post });

    if ((index + 1) % interval === 0) {
      result.push({
        type: 'suggestion',
        id: `suggestion-${index}`,
      });
    }
  });

  return result;
};