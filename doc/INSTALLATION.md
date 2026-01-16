# Tankua - Installation Guide

Complete guide to set up and run the Tankua Ethiopian church trip booking app.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Expo CLI** - Install globally: `npm install -g expo-cli`
- **Firebase Account** - [Sign up](https://firebase.google.com/)
- **Android Studio** (for Android development) or **Xcode** (for iOS development, macOS only)

## Step 1: Clone the Project

```bash
# If you have git repository
git clone <your-repo-url>
cd tankua

# Or if starting from scratch, you're already in the project directory
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React Native & Expo
- React Navigation
- Firebase SDK
- React Native Maps
- QR Code generation
- And more...

## Step 3: Firebase Setup

### 3.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: "Tankua" (or your preferred name)
4. Follow the setup wizard

### 3.2 Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable **Phone** authentication
4. Configure your authentication settings

### 3.3 Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create Database"
3. Start in **test mode** (for development)
4. Choose your preferred location

### 3.4 Apply Security Rules

1. Go to **Firestore Database → Rules**
2. Copy the security rules from `FIREBASE_SETUP.md`
3. Paste and **Publish**

### 3.5 Create Required Indexes

1. Go to **Firestore Database → Indexes**
2. Create these composite indexes:
   - Collection: `bookings`
     - Fields: `userId` (Ascending), `createdAt` (Descending)
   - Collection: `tripPickupStations`
     - Fields: `tripId` (Ascending), `createdAt` (Ascending)

### 3.6 Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the **Web** icon (</>)
4. Register your app
5. Copy the Firebase configuration object

### 3.7 Update Firebase Config

1. Open `src/config/firebase.js`
2. Replace the placeholder values with your Firebase config:

```javascript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 4: Configure Google Maps (for Map Features)

### For Android:

1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Open `app.json`
3. Add the API key:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      }
    }
  }
}
```

### For iOS:

Add the API key to `app.json`:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

## Step 5: Add Assets (Icons & Images)

Create the following assets in the `assets` folder:

- `icon.png` (1024x1024) - App icon
- `splash.png` (1284x2778) - Splash screen
- `adaptive-icon.png` (1024x1024) - Android adaptive icon
- `favicon.png` (48x48) - Web favicon
- `notification-icon.png` (96x96) - Notification icon

You can use placeholder images initially or create custom ones with Ethiopian/spiritual themes.

## Step 6: Run the Application

### Start the Development Server

```bash
npm start
```

This will open the Expo Developer Tools in your browser.

### Run on Android

```bash
# Using Expo Go app (recommended for testing)
npm run android

# Or scan the QR code with Expo Go app
```

### Run on iOS (macOS only)

```bash
npm run ios
```

### Run on Web

```bash
npm run web
```

## Step 7: Testing the App

### Create Test Data

1. Sign up with a phone number
2. The app will work with mock data initially
3. For production, seed your Firestore with real church data

### Test User Flow

1. Complete onboarding
2. Browse churches (list/grid/map views)
3. Select a church and view details
4. Book a trip:
   - Select trip type
   - Choose date
   - **Select pickup station** (with map view)
   - Choose seats/vehicle
   - Complete payment (mock)
   - Get QR ticket
5. View your trips
6. Check profile settings

### Test Admin Features

1. Create an admin user in Firestore:
   ```javascript
   // In users collection
   {
     ...userFields,
     isAdmin: true
   }
   ```
2. Login with admin account
3. Access Admin tab in bottom navigation

## Step 8: Build for Production

### Android APK

```bash
expo build:android
```

### iOS IPA

```bash
expo build:ios
```

### Standalone App

For production apps, consider using EAS Build:

```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

## Troubleshooting

### Common Issues

**1. Firebase Connection Error**
- Verify Firebase config is correct
- Check internet connection
- Ensure Firestore is enabled

**2. Maps Not Showing**
- Verify Google Maps API key
- Enable Maps SDK for Android/iOS in Google Cloud Console
- Check billing is enabled for Google Cloud project

**3. Phone Authentication Not Working**
- For development, use the mock authentication
- For production, configure Firebase phone auth properly
- Add authorized domains in Firebase console

**4. Package Installation Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm cache clean --force
npm install
```

**5. Expo Go Connection Issues**
- Ensure phone and computer are on same network
- Try restarting Expo server
- Clear Expo Go cache

## Environment Configuration

For different environments (development, staging, production), create:

- `.env.development`
- `.env.staging`
- `.env.production`

Example `.env` file:
```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
GOOGLE_MAPS_API_KEY=your_maps_key
```

## Next Steps

1. **Add Real Data**: Populate Firestore with actual Ethiopian churches
2. **Integrate Real Payments**: Connect Telebirr, CBE Birr, Amole, Chapa APIs
3. **Add Push Notifications**: Configure Expo notifications
4. **Improve UI**: Add custom fonts, animations
5. **Add More Features**: Reviews, ratings, chat support
6. **Testing**: Write unit and integration tests
7. **Deploy**: Publish to App Store and Play Store

## Support

For issues or questions:
- Check `README.md` for general information
- See `FIREBASE_SETUP.md` for database schema details
- Review code comments in source files

## License

MIT License - See LICENSE file for details

