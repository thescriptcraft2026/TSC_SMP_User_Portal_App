// api/bookmarks.ts

export const fetchPosts = async () => {
  const res = await fetch('https://api.example.com/posts');
  return res.json();
};

export const fetchReplies = async () => {
  const res = await fetch('https://api.example.com/replies');
  return res.json();
};

export const fetchHighlights = async () => {
  const res = await fetch('https://api.example.com/highlights');
  return res.json();
};

export const fetchVideos = async () => {
  const res = await fetch('https://api.example.com/videos');
  return res.json();
};

export const fetchPhotos = async () => {
  const res = await fetch('https://api.example.com/photos');
  return res.json();
};