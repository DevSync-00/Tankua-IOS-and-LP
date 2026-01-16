# Migration Guide: Generalizing from Churches to All Tours

This document outlines the changes made to generalize the Tankua platform from a church-specific booking system to a comprehensive tour booking platform supporting all types of destinations.

## Overview

The system has been updated to support:
- **All tour types**: Churches, historical sites, nature destinations, adventure tours, cultural sites, monuments, parks, museums, and more
- **Advanced filtering**: By category, region, price range, and dates
- **Backward compatibility**: Existing church data and references continue to work

## Database Changes

### Migration Script
Run `database/15_generalize_to_all_tours.sql` to:
1. Add `category` field to destinations (defaults to 'church' for existing data)
2. Rename `churches` table to `destinations`
3. Update `trips` table: `church_id` → `destination_id`
4. Update `bookings` table: `church_id` → `destination_id`, `church_name` → `destination_name`
5. Update `users` table: `saved_churches` → `saved_destinations`
6. Add `tour_category` field to trips for additional filtering

### Supported Categories
- `church` - Religious sites and churches
- `historical` - Historical landmarks
- `nature` - Natural attractions
- `adventure` - Adventure tours
- `cultural` - Cultural sites
- `religious` - Religious destinations
- `monument` - Monuments
- `park` - Parks and gardens
- `museum` - Museums
- `other` - Other destinations

### Tour Categories
- `day_trip` - Single day trips
- `multi_day` - Multi-day tours
- `weekend` - Weekend getaways
- `holiday` - Holiday specials
- `custom` - Custom tours

## Code Changes

### Mobile App (React Native)

#### Components
- **New**: `src/components/DestinationCard.js` - Generic destination card with category badges
- **New**: `src/components/FilterBar.js` - Filter UI for categories and regions
- **Updated**: `src/components/ChurchCard.js` - Kept for backward compatibility

#### Screens
- **New**: `src/screens/DestinationDetailScreen.js` - Generic destination detail screen
- **Updated**: `src/screens/HomeScreen.js` - Now shows all destinations with filtering
- **Updated**: `src/screens/MapScreen.js` - Shows all destinations with category-specific markers
- **Updated**: `src/screens/booking/SelectTripScreen.js` - Works with destinations
- **Updated**: `src/screens/booking/ConfirmationScreen.js` - Shows destination name

#### Services
- **Updated**: `src/services/database.js`
  - `getChurches()` → `getDestinations(filters)` with filtering support
  - `getChurch()` → `getDestination()`
  - `getTrips()` now supports category, region, price, and date filters
  - All functions maintain backward compatibility

#### Contexts
- **Updated**: `src/contexts/BookingContext.js`
  - Added `destination` field (alongside `church` for compatibility)
  - Booking creation supports both `destination_id` and `church_id`

#### Navigation
- **Updated**: `src/navigation/AppNavigator.js`
  - Added `DestinationDetail` route
  - Kept `ChurchDetail` for backward compatibility

### Backward Compatibility

The system maintains full backward compatibility:
- Old `church` references still work
- Database queries support both `church_id` and `destination_id`
- UI components accept both `church` and `destination` props
- Existing bookings and data remain functional

## Usage Examples

### Filtering Destinations

```javascript
// Get all destinations
const destinations = await getDestinations();

// Filter by category
const churches = await getDestinations({ category: 'church' });
const historical = await getDestinations({ category: 'historical' });

// Filter by region
const addisAbaba = await getDestinations({ region: 'Addis Ababa' });

// Search
const results = await getDestinations({ search: 'lalibela' });
```

### Filtering Trips

```javascript
// Get trips for a destination
const trips = await getTrips({ destinationId: 'uuid' });

// Filter by category
const natureTrips = await getTrips({ category: 'nature' });

// Filter by price range
const affordable = await getTrips({ minPrice: 100, maxPrice: 500 });

// Filter by date
const upcoming = await getTrips({ 
  dateFrom: '2025-01-01',
  dateTo: '2025-12-31'
});
```

## Next Steps

1. **Run Database Migration**: Execute `database/15_generalize_to_all_tours.sql` in Supabase
2. **Update Existing Data**: Set categories for existing destinations
3. **Test Filtering**: Verify category and region filters work correctly
4. **Update Translations**: Add translations for new categories and labels
5. **Web Platform**: Update web platform queries (see TODO #7)

## Notes

- All existing church data will be automatically categorized as 'church'
- The migration is safe to run multiple times (uses IF NOT EXISTS checks)
- No data loss occurs during migration
- Both old and new field names are supported during transition period
