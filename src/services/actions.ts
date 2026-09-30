import api from '../../Instance/Instance';

// ⭐ Wishlist
export const wishlistApi = async (
  synopsis_id: string,
  type: 'create' | 'delete',
) => {
  const res = await api.post('/actions/wishlist', {
    synopsis_id,
    type,
  });
  return res.data;
};

// ❤️ Like
export const likeApi = async (
  synopsis_id: string,
  type: 'create' | 'delete',
  emoji_type?: string,
) => {
  const res = await api.post('/actions/like', {
    synopsis_id,
    type,
    emoji_type,
  });
  return res.data;
};

// 💬 Add Comment
export const addCommentApi = async (synopsis_id: string, comment: string) => {
  const res = await api.post('/actions/comment', {
    synopsis_id,
    comment,
  });
  return res.data;
};

// ✏️ Update Comment
export const updateCommentApi = async (comment_id: string, comment: string) => {
  const res = await api.put(`/actions/comment/${comment_id}`, {
    comment,
  });
  return res.data;
};

// ❌ Delete Comment
export const deleteCommentApi = async (comment_id: string) => {
  const res = await api.delete(`/actions/comment/${comment_id}`);
  return res.data;
};
