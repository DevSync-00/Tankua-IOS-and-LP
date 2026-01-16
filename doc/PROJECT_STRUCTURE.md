# Tankua - Project Structure

Complete overview of the project architecture and file organization.

## Directory Structure

```
tankua/
├── assets/                          # Static assets (images, fonts, etc.)
├── src/                            # Source code
│   ├── components/                 # Reusable UI components
│   │   ├── Button.js              # Custom button component
│   │   ├── ChurchCard.js          # Church display card
│   │   ├── PickupStationCard.js   # Pickup station card
│   │   └── Loader.js              # Loading indicator
│   │
│   ├── config/                    # Configuration files
│   │   ├── firebase.js            # Firebase initialization
│   │   ├── theme.js               # App theme (colors, fonts, spacing)
│   │   └── translations.js        # i18n translations (Amharic/English)
│   │
│   ├── contexts/                  # React Context providers
│   │   ├── AuthContext.js         # Authentication state management
│   │   ├── BookingContext.js      # Booking flow state management
│   │   └── LanguageContext.js     # Language/i18n management
│   │
│   ├── navigation/                # Navigation configuration
│   │   ├── AppNavigator.js        # Root navigator
│   │   ├── MainTabNavigator.js    # Bottom tab navigation
│   │   └── BookingFlowNavigator.js # Booking flow stack navigator
│   │
│   ├── screens/                   # App screens
│   │   ├── OnboardingScreen.js    # 3-slide onboarding
│   │   ├── LoginScreen.js         # Phone OTP login
│   │   ├── HomeScreen.js          # Church discovery (list/grid/map)
│   │   ├── ChurchDetailScreen.js  # Church details and booking entry
│   │   ├── TripsScreen.js         # User's upcoming/past trips
│   │   ├── MapScreen.js           # Map view of churches
│   │   ├── ProfileScreen.js       # User profile and settings
│   │   ├── TicketScreen.js        # QR ticket display
│   │   │
│   │   ├── booking/               # Booking flow screens
│   │   │   ├── SelectTripTypeScreen.js      # Step 1: Trip type selection
│   │   │   ├── SelectDateScreen.js          # Step 2: Date selection
│   │   │   ├── SelectPickupStationScreen.js # Step 3: Pickup station (list/map)
│   │   │   ├── SelectSeatsScreen.js         # Step 4: Seats/vehicle selection
│   │   │   ├── PaymentScreen.js             # Step 5: Payment method
│   │   │   └── ConfirmationScreen.js        # Step 6: Booking confirmation + QR
│   │   │
│   │   └── admin/                 # Admin screens
│   │       └── AdminDashboardScreen.js      # Admin dashboard with stats
│   │
│   └── services/                  # Business logic and API calls
│       └── database.js            # Firestore CRUD operations
│
├── App.js                         # App entry point
├── app.json                       # Expo configuration
├── package.json                   # Dependencies
├── babel.config.js                # Babel configuration
├── .gitignore                     # Git ignore rules
├── README.md                      # Project overview
├── INSTALLATION.md                # Installation guide
├── FIREBASE_SETUP.md              # Database schema and setup
└── PROJECT_STRUCTURE.md           # This file

```

## Key Features by File

### Authentication Flow
- **OnboardingScreen.js**: 3-slide introduction with Ethiopian church imagery
- **LoginScreen.js**: Phone number input and OTP verification
- **AuthContext.js**: Manages user authentication state

### Church Discovery
- **HomeScreen.js**: Main discovery page with search, filters, and view modes (list/grid/map)
- **ChurchCard.js**: Reusable card component for displaying churches
- **ChurchDetailScreen.js**: Detailed church information and booking entry point
- **MapScreen.js**: Full-screen map view of all churches

### Booking Flow (Core Feature)
The complete 6-step booking process:

1. **SelectTripTypeScreen.js**: Choose group/private/holiday trip
2. **SelectDateScreen.js**: Calendar date picker
3. **SelectPickupStationScreen.js**: 
   - List view with station cards
   - Interactive map with markers
   - Nearest station highlighting
   - Station details (name, pickup time, extra price, distance)
4. **SelectSeatsScreen.js**: Seat count or vehicle type selection
5. **PaymentScreen.js**: Payment method selection (Telebirr, CBE, Amole, Chapa)
6. **ConfirmationScreen.js**: Booking summary with QR code

### Trips Management
- **TripsScreen.js**: View upcoming and past trips with filters
- **TicketScreen.js**: Display booking ticket with QR code

### User Profile
- **ProfileScreen.js**: 
  - Personal information editing
  - Language toggle (Amharic/English)
  - Settings and preferences
  - Saved churches and stations

### Admin Features
- **AdminDashboardScreen.js**: 
  - Statistics overview
  - Quick actions for managing:
    - Churches
    - Trips
    - Pickup stations
    - Drivers
    - Bookings
  - Recent activity feed

