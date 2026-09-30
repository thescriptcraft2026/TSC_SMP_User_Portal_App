# API, State Management & Socket Specification

This document contains a complete technical inventory of the Redux State Tree, REST API endpoints, and real-time Socket.IO event contracts for **TheScriptCraft Mobile App**.

---

## 📦 Redux State Management

The app uses Redux Toolkit (`@reduxjs/toolkit`). The store is configured in `src/redux/store.ts` and contains **22 domain slices**:

```typescript
export interface RootState {
  auth: AuthState;
  profile: ProfileState;
  book: BookState;
  genre: GenreState;
  tags: TagsState;
  connection: ConnectionState;
  actions: ActionsState;
  report: ReportState;
  visionx: VisionXState;
  news: NewsState;
  contest: ContestState;
  opportunity: OpportunityState;
  movie: MovieState;
  chat: ChatState;
  bookmarks: BookmarkState;
  feed: FeedState;
  post: PostState;
  notification: NotificationState;
  search: SearchState;
  profileSetting: ProfileSettingState;
  privacySetting: PrivacySettingState;
  banners: BannerState;
}
```

### Slice Summary Table

| Slice Name | File Path | Key Responsibilities |
| :--- | :--- | :--- |
| `auth` | `src/redux/slices/authSlice.ts` | User session, login, registration, OTP state, user metadata, biometric tokens |
| `feed` | `src/redux/slices/feedSlice.ts` | Home feed pagination, stories, sponsored feeds, pull-to-refresh |
| `post` | `src/redux/slices/postSlice.ts` | Current post creation state, edit post, delete post, single post view |
| `chat` | `src/redux/slices/chatSlice.ts` | Conversation list, active chat room messages, local optimism, message statuses |
| `contest` | `src/redux/slices/contestSlice.ts` | Contests list, single contest details, participant list, my submissions |
| `opportunity`| `src/redux/slices/opportunitySlice.ts`| Job board, opportunity filters, application submissions, posted gigs |
| `book` | `src/redux/slices/bookSlice.ts` | Books list, single book details, rating state, suggested books |
| `visionx` | `src/redux/slices/visionXSlice.ts` | VisionX showcase cards, detail view, creation forms |
| `profile` | `src/redux/slices/profileSlice.ts` | Active user profile, visited profiles, portfolio tabs, experience records |
| `connection` | `src/redux/slices/connectionSlice.ts` | Connection list, pending requests, followers/following, suggestions |
| `bookmarks` | `src/redux/slices/bookmarkSlice.ts` | Saved books, opportunities, contests, movies, and synopsis |
| `movie` | `src/redux/slices/movieSlice.ts` | Movie review catalogue, details, ratings, trailer data |
| `notification`| `src/redux/slices/notificationSlice.ts`| Notification feed, read states, unread badge counters |
| `actions` | `src/redux/slices/actionSlice.ts` | Likes, comments, reactions, rating submissions |
| `genre` | `src/redux/slices/genresSlice.ts` | Genre taxonomy for books, contests, synopsis, and movies |
| `tags` | `src/redux/slices/publicSlice.ts` | Global public tags and categories |
| `banners` | `src/redux/slices/bannerSlice.ts` | Dynamic promotional banners and carousel items |
| `news` | `src/redux/slices/newsSlice.ts` | Creative industry news and blog updates |
| `search` | `src/redux/slices/searchSlice.ts` | Global search query results and autocomplete items |
| `report` | `src/redux/slices/reportSlice.ts` | Content and user reporting states |
| `profileSetting`| `src/redux/slices/profileSettingSlice.ts`| User preferences and notification settings |
| `privacySetting`| `src/redux/slices/privacySettingSlice.ts`| Visibility toggles (Public/Private, DM rules) |

---

## 🌐 REST API Endpoints Reference

All endpoints are prefixed with `Config.API_BASE_URL` (typically `https://.../v1/user`).

### 1. Authentication & Onboarding (`authApi.ts`)

