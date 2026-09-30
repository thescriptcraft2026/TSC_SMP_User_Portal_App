# Modules & Feature Specification

This document provides a comprehensive breakdown of all screens, functional modules, user flows, and interaction models across **TheScriptCraft User Portal**.

---

## 📑 Table of Modules

1. [Authentication & Onboarding](#1-authentication--onboarding)
2. [Community Feed & Content Creation](#2-community-feed--content-creation)
3. [Books & Literature](#3-books--literature)
4. [Synopsis & Screenplay Pitching](#4-synopsis--screenplay-pitching)
5. [VisionX Showcase](#5-visionx-showcase)
6. [Contests & Creative Challenges](#6-contests--creative-challenges)
7. [Opportunities & Gig Marketplace](#7-opportunities--gig-marketplace)
8. [Real-time Chat & Direct Messaging](#8-real-time-chat--direct-messaging)
9. [Movie Reviews & Watchlist](#9-movie-reviews--watchlist)
10. [Social Graph & Connections](#10-social-graph--connections)
11. [User Profiles & Portfolio](#11-user-profiles--portfolio)
12. [Bookmarks & Wishlists](#12-bookmarks--wishlists)
13. [Notification Center](#13-notification-center)
14. [Search & Discovery](#14-search--discovery)

---

## 1. Authentication & Onboarding

### Flow & Screens

```text
SplashScreen -> OnBoarding -> Login <-> SignUp -> OTP Verification -> AddUserName -> ChooseInterests -> BioSetup -> RoleSetup -> BottomTab (Home)
```

- **Login (`src/screens/Auth/Login.tsx`)**:
  - Email/Password authentication.
  - Social Login via Google OAuth (`@react-native-google-signin/google-signin`).
  - Biometric sign-in option for returning sessions.
- **SignUp (`src/screens/Auth/SignUp.tsx`)**:
  - Name, Email, Password with strong password validation (Zod schema).
  - Triggers email OTP verification.
- **OTP Verification (`src/screens/Auth/OtpVerification.tsx`)**:
  - 6-digit OTP entry with auto-focus and resend timer.
- **Profile Initialization Sequence**:
  - **AddUserName**: Real-time username availability check (`/auth/available-usernames/:username`).
  - **ChooseInterests**: Multi-select genre tags for customized feed curation.
  - **BioSetup**: Creator bio and personal introduction statement.
  - **RoleSetup**: Select primary role (e.g. _Screenwriter_, _Director_, _Novelist_) and secondary creative crafts.

---

## 2. Community Feed & Content Creation

### Features & Screens

- **HomeScreen (`src/screens/Home/`)**:
  - Infinite scroll feed containing:
    - User posts (text, single/multiple images, videos).
    - Sponsored banner ads & announcements.
    - Suggested creator cards ("People you may know").
    - Trending Books, Contests, and Opportunities carousels.
- **Post Actions**:
  - Multi-reaction likes (Heart, Clap, Fire, etc.).
  - Comments with rich text and timestamps.
  - Reposting: Repost an existing post or synopsis with additional creator commentary.
  - Share via system sheet or external platforms (Instagram, Twitter, TikTok, Facebook).
- **AddPost (`src/components/Post/AddPost.tsx`)**:
  - Multi-media picker (images/videos from gallery or camera).
  - Hashtag and `@mention` auto-completion.
  - Multipart form upload directly to `/content`.
- **SinglePostScreen (`src/components/Post/SinglePostScreen.tsx`)**:
  - Full post view with comments thread, deep-link target.
- **ImageViewerScreen (`src/components/Post/ImageViewerScreen.tsx`)**:
  - Full-screen pinch-to-zoom and pan image viewer (`react-native-image-zoom-viewer`).

---

## 3. Books & Literature

### Screens

- **AllBooks (`src/screens/Books/AllBooks.tsx`)**:
  - Paginated list of published literary works.
  - Filter by genre, search by title/author, sort by _recent_, _popular_, or _rating_.
- **BookDetails (`src/screens/Books/BookDetails.tsx`)**:
  - Book cover, synopsis, author bio, genre tags.
  - Average star rating & submit user rating.
  - PDF preview / read online / download capability.
  - "Similar Books" recommendation carousel.
- **AddBook / EditBook (`src/screens/Books/AddBook.tsx`, `EditBook.tsx`)**:
  - Book cover upload, PDF manuscript attachment, synopsis, genre categorization, copyright declaration.

---

## 4. Synopsis & Screenplay Pitching

### Screens

- **AllSynopsis (`src/screens/Synopsis/AllSynopsis.tsx`)**:
  - Screenplay treatments, loglines, and story pitches.
- **SynopsisDetails (`src/screens/Synopsis/SynopsisDetails.tsx`)**:
  - Logline, full plot treatment, character breakdowns, target genre, tone, target audience.
  - Community rating and review system.
- **AddSynopsis (`src/screens/Synopsis/AddSynopsis.tsx`)**:
  - Rich text editor (`@chaitrabhairappa/react-native-rich-text-editor`) for formatted pitches.
  - Tagging and NDA/confidentiality declaration.

---

## 5. VisionX Showcase

### Screens

- **AllVisionX (`src/screens/VisionX/AllVisionX.tsx`)**:
  - Dedicated creative gallery showcasing visual storytelling, concept art, mood boards, and visual pitches.
- **SingleVisionXDetails (`src/screens/VisionX/SingleVisionXDetails.tsx`)**:
  - Media display with full project overview.
- **AddVisionX (`src/screens/VisionX/AddVisionX.tsx`)**:
  - Upload artwork, storyboards, and mood-board reels with descriptive narrative text.

---

## 6. Contests & Creative Challenges

### Screens & Features

- **AllContest (`src/screens/Contest/AllContest.tsx`)**:
  - Live, upcoming, and past writing competitions.
  - Banner highlights, category filtering, and prize pool displays.
- **ContestDetails (`src/screens/Contest/ContestDetails.tsx`)**:
  - Header showcasing contest title, category badge, and countdown timer.
  - Rules, timeline, eligibility criteria, submission format, and prize breakdown.
  - **Dynamic Participation Logic**:
    - Supports `submission_limit_type` (`"single"` or `"multiple"`).
    - If `submission_limit_type === 'single'`, the button disables and displays _"Already Participated"_ after the first entry.
    - If `submission_limit_type === 'multiple'`, users can submit additional entries while the contest remains active.
    - Accurately disables button when contest is in _"Contest Ended"_ or _"Contest Not Started"_ states.
- **ParticipateNow (`src/screens/Contest/ParticipateNow.tsx`)**:
  - Form inputs: Entry Title, PDF/DOCX manuscript upload, Logline / Story synopsis, and Genre selector.
  - Primary CTA: _"Enter Contest"_ with dynamic loading state.
- **ReviewSubmission & SuccessScreen (`src/screens/Contest/ReviewSubmission.tsx`, `SuccessScreen.tsx`)**:
  - Pre-submission summary review screen.
  - Success confirmation animation with countdown timer.
  - Auto-navigation or manual _"Go to Contest"_ button uses `navigation.pop(2)` to smoothly return back to the active `ContestDetails` view.
- **ViewAllSubmissions & ContestWinnerPodium (`src/screens/Contest/ViewAllSubmissions.tsx`)**:
  - Ranked participant leaderboard with animated winner podiums (`ContestWinnerPodium`).

---

## 7. Opportunities & Gig Marketplace

### Screens

- **Opportunity (`src/screens/Opportunity/Opportunity.tsx`)**:
  - Job board for creative positions (e.g. _Screenwriters needed for Indie Feature_, _Script Doctoring_, _Voice Actor Wanted_).
  - Source filters: All, Internal, Verified Studios.
- **SingleOpportunityDetails (`src/screens/Opportunity/SingleOpportunityDetails.tsx`)**:
  - Company/Studio info, job description, budget/compensation, deadline, required skills.
- **ApplyOpportunity (`src/screens/Opportunity/ApplyOpportunity.tsx`)**:
  - Attach portfolio links, resume PDF, cover note, and work samples.
- **ViewMyOpportunitySubmisiions (`src/screens/Opportunity/ViewMyOpportunitySubmisiions.tsx`)**:
  - Track application status (Pending, Under Review, Shortlisted, Rejected).

---

## 8. Real-time Chat & Direct Messaging

### Screens

- **ChatListScreen (`src/screens/Chat/ChatListScreen.tsx`)**:
  - Recent conversations list with online status indicator, last message preview, unread count badge, and search filter.
  - Suggested users carousel to initiate direct chats.
- **ChatRoomScreen (`src/screens/Chat/ChatRoomScreen.tsx`)**:
  - Real-time chat powered by Socket.IO:
    - Live message bubbles with sender/receiver alignment.
    - Media attachments (images/documents).
    - Real-time typing indicators (`User is typing...`).
    - Blue checkmarks for `messages_seen`.
    - Edit message inline and delete message option.

---

## 9. Movie Reviews & Watchlist

### Screens

- **Movie (`src/screens/Movie/Movie.tsx`)**:
  - Directory of films, indie productions, and documentaries.
  - Filters by genre and review category.
- **SingleMovieDetails (`src/screens/Movie/SingleMovieDetails.tsx`)**:
  - Trailer player (`react-native-youtube-iframe`), cast & crew, synopsis.
  - Critic and community reviews.
  - Add to watchlist and rate with star ratings.

---

## 10. Social Graph & Connections

### Features & Helpers

- **MyConnections (`src/screens/Profile/MyConnections.tsx`)**:
  - Three-tab interface:
    1. **Connections (Friends)**: Mutual accepted connections.
    2. **Followers**: Users following your profile.
    3. **Following**: Creators you follow.
- **Connection Requests**:
  - Inbound pending requests list with **Accept** and **Reject** actions.
- **Recommendation Engine**:
  - Discovers peers based on shared genres and roles.

---

## 11. User Profiles & Portfolio

### Screens

- **ProfileScreen (`src/screens/Profile/ProfileScreen.tsx`)**:
  - User header with Avatar, Cover Photo, Bio, Social Links, and Follow/Connect buttons.
  - Content Tabs:
    - **Posts**: Created social posts.
    - **Books**: Published books.
    - **Synopsis**: Pitched screenplays.
    - **VisionX**: Visual showcases.
    - **Opportunities**: Gigs posted by the user.
- **EditProfileScreen (`src/screens/Profile/EditProfileScreen.tsx`)**:
  - Upload avatar / cover photo (`/profile/picture`, `/profile/cover-photo`).
  - Edit name, phone, location, portfolio website, and social handles.
- **RoleEditScreen & AddExperience (`src/screens/Profile/components/RoleEditScreen.tsx`)**:
  - Manage Primary & Secondary roles.
  - Add past project credits, years of experience, and industry awards.
- **PrivacySettings & ProfileSetting (`src/screens/Profile/PrivacySettings.tsx`)**:
  - Manage visibility (Public / Private profile), direct message permissions, email notifications.

---

## 12. Bookmarks & Wishlists

### Screen

- **BookMarks (`src/screens/BookMark/BookMarks.tsx`)**:
  - Centralized vault organizing saved items into tabs:
    - Saved Books
    - Saved Synopsis & Pitches
    - Saved Contests
    - Saved Opportunities
    - Saved Movie Reviews

---

## 13. Notification Center

### Screen

- **NotificationScreen (`src/screens/Notification/Notification.tsx`)**:
  - Consolidated activity feed:
    - Connection requests & acceptances
    - Post likes, comments, and mentions
    - Contest deadlines & results
    - Direct messages
    - System announcements
  - Tap any notification to deep-navigate to the associated entity.

---

## 14. Search & Discovery

### Screen

- **SearchScreen (`src/screens/Search/SearchScreen.tsx`)**:
  - Global omni-search with debounced queries.
  - Category segmentation: Users, Posts, Books, Synopsis, Opportunities, and Contests.

---

© **TheScriptCraft**. All rights reserved.
f