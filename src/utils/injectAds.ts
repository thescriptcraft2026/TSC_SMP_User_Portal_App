import { sponsoredAds } from "../data/data";

export const injectAds = (posts: any[], p0: number) => {
  const result: any[] = [];

  posts.forEach((post, index) => {
    result.push(post);

    // 🔥 Insert ad every 5 posts
    if ((index + 1) % 5 === 0) {
      const ad =
        sponsoredAds[Math.floor(Math.random() * sponsoredAds.length)];

      result.push({
        ...ad,
        type: 'ad',
      });
    }
  });

  return result;
};