### Core Components

#### Button.js
Customizable button component with variants:
- `primary`: Gold background (default)
- `secondary`: Deep blue background
- `outline`: Transparent with border
- `ghost`: Text only
- Sizes: small, medium, large
- Loading state support

#### ChurchCard.js
Church display component with two variants:
- `list`: Horizontal layout with image, details, and distance
- `grid`: Compact vertical layout for grid view

#### PickupStationCard.js
Pickup station display with:
- Station name and city
- Pickup time
- Distance from user
- Extra price (if applicable)
- "Nearest" badge
- Selection state
- Interactive map integration

#### Loader.js
Simple loading indicator for async operations

### State Management

#### AuthContext.js
Manages:
- User authentication state
- Login/logout
- OTP verification
- Admin status
- Profile updates

#### BookingContext.js
Handles booking flow:
- Current booking state
- Trip type, date, station, seats, payment
- Price calculation
- Booking creation
- User bookings retrieval

#### LanguageContext.js
Manages:
- Current language (Amharic/English)
- Translation function `t(key)`
- Language switching
- Persistent storage

### Configuration

#### theme.js
Centralized design tokens:
- **Colors**: Primary (Gold), Secondary (Deep Blue), etc.
- **Fonts**: Sizes and weights
- **Spacing**: Consistent spacing scale
- **Border Radius**: Rounded corners
- **Shadows**: Elevation styles

#### translations.js
Complete bilingual support:
- English (en)
- Amharic (am)
- All UI text translations
- Easy to extend

#### firebase.js
Firebase initialization:
- Authentication
- Firestore database
- Storage (for images)

### Services

#### database.js
Firestore operations:
- **Users**: CRUD operations
- **Churches**: CRUD with filters
- **Trips**: CRUD with filters
- **Pickup Stations**: CRUD operations
- **Trip-Station Links**: Many-to-many relationship
- **Bookings**: Create, read, update
- **Drivers**: CRUD for admin

## Data Flow

### Booking Flow Example

```
1. User selects church (HomeScreen)
   ↓
2. Views church details (ChurchDetailScreen)
   ↓
3. Clicks "Book Trip" → Updates BookingContext
   ↓
4. Enters BookingFlowNavigator
   ↓
5. Completes 6-step process:
   - Trip Type → BookingContext.updateBooking()
   - Date → BookingContext.updateBooking()
   - Pickup Station → BookingContext.updateBooking()
   - Seats → BookingContext.updateBooking()
   - Payment → BookingContext.updateBooking()
   - Confirmation → BookingContext.createBooking()
   ↓
6. Booking saved to Firestore
   ↓
7. QR code generated and displayed
   ↓
8. User can view ticket (TicketScreen)
```

## Design Patterns

### Component Patterns
- **Container/Presentational**: Screens as containers, components as presentational
- **Composition**: Reusable components composed in screens
- **Context API**: Global state without prop drilling

### Navigation Patterns
- **Stack Navigator**: For linear flows (booking steps)
- **Tab Navigator**: For main app sections
- **Nested Navigation**: Stack inside tabs

### State Management
- **Context API**: For global state (auth, language, booking)
- **Local State**: For component-specific state
- **Async Storage**: For persistence

## Styling Approach

- **StyleSheet API**: React Native StyleSheet for performance
- **Theme Object**: Centralized design tokens
- **Responsive**: Dimensions API for responsive layouts
- **Platform-Specific**: Platform.OS for iOS/Android differences

## Key Technologies

- **React Native**: Mobile framework
- **Expo**: Development platform
- **Firebase**: Backend (Auth, Firestore, Storage)
- **React Navigation**: Navigation
- **React Native Maps**: Map integration
- **QR Code**: Ticket generation
- **Context API**: State management

## Best Practices

1. **Component Reusability**: DRY principle with shared components
2. **Separation of Concerns**: Business logic in contexts/services
3. **Type Safety**: PropTypes or TypeScript (can be added)
4. **Error Handling**: Try-catch blocks and user feedback
5. **Loading States**: Loaders for async operations
6. **Accessibility**: Semantic HTML and ARIA labels
7. **Performance**: Memoization and lazy loading where needed
8. **Code Organization**: Logical folder structure
9. **Naming Conventions**: Clear, descriptive names
10. **Documentation**: Inline comments for complex logic

## Future Enhancements

- Add TypeScript for type safety
- Implement Redux for more complex state
- Add unit and integration tests (Jest, React Native Testing Library)
- Implement CI/CD pipeline
- Add offline support with Redux Persist
- Implement real-time updates with Firestore listeners
- Add analytics and crash reporting
- Implement deep linking
- Add app-wide error boundaries
- Optimize performance with React.memo and useMemo

