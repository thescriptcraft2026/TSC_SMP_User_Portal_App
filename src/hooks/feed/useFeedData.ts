import { useMemo } from 'react';
import { formatDate } from '../../utils/date';
import { getContestStatus, getDaysLeftFromNow } from '../../utils/contest';

export const mapContests = (data: any[]) =>
  data
    ?.filter(c => c?.id)
    .map(c => {
      // ✅ if my participated contests
      const contest = c?.contest || c;

      return {
        type: 'contest',

        data: {
          // ✅ keep unique row id
          id: c?.id,

          // ✅ actual contest id
          contestId: contest?.id,

          // ✅ title/image from nested contest
          title: contest?.title || '',

          image: contest?.image || '',

          // ✅ nested dates
          startDate: formatDate(contest?.start_date),

          endDate: getDaysLeftFromNow(contest?.end_date),

          participants: Number(contest?.participants_count || 0),

          status: getContestStatus(contest?.start_date, contest?.end_date),

          isWishlisted: contest?.isWishlisted === 1,
        },
      };
    });

const mapMovies = (data: any) => {
  if (!Array.isArray(data)) return [];

  return data.map(m => ({
    type: 'movies',
    data: m,
  }));
};

const extractTagsFromStory = (text: string) => {
  if (!text) return [];

  const matches = text.match(/#\w+/g);

  return matches ? matches.map(tag => tag.replace('#', '')) : [];
};

export const useFeedData = ({ feed, contestList, movies }: any) => {
  const mixedFeed = useMemo(() => {
    return feed.map((item: any) => {
      let mediaArr = [];

      if (Array.isArray(item?.medias) && item.medias.length > 0) {
        mediaArr = item.medias.map((m: any) => ({
          type: 'image',
          url: m?.image,
        }));
      } else if (item?.image) {
        mediaArr = [
          {
            type: 'image',
            url: item.image,
          },
        ];
      }

      const storyTags = extractTagsFromStory(item?.story);

      const apiTags = item?.tags?.map((tag: any) => tag.name) || [];

      const finalTags = Array.from(new Set([...apiTags, ...storyTags]));

      const isUrl = (text: string) => {
        return /^https?:\/\/[^\s]+$/i.test(text || '');
      };

      const storyValue = item?.title || item?.story || '';

      const link = item?.link || null;

      const platform = item?.platform || null;

      const image = item?.image || null;

      const cleanCaption = storyValue;

      return {
        type: 'post',
        data: {
          id: item?.id,

          userId: item?.user?.id,
          userName: item?.user?.name,
          userAvatar: item?.user?.profile_photo_path,
          user_name: item?.user?.user_name,

          caption: cleanCaption,

          link: item?.link,
          platform: item?.platform,
          image: item?.image,

          time: item?.createdAt,

          media: mediaArr,

          tags: finalTags,

          isLiked: item?.isLiked === 1,

          likeCount: item?.likes_count,

          repostCount: item?.reposted_count,

          emoji_type: item?.emoji_type,

          comments: item?.comments_count,

          wishList: item?.isWishlisted === 1,

          isReported: item?.isReported === 1,

          postType: item?.type || 'normal',

          isRepost: item?.isRepost === 1,

          repostedUser: item?.reposted_user,

          originalPost: item?.original_post
            ? {
              ...item.original_post,

              repostCount: item.original_post?.reposted_count,

              likeCount: item.original_post?.likes_count,

              isWishlisted: item.original_post?.isWishlisted === 1,
            }
            : null,
        },
      };
    });
  }, [feed]);

  const contestData = useMemo(() => mapContests(contestList), [contestList]);

  const moviesData = useMemo(() => mapMovies(movies), [movies]);

  return {
    mixedFeed,
    contestData,
    moviesData,
  };
};
