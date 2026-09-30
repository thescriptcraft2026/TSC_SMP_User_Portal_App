export const getRelation = (item: any) => {
  if (item.followsYou && item.followedByYou) return 'connection';
  if (item.followsYou) return 'follower';
  if (item.followedByYou) return 'following';
  return 'none';
};