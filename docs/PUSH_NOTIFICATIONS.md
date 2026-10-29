# Push Notifications Implementation Guide

The mobile app uses **Firebase Cloud Messaging (FCM)** and **Notifee** for reliable Android and iOS push notifications with deep linking support across all application states (foreground, background, and cold start / terminated).

---

## 1. Device Token Registration

Authenticated mobile clients automatically register and refresh their FCM device tokens with the backend via:

```http
POST /auth/fcm-token
```

### Request Headers
```http
Authorization: Bearer <user_access_token>
Content-Type: application/json
```

### Request Body
```json
{
  "fcm_token": "fcm_device_token_string",
  "platform": "android",
  "app_version": "1.10.3",
  "installation_id": "unique_installation_id"
}
```

* `platform`: `"android"` or `"ios"`.
* `installation_id`: Unique client UUID stored locally to track multiple device installations per user.
* **Backend Requirement**: Upsert token by `(userId, installation_id)` or `(fcm_token)`. Deactivate invalid tokens returned with `messaging/registration-token-not-registered`.

---

## 2. Notification Channels (Android)

* **Channel ID**: `default`
* **Name**: `Default Channel`
* **Importance**: High (`AndroidImportance.HIGH`)
* **Sound**: `default`
* **Vibration**: Enabled

---

## 3. Admin Dashboard Push Notification Payloads

When an administrator sends a push notification through the Admin Dashboard, the backend can send using **Firebase Admin SDK (Node.js)** or FCM REST API v1.

Both **Standard Notifications** (`notification` + `data`) and **Data-Only Messages** (`data`) are fully supported by the app.

### 3.1 Recommended Standard Payload (Notification + Data)
```json
{
  "notification": {
    "title": "New Contest Live!",
    "body": "Submit your screenplay for the 2026 ScriptCraft Challenge.",
    "image": "https://thescriptcraft.com/uploads/contest-banner.jpg"
  },
  "data": {
    "title": "New Contest Live!",
    "body": "Submit your screenplay for the 2026 ScriptCraft Challenge.",
    "image": "https://thescriptcraft.com/uploads/contest-banner.jpg",
    "type": "contest_created",
    "contest_id": "CONTEST_UUID",
    "deep_link": "https://thescriptcraft.com/contest/CONTEST_UUID"
  },
  "android": {
    "notification": {
      "channel_id": "default",
      "icon": "ic_notification",
      "color": "#F6A500",
      "sound": "default"
    }
  },
  "apns": {
    "payload": {
      "aps": {
        "sound": "default",
        "badge": 1
      }
    },
    "fcm_options": {
      "image": "https://thescriptcraft.com/uploads/contest-banner.jpg"
    }
  }
}
```

---

## 4. Supported Deep Link & Entity Formats

When a user taps a notification, the app parses the `deep_link` or synthesizes one from `(type, id)`:

| Notification Target | Supported `type` | Entity ID Key | Deep Link Example |
| :--- | :--- | :--- | :--- |
| **Contest Details** | `contest`, `contest_created` | `contest_id` or `id` | `https://thescriptcraft.com/contest/{id}` or `tsc://contest/{id}` |
| **All Contests List** | `contests` | - | `tsc://contests` |
| **Job / Opportunity** | `opportunity`, `opportunity_created` | `opportunity_id` or `id` | `https://thescriptcraft.com/opportunity/{id}` or `tsc://opportunity/{id}` |
| **All Opportunities** | `opportunities` | - | `tsc://opportunities` |
| **Post Details** | `post`, `post_created`, `post_liked` | `post_id` or `id` | `https://thescriptcraft.com/post/{id}` or `tsc://post/{id}` |
| **Book Details** | `book`, `book_created` | `book_id` or `id` | `https://thescriptcraft.com/book/{id}` or `tsc://book/{id}` |
| **All Books List** | `books` | - | `tsc://books` |
| **Movie Details** | `movie`, `movie_review` | `movie_id` or `id` | `https://thescriptcraft.com/movie/{id}` or `tsc://movie/{id}` |
| **All Movies List** | `movies` | - | `tsc://movies` |
| **Synopsis Details** | `synopsis`, `synopsis_created` | `synopsis_id` or `id` | `https://thescriptcraft.com/synopsis/{id}` or `tsc://synopsis/{id}` |
| **VisionX Details** | `visionx`, `vision_created` | `visionx_id` or `id` | `https://thescriptcraft.com/visionx/{id}` or `tsc://visionx/{id}` |
| **User Profile** | `profile`, `user` | `username` or `userId` | `https://thescriptcraft.com/profile/{username}` or `tsc://profile/{username}` |
| **Notifications Screen** | `notification`, `announcement` | - | `tsc://notification` |
| **Chat Room** | `chat`, `chat_message` | `chat_id` or `roomId` | `tsc://chat/{chatId}` |

---

## 5. Delivery and Lifecycle Handling

1. **Foreground (App is open and in use)**:
   * Android: Displays a rich heads-up banner via Notifee (`BIGPICTURE` if image is present, with sound and vibration).
   * iOS: Displayed directly as a banner via `UNUserNotificationCenter`.
   * Tapping the banner triggers immediate navigation to the target screen.

2. **Background (App is minimized or screen locked)**:
   * System tray displays the notification.
   * Tapping the notification brings the app to foreground and navigates directly to the target screen via `onNotificationOpenedApp`.

3. **Terminated / Cold Start (App was killed / swiped away)**:
   * Both `messaging().getInitialNotification()` and `notifee.getInitialNotification()` are evaluated on launch.
   * Destination link is stored in `deepLinkStore`.
   * Once the session is verified in `SplashScreen`, the app automatically navigates to the target screen.
   * If an unauthenticated user opens the notification and logs in, `Login.tsx` preserves and executes the pending deep link upon successful login.

4. **Logout**:
   * Calling `logoutUser()` automatically invokes `clearFcmToken()` (`messaging().deleteToken()`) to detach the device from previous private user alerts.

---

## 6. Backend Example (Node.js Firebase Admin SDK)

```javascript
const admin = require('firebase-admin');

/**
 * Send an Admin Campaign Push Notification
 * @param {string[]} fcmTokens - Array of recipient FCM device tokens
 * @param {Object} payload - Notification data
 */
async function sendAdminPushNotification(fcmTokens, { title, body, imageUrl, deepLink, type, entityId }) {
  const message = {
    notification: {
      title,
      body,
      ...(imageUrl ? { imageUrl } : {}),
    },
    data: {
      title,
      body,
      ...(imageUrl ? { image: imageUrl } : {}),
      deep_link: deepLink || '',
      type: type || 'announcement',
      ...(entityId ? { id: String(entityId) } : {}),
    },
    android: {
      notification: {
        channelId: 'default',
        icon: 'ic_notification',
        color: '#F6A500',
        sound: 'default',
        priority: 'high',
        ...(imageUrl ? { imageUrl } : {}),
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
      ...(imageUrl ? {
        fcmOptions: {
          image: imageUrl,
        },
      } : {}),
    },
    tokens: fcmTokens,
  };

  const response = await admin.messaging().sendEachForMulticast(message);
  console.log(`Sent: ${response.successCount} succeeded, ${response.failureCount} failed.`);
  return response;
}
```