| Method | Endpoint | Description | Payload / Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/auth/me` | Fetch authenticated user profile | None |
| `POST` | `/auth/register` | Register new user account | `{ name, email, password }` |
| `POST` | `/auth/login` | Email/Password login | `{ email, password }` |
| `POST` | `/auth/verify-otp` | Verify registration OTP | `{ email, otp }` |
| `POST` | `/auth/forgot-password` | Request password reset OTP | `{ email }` |
| `POST` | `/auth/verify-forgot-otp` | Verify reset OTP | `{ email, otp }` |
| `POST` | `/auth/reset-password` | Set new password | `{ email, otp, new_password }` |
| `POST` | `/auth/resend-otp` | Resend OTP code | `{ email }` |
| `POST` | `/auth/logout` | Invalidate refresh token | `{ refreshToken }` |
| `POST` | `/auth/refresh-token` | Obtain new access token | `{ refreshToken }` |
| `POST` | `/auth/google-login` | Google OAuth verification | `{ id_token }` |
| `POST` | `/auth/fcm-token` | Register FCM push token | `{ fcm_token }` |
| `GET` | `/auth/available-usernames/:username` | Check username availability | `username: string` |

### 2. Posts & Content (`postApi.ts`, `feedApi.ts`)

| Method | Endpoint | Description | Payload / Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/content` | Get paginated community feed / items | `page, limit, type, sort_by, search` |
| `GET` | `/content/:id` | Get single post / content item | `id: string` |
| `POST` | `/content` | Create new post (multipart) | `FormData: { story, media, tags, mentions }` |
| `PUT` | `/content/:id` | Edit own post (multipart) | `FormData: { story, media, tags }` |
| `DELETE` | `/content/:id` | Delete own post | `id: string` |
| `POST` | `/content/repost-content`| Repost content with note | `{ story, synopsis_id, mentions, tags }` |
| `GET` | `/content/suggestion/:id` | Get content recommendations | `id: string` |

### 3. Actions: Likes, Comments, Ratings (`actions.ts`)

| Method | Endpoint | Description | Payload / Params |
| :--- | :--- | :--- | :--- |
| `POST` | `/actions/like` | Like or unlike content | `{ synopsis_id, type: 'create'\|'delete', emoji_type }` |
| `POST` | `/actions/comment` | Add comment | `{ synopsis_id, comment }` |
| `PUT` | `/actions/comment/:id` | Edit comment | `{ comment }` |
| `DELETE` | `/actions/comment/:id` | Delete comment | `id: string` |
| `POST` | `/actions/wishlist` | Bookmark content | `{ synopsis_id, type: 'create'\|'delete' }` |
| `POST` | `/actions/rate/:id` | Submit star rating | `{ rating: number }` |

### 4. Books (`bookApi.ts`)

| Method | Endpoint | Description | Payload / Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/content?type=book` | Get all books | `page, limit, sort_by, search, genre_id` |
| `GET` | `/content/:id` | Get book details | `id: string` |
| `POST` | `/content` | Publish book (multipart) | `FormData: { title, cover_image, pdf, synopsis, genre_id }` |
| `PUT` | `/content/:id` | Update book | `FormData: { title, cover_image, ... }` |
| `DELETE` | `/content/:id` | Delete book | `id: string` |

### 5. Contests (`contestApi.ts`)

| Method | Endpoint | Description | Payload / Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/contest` | List all contests | `page, limit, sort_by, search, genre_id` |
| `GET` | `/public/contest/:id` | Get contest by ID | `id: string` |
| `POST` | `/contest/wishlist` | Bookmark contest | `{ contest_id, type }` |
| `GET` | `/contest/:id/participants` | Get leaderboard/submissions | `page, search, sort_by: 'rating'` |
| `POST` | `/contest/participant/:id` | Submit contest entry | `FormData: { title, file, logline, genre_id }` |
| `GET` | `/contest/participant/:id` | Get submission details | `id: string` |
| `GET` | `/contest/participant` | Get my participated contests | `page, limit` |
| `GET` | `/contest/banners/data` | Get contest banner carousels | None |

### 6. Opportunities (`opportunityApi.ts`)

