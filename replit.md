# AIMEDCARE - AI-Powered Healthcare Assistant

## Overview
A comprehensive cross-platform mobile healthcare app built with React Native / Expo. Features AI-powered health tools, a Botpress chatbot, and a clean medical-themed UI.

## Architecture
- **Frontend**: React Native with Expo Router (file-based routing)
- **Backend**: Node.js + Express (port 5000)
- **State**: AsyncStorage for local persistence, React Context for auth
- **Navigation**: Tab-based with Stack for feature screens

## Features
1. **Authentication** - Login/Register with AsyncStorage persistence (JWT-style session)
2. **Dashboard** - 8-feature grid with teal/blue healthcare theme
3. **AI Chatbot** - Botpress webchat embedded in WebView
4. **Diet & Nutrition** - BMI, calorie & macro calculator
5. **Medical Report Analysis** - Image upload + demo analysis
6. **Doctor Finder** - Browse/search doctors by specialty
7. **Medicine Info** - Search medicine database (uses, dosage, side effects)
8. **Prescription Reminder** - Add/manage medicine reminders with AsyncStorage
9. **Mental Health Assessment** - Stress, depression & sleep questionnaires
10. **Health Risk Calculator** - Diabetes, heart, obesity risk assessors
11. **Profile** - Health data management with BMI display

## File Structure
```
app/
  _layout.tsx          # Root layout with AuthProvider, Stack nav
  index.tsx            # Loading screen (redirects after auth check)
  (auth)/
    _layout.tsx        # Auth stack layout
    login.tsx          # Login screen
    register.tsx       # Register screen
  (tabs)/
    _layout.tsx        # NativeTabs (liquid glass iOS 26+) / Classic tabs
    index.tsx          # Dashboard
    profile.tsx        # Profile/health data
  features/
    chatbot.tsx        # Botpress WebView chatbot
    diet.tsx           # Diet & Nutrition calculator
    report.tsx         # Medical report image analysis
    doctors.tsx        # Doctor search & listing
    medicine.tsx       # Medicine information database
    reminder.tsx       # Prescription reminders (AsyncStorage)
    assessment.tsx     # Mental health assessments
    risk.tsx           # Health risk calculators
context/
  auth.tsx             # Auth context with login/register/logout
constants/
  colors.ts            # Teal/blue healthcare color theme
```

## Color Theme
- Primary: `#0A7B8E` (Teal)
- Accent: `#00C4B4`
- Background: `#F5FAFB` (Off-white)
- Text: `#0F2A3D`

## Key Packages
- `react-native-webview` - For Botpress chatbot embedding
- `expo-image-picker` - For medical report image uploads
- `expo-linear-gradient` - UI gradients
- `@react-native-async-storage/async-storage` - Local data persistence

## Botpress Chatbot
Scripts used:
- `https://cdn.botpress.cloud/webchat/v3.6/inject.js`
- `https://files.bpcontent.cloud/2026/03/08/08/20260308080044-UVZ9TSBA.js`

## Running
- Backend: `npm run server:dev` (port 5000)
- Frontend: `npm run expo:dev` (port 8081)
