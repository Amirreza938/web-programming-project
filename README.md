# DejaNew Project - Features and Requirements

Every item feels “already seen… but brand‑new to you.

## Table of Contents

1. [Overview](#overview)
2. [User Profile - "my DejaNew"](#User-Profile---my-DejaNew)
   * [Authentication and Security](#authentication-and-security)
        * [Authentication flow](#User-Registration-and-Authentication-Flow)
   * [Profile Management](#profile-management)
   * [My Advertisements](#my-advertisements-آگهیهای-من)
   * [Bookmarks](#bookmarks-نشانها)
   * [Notes](#notes-یادداشتها)
   * [Recent Activities](#recent-activities-بازدیدهای-اخیر)
   * [Professional Divar](#professional-divar-دیوار-حرفهای)
   * [Security and Privacy](#security-and-privacy-مقابله-با-مزاحمت-و-کلاهبرداری)
   * [Settings](#settings-تنظیمات)
3. [Chat Page](#chat-page)
   * [chat flow](#Chat-Flow)

## Overview

This project aims to implement a comprehensive online platform modeled after the DejaNew (Divar) application. The platform allows users to buy and sell second-hand items across various categories, ensuring user-friendly interactions, intuitive navigation, and secure transactions.


## User Profile - "my DejaNew"

### Authentication and Security

* User Registration
* Login and Logout with seamless session handling
* Password Reset and Recovery
* Mobile Number Verification
* Identity Verification (تایید هویت) required for posting advertisements
* Active Sessions Management for enhanced account security

##### User Registration and Authentication Flow

1. User visits registration page
2. User fills out registration details
3. Mobile number verification via SMS
4. User logs in
5. User completes "تایید هویت" (Identity Verification)

### Profile Management

* Edit profile and update contact details
* Personal Information

### My Advertisements ("آگهی‌های من")

* View and manage user's advertisements

  * All advertisements ("همه")

    * Option to post new ads ("ثبت آگهی")
  * Active advertisements ("فعال")
  * Incomplete advertisements ("نیمه کاره")

    * Interface for completing and publishing partially created ads
  * Inactive advertisements ("غیرفعال")

### Bookmarks ("نشان‌ها")

* Bookmark advertisements for later reference
* Bookmark management (view, remove)

### Notes ("یادداشت‌ها")

* Add private notes to advertisements
* Notes management (create, edit, delete)

### Recent Activities ("بازدیدهای اخیر")

* Track and manage recently viewed advertisements

### Professional Divar ("دیوار حرفه‌ای")

* Business-focused account upgrade
* Premium features and analytics

### Security and Privacy ("مقابله با مزاحمت و کلاهبرداری")

* User guidelines for avoiding scams
* Reporting and blocking problematic interactions

### Settings ("تنظیمات")

* Account Security (Password changes, Two-factor authentication)
* Notification Preferences (Push, SMS, Email Notifications)
* Privacy settings (Visibility, blocking users, data management)
* City Selection ("شهر من")
* Theme Selection (Dark/Light Mode)
* Notification Management:

  * Toggle Notifications (Show Notifications: On/Off)
  * Notification Sounds (On/Off)
  * Vibration Notifications (On/Off)
* Suggested Ads (Toggle based on search history)
* History Management:

  * Delete All Visits
  * Delete All Notes
  * Delete All Bookmarks
  * Delete All Search History
* Chat Settings:

  * Display Name Management
  * Toggle Inactive Chats (Show Inactive Chats: On/Off)
  * Toggle Disabled Chats (Show Disabled Chats: On/Off)
  * Suspicious Chats Management (Automatically place suspicious chats in a dedicated section: On/Off)



## Chat Page

* Initial setup: User enters display chat name for the first time.
* Two main subpages:

  * Anonymous Calls ("تماس ناشناس"): Displays anonymous calls if enabled.
  * Divar Chat ("چت دیوار"):

    * Filtering options (Unread, My Ads, Others' Ads)
* Mini settings panel:

  * Set availability hours ("ساعات پاسخگویی")
  * Quick access to main chat settings page


### Chat Flow

1. User navigates to the chat page
2. Sets chat display name (initial visit only)
3. Chooses between "تماس ناشناس" or "چت دیوار"
4. Manages chats using filtering options
5. Adjusts settings and response hours as needed


---


## DejaNew API Endpoints

This section provides an overview of all the API endpoints used to support the DejaNew second-hand store platform (a Divar-like clone). These endpoints are grouped based on their functionality and mapped to user-visible features.

---

### Authentication & Identity Verification

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/auth/register/` | User registration |
| POST   | `/api/auth/login/` | Login and return access token |
| POST   | `/api/auth/logout/` | Logout and invalidate token |
| POST   | `/api/auth/verify-phone/` | Verify mobile number via SMS |
| POST   | `/api/auth/request-reset/` | Request password reset |
| POST   | `/api/auth/reset-password/` | Confirm password reset |
| GET    | `/api/auth/sessions/` | List all active sessions |
| DELETE | `/api/auth/sessions/<id>/` | Terminate a session |
| POST   | `/api/auth/verify-identity/` | Submit identity verification info |

---

### Profile Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/profile/` | View user profile |
| PUT    | `/api/profile/` | Update profile info |
| GET    | `/api/profile/public/<user_id>/` | View public profile (optional) |

---

### Advertisements

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/ads/` | List all ads (with filters) |
| POST   | `/api/ads/` | Create a new ad |
| GET    | `/api/ads/<id>/` | View ad details |
| PUT    | `/api/ads/<id>/` | Update an ad |
| DELETE | `/api/ads/<id>/` | Delete an ad |
| GET    | `/api/ads/my/` | List my ads (active, draft, inactive) |
| POST   | `/api/ads/<id>/publish/` | Publish an incomplete ad |
| POST   | `/api/ads/<id>/deactivate/` | Deactivate an ad |

---

### Bookmarks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/bookmarks/` | List bookmarked ads |
| POST   | `/api/bookmarks/` | Add a new bookmark |
| DELETE | `/api/bookmarks/<ad_id>/` | Remove a bookmark |

---

### Notes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/notes/` | List notes on ads |
| POST   | `/api/notes/` | Add a note |
| PUT    | `/api/notes/<id>/` | Edit a note |
| DELETE | `/api/notes/<id>/` | Delete a note |

---

### Recent Activities

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/activities/recent/` | List recently viewed ads |
| DELETE | `/api/activities/clear/` | Clear all recent activities |

---

### Professional Features

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/professional/upgrade/` | Request professional upgrade |
| GET    | `/api/professional/status/` | Check professional account status |

---

### Security & Privacy

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/security/report/` | Report scam or abuse |
| POST   | `/api/security/block-user/` | Block another user |
| GET    | `/api/security/blocked-users/` | List blocked users |

---

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PUT | `/api/settings/account/` | Change password, enable 2FA |
| GET/PUT | `/api/settings/notifications/` | Notification preferences |
| GET/PUT | `/api/settings/privacy/` | Privacy and visibility |
| GET/PUT | `/api/settings/theme/` | Toggle dark/light mode |
| GET/PUT | `/api/settings/city/` | Set preferred city |
| POST    | `/api/settings/history/clear/` | Clear visit/search/bookmark history |
| GET/PUT | `/api/settings/chat/` | Chat-specific settings |

---

### Chat System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/chat/conversations/` | List all conversations |
| GET    | `/api/chat/conversations/<id>/` | Get messages in a conversation |
| POST   | `/api/chat/send-message/` | Send a message |
| POST   | `/api/chat/set-display-name/` | Set or update chat display name |
| GET/PUT| `/api/chat/settings/` | Update chat availability, filters |
| GET    | `/api/chat/suspicious/` | List suspected spam chats |
| GET    | `/api/chat/unread/` | List unread chats |
| GET    | `/api/chat/my-ads/` | Filter chat by user’s ads |
| GET    | `/api/chat/others-ads/` | Filter chat by other ads |
| DELETE | `/api/chat/<id>/` | Delete chat (optional, soft-delete) |