| Method | Endpoint | Description | Payload / Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/opportunity` | List opportunities / gigs | `page, source, search, categoryId` |
| `GET` | `/opportunity/:id` | Get single opportunity | `id: string` |
| `GET` | `/roles` | Get available job roles | None |
| `POST` | `/opportunity` | Create job posting (multipart) | `FormData: { title, description, budget, deadline, ... }` |
| `PUT` | `/opportunity/:id` | Update job posting | `FormData` |
| `PUT` | `/opportunity/:id/status`| Change status | `{ status: 'active' \| 'closed' }` |
| `POST` | `/opportunity/:id/submit`| Apply for opportunity | `FormData: { resume, portfolio_url, cover_letter }` |
| `POST` | `/oppourtunity-wishlist` | Bookmark opportunity | `{ oppourtunity_id, type }` |
| `DELETE`| `/opportunity/:id/delete`| Delete opportunity | `id: string` |
| `GET` | `/opportunity/submissions`| Opportunity submissions list | `page, opportunity_id` |
| `GET` | `/opportunity/user/submissions`| My submitted applications | `page` |

### 7. Real-Time Chat REST Endpoints (`chatApi.ts`)

| Method | Endpoint | Description | Payload / Params |
| :--- | :--- | :--- | :--- |
| `POST` | `/chat` | Initiate or send chat | `{ receiver_id, message?, file? }` |
| `GET` | `/chat/users` | List active conversations | `page, limit, search` |
| `GET` | `/chat/:chatId/messages` | Load paginated messages | `chatId, page` |
| `GET` | `/chat/suggestion/users` | User suggestions for new chat | None |
| `PUT` | `/chat/edit` | Edit message text | `{ message_id, message }` |
| `DELETE` | `/chat/delete` | Delete chat message | `{ message_id }` |

### 8. Movie Reviews (`movieApi.ts`)

| Method | Endpoint | Description | Payload / Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/review-contents` | Get movie review catalogue | `page, sort_by, search, genre_id, reviewcategory_id` |
| `GET` | `/review-contents/:id` | Get movie details | `id: string` |
| `POST` | `/review-contents/wishlist` | Bookmark movie to watchlist | `{ content_id, type: 'create'\|'delete' }` |
| `POST` | `/review-contents/like` | Like movie | `{ content_id, type, emoji_type }` |
| `POST` | `/review-contents/review` | Submit movie review/rating | `FormData: { content_id, rating, review }` |

### 9. Social Connections & Graph (`connectionApi.ts`)

| Method | Endpoint | Description | Payload / Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/connection/pending` | Inbound friend requests | None |
| `PUT` | `/connection/accept` | Accept connection request | `{ connection_id }` |
| `PUT` | `/connection/reject` | Reject connection request | `{ connection_id }` |
| `GET` | `/connection/friends/:username` | User's friends/connections | `username, page` |
| `GET` | `/follow/followers/:username` | User's followers | `username, page` |
| `GET` | `/follow/following/:username` | User's following list | `username, page` |
| `POST` | `/connection` | Send friend request | `{ receiver_id }` |
| `POST` | `/follow` | Follow user | `{ following_id }` |
| `POST` | `/follow/unfollow` | Unfollow user | `{ other_user_id }` |
| `GET` | `/connection/suggestions/users` | Suggested users | `page` |

### 10. Profiles & Experience (`profileApi.ts`)

| Method | Endpoint | Description | Payload / Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/profile/:username` | Get full user profile | `username: string` |
| `PUT` | `/profile` | Update profile details | `{ name, bio, phone, location, social_links }` |
| `POST` | `/profile/picture` | Upload avatar (multipart) | `FormData: { image }` or `{ remove_image: '1' }` |
| `POST` | `/profile/cover-photo` | Upload cover photo | `FormData: { image }` or `{ remove_image: '1' }` |
| `GET` | `/profile/roles/primary/suggested` | Suggested primary roles | None |
| `GET` | `/profile/roles/secondary/suggested`| Suggested secondary roles | None |
| `POST` | `/profile/roles/primary` | Update primary roles | `{ roles: [] }` |
| `POST` | `/profile/roles/secondary` | Update secondary roles | `{ roles: [] }` |
| `POST` | `/profile/role-experience/:roleId` | Add experience record | `{ company, role_title, start_date, end_date, description }` |

---

## ⚡ Socket.IO Event Contracts

### Server ➔ Client Events

```typescript
// Incoming message event
interface NewMessagePayload {
  id: string | number;
  tempId?: string | null;
  message: string;
  file?: string | null;
  sender_id: number;
  receiver_id: number;
  chat_id: string;
  is_read: boolean;
  isEdited?: boolean;
  message_type: 'text' | 'image' | 'file';
  createdAt: string;
}

// Peer presence event
interface UserStatusPayload {
  user_id: number | string;
  is_online: boolean;
}

// Typing indicators
interface TypingPayload {
  chat_id: string;
  sender_id: number;
}

// Read receipts
interface MessagesSeenPayload {
  chat_id: string;
  user_id: number;
}

// In-app real-time notification
interface SocketNotificationPayload {
  id: string;
  title: string;
  body: string;
  type: string;
  data: Record<string, any>;
  createdAt: string;
}
```

---

© **TheScriptCraft**. All rights reserved.
