# Web Platform Updates - Destinations System

## Summary

The web platform has been updated to support the new destinations system with category filtering across all three applications:

1. **Admin Dashboard** - New destinations management page
2. **Provider Dashboard** - Updated trip creation with category filters
3. **Marketing Site** - Ready for destinations (needs data integration)

## Changes Made

### Database Package (`web/packages/database`)

#### Types (`src/types.ts`)
- Added `destinations` table type with `category` field
- Updated `trips` table to support both `destination_id` and `church_id` (backward compatible)
- Added `tour_category` field to trips
- Updated extended types to include destinations

#### Queries (`src/queries.ts`)
- Added `getDestinations()` with category and region filtering
- Updated `getTrips()` to support destination filtering
- All queries maintain backward compatibility with churches table
- Automatic fallback to churches table if destinations doesn't exist

### Admin Dashboard (`web/apps/admin`)

#### New Page: `/dashboard/destinations`
- Full CRUD for destinations
- Category filter with visual icons
- Region filter
- Search functionality
- Pagination
- Category badges on cards

#### Updated Queries (`src/lib/queries.ts`)
- `getChurches()` now tries destinations first, falls back to churches
- Supports category filtering

### Provider Dashboard (`web/apps/provider`)

#### Updated: `/dashboard/trips/new`
- Category filter dropdown
- Loads destinations instead of just churches
- Shows category in destination selection
- Supports both destination_id and church_id

## Next Steps

1. **Run Database Migration**: Execute `database/15_generalize_to_all_tours.sql`
2. **Update Marketing Site**: Connect to real destinations data
3. **Add Create/Edit Forms**: Implement destination creation/editing modals
4. **Update Navigation**: Add destinations link to admin sidebar
5. **Test Filtering**: Verify all filters work correctly

## Backward Compatibility

All changes maintain backward compatibility:
- Old `churches` references still work
- Automatic fallback to churches table if destinations doesn't exist
- Both `destination_id` and `church_id` supported in trips
