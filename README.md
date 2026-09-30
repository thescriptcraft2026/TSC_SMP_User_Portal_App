# TheScriptCraft (TSC) - User Portal Mobile Application

[![React Native](https://img.shields.io/badge/React%20Native-0.84.0-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.11.2-764ABC?logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.3-010101?logo=socketdotio&logoColor=white)](https://socket.io/)
[![Firebase](https://img.shields.io/badge/Firebase-FCM%20%7C%20Analytics-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

**TheScriptCraft (TSC) User Portal** is a production-grade, full-featured mobile application built for screenwriters, storytellers, filmmakers, authors, and creative industry professionals. The platform facilitates content sharing, screenplay pitching, contest participation, creative industry job opportunities, book publishing, community networking, and real-time end-to-end messaging.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [Directory Structure](#-directory-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Environment Configuration](#-environment-configuration)
- [Deep Linking & Universal Links](#-deep-linking--universal-links)
- [Real-time & Push Notifications](#-real-time--push-notifications)
- [Detailed Documentation Index](#-detailed-documentation-index)
- [Scripts Reference](#-scripts-reference)

---

## 🌟 Key Features

| Category | Description |
| :--- | :--- |
| **Authentication & Profile Setup** | Email & Password, Google OAuth, OTP verification, multi-step onboarding, role tagging (Primary/Secondary), experience portfolio, avatar/cover photo upload. |
| **Rich Community Feed** | Social feed with rich text, image/video uploads, custom tags, user mentions, reposting, multi-type emoji reactions, and comment nesting. |
| **ScriptCraft Synopsis & Pitching** | Pitch screenplays and story treatments with category-specific metadata, privacy toggles, custom tags, and community rating. |
| **Books & Publications** | Browse, create, edit, and read books with chapter view, download options, ratings, and genre filtering. |
| **VisionX Showcase** | Dedicated visual storytelling canvas and creative project showcase. |
| **Contests & Challenges** | Interactive writing competitions, submission uploading, judge/community rating, leaderboard, and dynamic winner podiums. |
| **Opportunity & Job Board** | Industry gig marketplace: post job openings, apply with resumes/pitch decks, and track applicant submission status. |
| **Direct Messaging & Chat** | Real-time 1-on-1 chat with Socket.IO: typing indicators, online/offline status, message read receipts, image/file attachments, message edit/delete. |
| **Movie Reviews & Watchlist** | Movie reviews database, community ratings, trailer embeds, and watchlist management. |
| **Connections & Social Graph** | Friend requests (send/accept/reject), follow/unfollow creators, and smart user recommendation engine. |
| **Notifications & Updates** | Foreground & background push notifications via Firebase Cloud Messaging (FCM) + Notifee, in-app notification center, and in-app forced update management. |

---

## 🏗 Tech Stack & Architecture

- **Core Framework**: React Native `0.84.0`, React `19.2.3`
- **Language**: TypeScript `5.8.3`
- **State Management**: Redux Toolkit `2.11.2` (22 modular slices)
- **Navigation**: React Navigation v7 (`@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`, Custom Gesture Drawer)
- **Real-time Layer**: Socket.IO Client `4.8.3` with reconnection management
- **Networking & API**: Axios `1.13.5` with automatic token refresh (`/auth/refresh-token`) interceptors
- **Push Notifications**: `@react-native-firebase/messaging` + `@notifee/react-native`
- **Analytics**: `@react-native-firebase/analytics`
- **UI Components**: `react-native-paper`, `@gorhom/bottom-sheet`, `lottie-react-native`, `lucide-react-native`, `react-native-fast-image`, `react-native-linear-gradient`, `react-native-vector-icons`
- **Rich Media & Content**: `@chaitrabhairappa/react-native-rich-text-editor`, `react-native-video`, `react-native-youtube-iframe`, `react-native-render-html`, `react-native-image-zoom-viewer`

---

## 📂 Directory Structure

```text
TSC_SMP_User_Portal_App/
├── App.tsx                    # Root application component, providers & initialization
├── Navigator.tsx              # Root navigation stack, auth stack & deep linking config
├── navigationRef.js           # Navigation container reference for headless redirection
├── Instance/
│   └── Instance.tsx           # Axios client, auth token injection & 401 refresh interceptor
├── docs/                      # Comprehensive technical documentation
│   ├── ARCHITECTURE.md        # Architecture overview, data flow & security
│   ├── MODULES_AND_FEATURES.md# Deep dive into all feature screens & workflows
│   ├── API_AND_STATE_MANAGEMENT.md # Redux state schema, REST APIs & Sockets
│   └── SETUP_AND_DEPLOYMENT.md# Development setup, builds & releases
├── src/
│   ├── api/                   # Base API interfaces
│   ├── assets/                # Images, fonts, SVGs, Lottie animations
│   ├── components/            # Reusable UI component library (29+ modules)
│   │   ├── Cards/             # Post, Book, Contest, Opportunity cards
│   │   ├── Drawer/            # Custom lateral navigation drawer
│   │   ├── Header/            # Adaptive app headers
│   │   ├── Modals/            # Update modal, confirmation dialogs
│   │   ├── Post/              # Post creator, single post, repost viewer
│   │   └── Toast/             # Global toast provider & notifications
│   ├── constants/             # Typography and global constants
│   ├── context/               # React Contexts (SocketContext, AuthContext)
│   ├── navigation/            # Bottom tab bar and drawer navigation
│   ├── redux/                 # Redux store & 22 domain slices
│   │   ├── store.ts           # Root store & TypeScript types
│   │   └── slices/            # Domain-specific slices (auth, chat, feed, etc.)
│   ├── screens/               # Screen components grouped by domain
│   │   ├── Auth/              # Login, SignUp, OTP, ResetPassword, ProfileSetup
│   │   ├── Books/             # AllBooks, BookDetails, AddBook, EditBook
│   │   ├── Chat/              # ChatListScreen, ChatRoomScreen
│   │   ├── Contest/           # AllContests, Details, Participate, Submissions
│   │   ├── Home/              # Feed, trending items, news, suggestions
│   │   ├── Movie/             # Movie reviews, details, ratings
│   │   ├── Opportunity/       # Opportunities marketplace, apply, post
│   │   ├── Profile/           # User profile, edit, connections, experience
│   │   ├── Synopsis/          # Synopsis listing, creation, details
│   │   └── VisionX/           # VisionX stories, creation, details
│   ├── services/              # API caller services (auth, chat, contest, feed, etc.)
│   ├── theme/                 # Design tokens, color palette, ThemeProvider
│   └── utils/                 # Deep linking, date formatting, responsive layout
├── android/                   # Native Android project configuration
├── ios/                       # Native iOS project configuration & CocoaPods
├── .env                       # Active environment configuration
└── package.json               # Package manifests and dependency versions
```

---

## ⚙️ Prerequisites

Ensure your development environment meets the following requirements:

- **Node.js**: `>= 22.11.0` (as defined in `package.json` engines)
- **Package Manager**: `npm` (v10+) or `yarn` (v1.22+)
- **Android Development**:
  - Android Studio Meerkat / Ladybug
  - Android SDK (API 34 / 35, Build Tools 35.0.0)
  - Java Development Kit (JDK 17 or JDK 21)
- **iOS Development** (macOS only):
  - Xcode 15.0+ / 16.0+
  - CocoaPods (`gem install cocoapods` or `bundle install`)
  - Ruby 3.1+ (Bundler enabled)

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-org/TSC_SMP_User_Portal_App.git
cd TSC_SMP_User_Portal_App

# Install JavaScript dependencies
npm install
```

### 2. Configure Environment

Create or verify the `.env` file in the project root:

```env
# Staging API URLs (Default for testing)
API_BASE_URL=https://betatscapi.thescriptcraft.com/v1/user
SOCKET_URL=https://betatscapi.thescriptcraft.com

# Production API URLs (Uncomment for production release)
# API_BASE_URL=https://tscapi.thescriptcraft.com/v1/user
# SOCKET_URL=https://tscapi.thescriptcraft.com

# Local / Dev Tunnel URLs (For local backend debugging)
# API_BASE_URL=https://dggsgrw6-3000.inc1.devtunnels.ms/v1/user
# SOCKET_URL=https://betatscapi.thescriptcraft.com
```

### 3. Native Dependencies Setup

#### iOS Setup:
```bash
# Install CocoaPods via bundler
bundle install
bundle exec pod install --project-directory=ios
```

#### Android Setup:
Ensure your Android emulator is running or a physical device is connected via `adb devices`.

### 4. Run Development Server

```bash
# Terminal 1: Start Metro Bundler
npm start

# Terminal 2: Run Android
npm run android

# Terminal 2: Run iOS
npm run ios
```

---

## 🔗 Deep Linking & Universal Links

The app supports custom URI schemes (`tsc://`) as well as HTTPS Universal Links / App Links (`https://thescriptcraft.com` & `https://www.thescriptcraft.com`).

| Content Type | Deep Link Pattern | Target Screen |
| :--- | :--- | :--- |
| **Post** | `https://thescriptcraft.com/:username/status/:postId` | `SinglePostDetailes` |
| **Book** | `tsc://book/:id` or `https://thescriptcraft.com/book/:id` | `BookDetails` |
| **Synopsis** | `tsc://synopsis/:id` or `https://thescriptcraft.com/synopsis/:id` | `SynopsisDetails` |
| **VisionX** | `tsc://visionx/:id` or `https://thescriptcraft.com/visionx/:id` | `VisionXDetails` |
| **Contest** | `tsc://contest/:id` or `https://thescriptcraft.com/contest/:id` | `ContestDetails` |
| **Opportunity** | `tsc://opportunity/:id` or `https://thescriptcraft.com/opportunity/:id` | `SingleOpportunityDetails` |
| **Movie** | `tsc://movie/:id` or `https://thescriptcraft.com/movie/:id` | `SingleMovieDetails` |
| **Profile** | `tsc://profile/:username` or `tsc://profile/:uuid` | `Profile` |

---

## 💬 Real-time & Push Notifications

- **Real-Time Communication**: Handled via `SocketProvider` (`src/context/SocketContext.tsx`). Connects to `SOCKET_URL`, joins the personal user room, and subscribes to:
  - `new_message`: Incoming direct message
  - `user_status`: Online/offline presence changes
  - `typing` / `stop_typing`: Live typing indicators
  - `messages_seen`: Read receipt sync
  - `message_edited` / `message_deleted`: Real-time message updates
  - `notification`: Live socket notifications & badge increment
- **Push Notification Pipeline**:
  - Uses `@react-native-firebase/messaging` for token generation and background handling.
  - Automatically saves the FCM device token via `POST /auth/fcm-token`.
  - Dispatches rich local alerts with custom icons & preview images via `@notifee/react-native`.

---

## 📚 Detailed Documentation Index

Comprehensive guides are available in the [`docs/`](./docs) directory:

1. 🏛️ **[System Architecture & Design Patterns](./docs/ARCHITECTURE.md)**
   - Client-Server communication flow
   - Redux state lifecycle & store architecture
   - Axios token auto-refresh & session invalidation
   - Socket.IO & Push notification architecture
2. 📱 **[Modules & Feature Specification](./docs/MODULES_AND_FEATURES.md)**
   - Detailed functional breakdown of all 14 screens and subsystems
   - Navigation routes and params specification
   - Form schemas and validation
3. 🔌 **[API, State & Socket Specification](./docs/API_AND_STATE_MANAGEMENT.md)**
   - Redux Slices inventory (22 slices)
   - REST API endpoints reference table (HTTP methods, parameters, payloads)
   - Socket.IO event payloads & response formats
4. 🛠️ **[Setup, Build & Deployment Guide](./docs/SETUP_AND_DEPLOYMENT.md)**
   - Environment variables setup
   - Android debug/release signing & Play Store AAB generation
   - iOS CocoaPods, Xcode signing, TestFlight & App Store release
   - Troubleshooting common build & link errors

---

## 📜 Scripts Reference

| Command | Description |
| :--- | :--- |
| `npm start` | Starts Metro bundler on port `8081` |
| `npm run android` | Builds and installs the debug app on the active Android device |
| `npm run ios` | Builds and installs the debug app on the iOS Simulator |
| `npm run lint` | Runs ESLint across all TypeScript and JavaScript files |
| `npm test` | Runs Jest unit and snapshot test suites |

---

© **TheScriptCraft**. All rights reserved.
