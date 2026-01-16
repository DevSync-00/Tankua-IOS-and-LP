# Tankua - Ethiopian Church Trip Booking App

A comprehensive mobile application for booking church trips in Ethiopia with integrated pickup station selection, powered by Supabase.

## Features

### User Features
- **Church Discovery**: Browse churches in list, grid, or map view
- **Trip Booking**: Complete 6-step booking flow
  - Select trip type (Group, Private, Holiday)
  - Choose date from calendar
  - **Select pickup station** with list and interactive map views
  - Choose seats or vehicle type
  - Multiple payment methods (Telebirr, CBE Birr, Amole, Chapa)
  - Get QR code ticket
- **Trip Management**: View upcoming and past trips
- **Profile**: Manage personal info, saved churches, and stations
- **Bilingual**: Amharic (primary) and English

### Admin Features
- Manage churches, trips, and pickup stations
- Assign pickup stations to trips with custom times
- Driver management
- Booking management
- Push announcements
- Statistics dashboard

## Tech Stack

- **Frontend**: React Native (Expo)
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Phone OTP)
- **Maps**: React Native Maps
- **Navigation**: React Navigation
- **State Management**: Context API

## Design

- **Primary Color**: Gold (#D4A017)
- **Secondary Color**: Deep Blue (#0A1A2F)
- **Clean spiritual aesthetic**
- **Ethiopian church iconography**

## Installation

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Supabase account (free tier available)

### Setup Steps

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd tankua
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase** (Full guide in `doc/SUPABASE_SETUP.md`)
   - Create a Supabase project at https://supabase.com/
   - Copy your Project URL and anon key
   - Update `src/config/supabase.js` with your credentials
   - Run the SQL scripts to create tables
   - Enable Phone authentication
   - Seed sample data

4. **Configure Google Maps API**
   - Get an API key from Google Cloud Console
   - Add to `app.json`:
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

5. **Run the app**
```bash
npm start
```

Then:
- Press `a` for Android
- Press `i` for iOS
- Scan QR code with Expo Go app

## Documentation

All documentation files are located in the `doc/` folder:

- **[doc/SUPABASE_SETUP.md](doc/SUPABASE_SETUP.md)** - Complete Supabase setup guide with SQL scripts
- **[doc/INSTALLATION.md](doc/INSTALLATION.md)** - Detailed installation instructions
- **[doc/PROJECT_STRUCTURE.md](doc/PROJECT_STRUCTURE.md)** - Code architecture and file organization
- **[doc/FEATURES.md](doc/FEATURES.md)** - Complete feature list
- **[doc/QUICK_START.md](doc/QUICK_START.md)** - Quick start guide
- **[doc/PAYMENT_SETUP.md](doc/PAYMENT_SETUP.md)** - Payment gateway setup (Chapa & Telebirr)
- **[doc/PAYMENT_DEADLINE_SETUP.md](doc/PAYMENT_DEADLINE_SETUP.md)** - Payment deadline system setup
- **[doc/EXPO_CONNECTION_TROUBLESHOOTING.md](doc/EXPO_CONNECTION_TROUBLESHOOTING.md)** - Expo Go connection troubleshooting

## Database Schema

### Main Tables
- **users**: User profiles and preferences
- **churches**: Ethiopian churches with locations
- **trips**: Available trips to churches
- **pickup_stations**: Pickup locations with coordinates
- **trip_pickup_stations**: Links stations to trips (many-to-many)
- **bookings**: User bookings with QR codes
- **drivers**: Driver information

See `doc/SUPABASE_SETUP.md` for complete schema and SQL scripts.

## Key Features Highlighted

### Pickup Station Selection
The app features a sophisticated pickup station selection system:
- **List View**: Scrollable list of stations with details
- **Map View**: Interactive map with station markers
- **Station Info**: Name, city, pickup time, distance, extra price
- **Nearest Station**: Automatically highlighted
- **Selection State**: Visual feedback for selected station
- **Toggle Views**: Smooth transition between list and map

### Booking Flow
1. Select church from discovery screen
2. Choose trip type (Group/Private/Holiday)
3. Pick date from calendar
4. **Select pickup station (list or map)**
5. Choose seats or vehicle
6. Select payment method
7. Get confirmation with QR ticket

## Testing

### Test Credentials (Development)
- **Phone**: `+251900000000`
- **OTP**: `123456`

(Add test phone number in Supabase Authentication → Providers → Phone)

### Make Admin User
1. Login with test account
2. Go to Supabase Dashboard → Table Editor → users
3. Find your user and set `is_admin = true`
4. Restart app to see Admin tab

## Screenshots

(Add screenshots here)

## Deployment

### Build for Android
```bash
expo build:android
```

### Build for iOS
```bash
expo build:ios
```

For production builds with EAS:
```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Payment Integration

The app includes mock payment integration for:
- Telebirr
- CBE Birr
- Amole
- Chapa

To integrate real payment gateways, update the payment handlers in `src/screens/booking/PaymentScreen.js`.

## Future Enhancements

- Real-time trip updates
- In-app chat support
- Reviews and ratings
- Social sharing
- Loyalty program
- Trip cancellation/rescheduling
- Push notifications
- Offline mode
- Driver mobile app
- Live tracking

## Support

For issues or questions:
- Check the documentation files
- Review Supabase dashboard for backend issues
- Check Expo logs for frontend errors

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Ethiopian Orthodox Tewahedo Church
- Supabase team for excellent backend platform
- Expo team for mobile development tools
- All contributors and testers

---

Built with ❤️ for Ethiopian pilgrims

**Tankua** - Your spiritual journey companion 🙏
