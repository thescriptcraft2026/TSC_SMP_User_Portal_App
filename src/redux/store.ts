import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import bookReducer from './slices/bookSlice';
import genreReducer from './slices/genresSlice';
import tagsReducer from './slices/publicSlice';
import connectionReducer from './slices/connectionSlice';
import actionReducer from './slices/actionSlice';
import reportReducer from './slices/reportSlice';
import visionxReducer from './slices/visionXSlice';
import newsReducer from './slices/newsSlice';
import contestReducer from './slices/contestSlice';
import opportunityReducer from './slices/opportunitySlice';
import movieReducer from './slices/movieSlice';
import chatReducer from './slices/chatSlice';
import bookMarkReducer from './slices/bookmarkSlice';
import feedReducer from './slices/feedSlice';
import postReducer from './slices/postSlice';
import notificationReducer from './slices/notificationSlice';
import searchReducer from './slices/searchSlice';
import profileSettingReducer from './slices/profileSettingSlice';
import privacySettingReducer from './slices/privacySettingSlice';
import bannerReducer from './slices/bannerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    book: bookReducer,
    genre: genreReducer,
    tags: tagsReducer,
    connection: connectionReducer,
    actions: actionReducer,
    report: reportReducer,
    visionx: visionxReducer,
    news: newsReducer,
    contest: contestReducer,
    opportunity: opportunityReducer,
    movie: movieReducer,
    chat: chatReducer,
    bookmarks: bookMarkReducer,
    feed: feedReducer,
    post: postReducer,
    notification: notificationReducer,
    search: searchReducer,
    profileSetting: profileSettingReducer,
    privacySetting: privacySettingReducer,
    banners: bannerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
