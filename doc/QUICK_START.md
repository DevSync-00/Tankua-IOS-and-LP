# Tankua - Quick Start with Supabase 🚀

Get your Tankua app running in **15 minutes**!

## ✅ What's Done

Your app is already set up with:
- ✅ Complete React Native UI (18 screens)
- ✅ 6-step booking flow with pickup stations
- ✅ List and Map views for stations
- ✅ Bilingual support (Amharic/English)
- ✅ QR ticket generation
- ✅ Admin dashboard
- ✅ Supabase integration (PostgreSQL backend)

## 🎯 Setup Checklist

### 1. Create Supabase Project (3 minutes)
```
1. Go to: https://supabase.com/
2. Sign in → New Project
3. Name: "Tankua"
4. Choose region: Asia Pacific (Mumbai)
5. Set database password
6. Wait for setup (~2 minutes)
```

### 2. Get Your API Keys (1 minute)
```
1. Project Settings → API
2. Copy:
   - Project URL: https://xxxxx.supabase.co
   - anon public key: eyJ...
```

### 3. Configure Your App (1 minute)
Open `src/config/supabase.js` and paste your keys:
```javascript
const supabaseUrl = 'https://xxxxx.supabase.co'; // Your URL
const supabaseAnonKey = 'eyJ...'; // Your key
```

### 4. Create Database (5 minutes)
```
1. Supabase Dashboard → SQL Editor
2. Copy the SQL from SUPABASE_SETUP.md (Step 3)
3. Run it
4. Run the RLS policies (Step 4)
5. Run the seed data (Step 7)
```

### 5. Enable Phone Auth (2 minutes)
```
1. Supabase → Authentication → Providers
2. Enable Phone
3. Add test number:
   Phone: +251900000000
   OTP: 123456
```

### 6. Run Your App (2 minutes)
```bash
# Install dependencies
npm install

# Start the app
npm start

# Then press 'a' for Android or 'i' for iOS
```

### 7. Test & Make Admin (2 minutes)
```
1. Login with: +251900000000 / OTP: 123456
2. Supabase → Table Editor → users
3. Find your user → Set is_admin = true
4. Restart app → See Admin tab!
```

## 🎉 You're Done!

Now you can:
- ✅ Browse 5 Ethiopian churches
- ✅ Book a trip with pickup station selection
- ✅ View on map or list
- ✅ Get QR ticket
- ✅ Access admin dashboard

## 📖 Full Documentation

- **SUPABASE_SETUP.md** - Complete setup guide with SQL scripts
- **README.md** - Full app documentation
- **PROJECT_STRUCTURE.md** - Code architecture
- **FEATURES.md** - Complete feature list

## ⚡ Quick Tips

### Test Phone Number
- Phone: `+251900000000`
- OTP: `123456`

### Database Tables Created
- `users` - User profiles
- `churches` - 5 Ethiopian churches
- `trips` - Sample trips
- `pickup_stations` - 7 stations in Addis Ababa
- `trip_pickup_stations` - Station-trip links
- `bookings` - User bookings
- `drivers` - Sample drivers

### Sample Data Included
- 5 Churches (Addis Ababa, Lalibela, Axum, Bahir Dar, Gondar)
- 7 Pickup Stations (Meskel Square, Bole, Piazza, etc.)
- 3 Drivers
- Auto-linked pickup stations to trips

## 🐛 Quick Troubleshooting

**App won't start?**
```bash
npm install
expo start -c  # Clear cache
```

**Can't connect to Supabase?**
- Check `src/config/supabase.js` has correct URL and key
- No "YOUR_" placeholders should remain

**Login not working?**
- Make sure Phone auth is enabled in Supabase
- Test phone number is added: +251900000000

**No data showing?**
- Check if SQL seed script ran successfully
- Go to Supabase → Table Editor and verify data exists

## 🔗 Useful Links

- **Supabase Dashboard**: Your project dashboard
- **SQL Editor**: Run queries and manage database
- **Table Editor**: View and edit data visually
- **API Docs**: Auto-generated API documentation

## 🎨 Design Colors

- **Gold**: #D4A017 (Primary)
- **Deep Blue**: #0A1A2F (Secondary)
- **White**: Background

## 📱 What to Test

1. **Onboarding Flow**: 3-slide intro
2. **Church Discovery**: List, Grid, Map views
3. **Booking Flow**: 
   - Select church
   - Choose trip type
   - Pick date
   - **Select pickup station** (toggle list/map)
   - Choose seats
   - Payment method
   - Get QR ticket
4. **Trips**: View upcoming/past bookings
5. **Profile**: Edit info, change language
6. **Admin**: Manage churches, trips, stations

## 🚀 Next Steps

1. **Add Google Maps API** (for production maps)
2. **Configure Twilio** (for real SMS OTP)
3. **Add more churches** via admin panel
4. **Customize payment** integration
5. **Deploy to stores** (iOS/Android)

## 💡 Pro Tips

- Use **SQL Editor** for quick data management
- **Table Editor** for visual data editing
- Enable **Realtime** in Supabase for live updates
- Use **Storage** for church images
- Check **Logs** for debugging

---

**Need Help?**
Check `SUPABASE_SETUP.md` for detailed step-by-step instructions with SQL scripts!

**Ready to build?**
```bash
npm start
```

Let's go! 🎉⛪📱

