# DejaNew
Every item feels “already seen… but brand‑new to you.”
**DejaNew**: where pre‑loved treasures spark that “brand‑new” déjà vu.


# DejaNew Project - Features and Requirements

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
4. [Posting Advertisements](#posting-advertisements)
5. [Advertisement Management](#advertisement-management)
6. [Browsing and Searching](#browsing-and-searching)
7. [Categories and Subcategories](#categories-and-subcategories)
8. [Messaging System](#messaging-system)

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
