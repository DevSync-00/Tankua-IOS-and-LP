import { supabase } from '../config/supabase';

// ============================================
// USERS
// ============================================

export const createUser = async (userData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

export const getUser = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (userId, updates) => {
  try {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    throw error;
  }
};

// ============================================
// DESTINATIONS
// ============================================
// Note: Churches are just one category of destinations, not a separate entity

// Helper to get table name (supports both old and new schema)
const getDestinationsTable = () => {
  // Always use destinations table (churches table is deprecated)
  return 'destinations';
};

export const createDestination = async (destinationData) => {
  try {
    const tableName = getDestinationsTable();
    const { data, error } = await supabase
      .from(tableName)
      .insert([destinationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

// Deprecated: Alias for backward compatibility only - use createDestination instead
export const createChurch = createDestination;

export const getDestinations = async (filters = {}) => {
  try {
    const tableName = getDestinationsTable();
    let query = supabase
      .from(tableName)
      .select('*');
    
    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters.region) {
      query = query.eq('region', filters.region);
    }
    
    if (filters.city) {
      query = query.eq('city', filters.city);
    }
    
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
};

// Deprecated: Alias for backward compatibility only - use getDestinations({ category: 'church' }) instead
export const getChurches = async () => {
  return getDestinations({ category: 'church' });
};

export const getDestination = async (destinationId) => {
  try {
    const tableName = getDestinationsTable();
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', destinationId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

// Deprecated: Alias for backward compatibility only - use getDestination instead
export const getChurch = getDestination;

export const updateDestination = async (destinationId, updates) => {
  try {
    const tableName = getDestinationsTable();
    const { error } = await supabase
      .from(tableName)
      .update(updates)
      .eq('id', destinationId);

    if (error) throw error;
  } catch (error) {
    throw error;
  }
};

// Alias for backward compatibility
export const updateChurch = updateDestination;

export const deleteDestination = async (destinationId) => {
  try {
    const tableName = getDestinationsTable();
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', destinationId);

    if (error) throw error;
  } catch (error) {
    throw error;
  }
};

// Alias for backward compatibility
export const deleteChurch = deleteDestination;

// ============================================
// TRIPS
// ============================================

export const createTrip = async (tripData) => {
  try {
    const { data, error } = await supabase
      .from('trips')
      .insert([tripData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

export const getTrips = async (filters = {}) => {
  try {
    // Determine table names (support both old and new schema)
    const destinationsTable = getDestinationsTable();
    const destinationIdField = 'destination_id'; // Try new field first
    
    // Build query with provider and destination information
    let query = supabase
      .from('trips')
      .select(`
        *,
        providers (
          id,
          name,
          logo_url,
          rating,
          phone,
          description
        ),
        ${destinationsTable} (
          id,
          name,
          city,
          region,
          category
        )
      `);
    
    // Support both destinationId and churchId for backward compatibility (churchId is deprecated)
    if (filters.destinationId || filters.churchId) {
      const idToUse = filters.destinationId || filters.churchId;
      // Try destination_id first, fallback to church_id (deprecated column)
      try {
        query = query.eq('destination_id', idToUse);
      } catch {
        query = query.eq('church_id', idToUse); // Deprecated: church_id column is legacy
      }
    }
    
    // Additional filters
    if (filters.category) {
      // Filter by destination category through join
      query = query.eq(`${destinationsTable}.category`, filters.category);
    }
    
    if (filters.tourCategory) {
      query = query.eq('tour_category', filters.tourCategory);
    }
    
    if (filters.region) {
      query = query.eq(`${destinationsTable}.region`, filters.region);
    }
    
    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    
    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }
    
    if (filters.dateFrom) {
      query = query.gte('departure_date', filters.dateFrom);
    }
    
    if (filters.dateTo) {
      query = query.lte('departure_date', filters.dateTo);
    }
    
    // Filter by status - only show upcoming/active trips with available seats
    query = query.in('status', ['upcoming', 'active']);
    query = query.gte('available_seats', 1);
    
    // Try ordering by departure_date, fallback to date
    try {
      query = query.order('departure_date', { ascending: true });
    } catch {
      query = query.order('date', { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
      // If destination_id column doesn't exist, try with church_id (deprecated - old schema)
      if (error.message?.includes('destination_id') || error.code === '42703') {
        query = supabase
          .from('trips')
          .select(`
            *,
            providers (
              id,
              name,
              logo_url,
              rating,
              phone,
              description
            ),
            churches (
              id,
              name,
              city,
              region
            )
          `);
        
        if (filters.destinationId || filters.churchId) {
          query = query.eq('church_id', filters.destinationId || filters.churchId); // Deprecated: church_id is legacy
        }
        
        query = query.in('status', ['upcoming', 'active']);
        query = query.gte('available_seats', 1);
        query = query.order('date', { ascending: true });
        
        const { data: fallbackData, error: fallbackError } = await query;
        if (fallbackError) throw fallbackError;
        return fallbackData || [];
      }
      throw error;
    }
    
    return data || [];
  } catch (error) {
    throw error;
  }
};

// ============================================
// PICKUP STATIONS
// ============================================

export const createPickupStation = async (stationData) => {
  try {
    const { data, error } = await supabase
      .from('pickup_stations')
      .insert([stationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

export const getPickupStations = async () => {
  try {
    const { data, error } = await supabase
      .from('pickup_stations')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
};

export const updatePickupStation = async (stationId, updates) => {
  try {
    const { error } = await supabase
      .from('pickup_stations')
      .update(updates)
      .eq('id', stationId);

    if (error) throw error;
  } catch (error) {
    throw error;
  }
};

export const deletePickupStation = async (stationId) => {
  try {
    const { error } = await supabase
      .from('pickup_stations')
      .delete()
      .eq('id', stationId);

    if (error) throw error;
  } catch (error) {
    throw error;
  }
};

// ============================================
// TRIP PICKUP STATIONS
// ============================================

export const linkStationToTrip = async (tripId, stationId, pickupTime, extraPrice) => {
  try {
    const { data, error } = await supabase
      .from('trip_pickup_stations')
      .insert([{
        trip_id: tripId,
        station_id: stationId,
        pickup_time: pickupTime,
        extra_price: extraPrice,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

export const getTripStations = async (tripId) => {
  try {
    const { data, error } = await supabase
      .from('trip_pickup_stations')
      .select(`
        *,
        pickup_stations (*)
      `)
      .eq('trip_id', tripId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
};

// ============================================
// BOOKINGS
// ============================================

export const createBooking = async (bookingData) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

export const getUserBookings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
};

export const getAllBookings = async () => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
};

export const updateBooking = async (bookingId, updates) => {
  try {
    const { error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', bookingId);

    if (error) throw error;
  } catch (error) {
    throw error;
  }
};

// ============================================
// DRIVERS
// ============================================

export const createDriver = async (driverData) => {
  try {
    const { data, error } = await supabase
      .from('drivers')
      .insert([driverData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

export const getDrivers = async () => {
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
};

export const updateDriver = async (driverId, updates) => {
  try {
    const { error } = await supabase
      .from('drivers')
      .update(updates)
      .eq('id', driverId);

    if (error) throw error;
  } catch (error) {
    throw error;
  }
};

export const deleteDriver = async (driverId) => {
  try {
    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', driverId);

    if (error) throw error;
  } catch (error) {
    throw error;
  }
};

// ============================================
// PROVIDERS
// ============================================

export const createProvider = async (providerData) => {
  try {
    const { data, error } = await supabase
      .from('providers')
      .insert([providerData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

export const getProviders = async (filters = {}) => {
  try {
    // Support both destinationId and churchId for backward compatibility (churchId is deprecated)
    const destinationId = filters.destinationId || filters.churchId;
    
    // If destination and date filters are provided, find providers who have trips for that destination and date
    if (destinationId && filters.date) {
      // First, find all trips for this destination and date
      // Try departure_date first, if it fails, fallback to date column
      const dateStart = filters.date + 'T00:00:00';
      const dateEnd = filters.date + 'T23:59:59';
      
      let trips = [];
      let tripsError = null;
      
      // Try with destination_id and departure_date column first (new schema)
      let query1 = supabase
        .from('trips')
        .select('provider_id')
        .in('status', ['upcoming', 'active'])
        .gte('available_seats', 1)
        .gte('departure_date', dateStart)
        .lte('departure_date', dateEnd);
      
      // Try destination_id first, fallback to church_id (deprecated)
      try {
        query1 = query1.eq('destination_id', destinationId);
      } catch {
        query1 = query1.eq('church_id', destinationId); // Deprecated: church_id is legacy
      }
      
      const { data: tripsWithDeparture, error: error1 } = await query1;
      
      // If departure_date column doesn't exist, fallback to date column (old schema)
      if (error1 && (error1.message?.includes('departure_date') || error1.code === '42703')) {
        // Fallback to date column (for older schema)
        let query2 = supabase
          .from('trips')
          .select('provider_id')
          .in('status', ['upcoming', 'active'])
          .gte('available_seats', 1)
          .eq('date', filters.date);
        
        // Try destination_id first, fallback to church_id (deprecated)
        try {
          query2 = query2.eq('destination_id', destinationId);
        } catch {
          query2 = query2.eq('church_id', destinationId); // Deprecated: church_id is legacy
        }
        
        const { data: tripsWithDate, error: error2 } = await query2;
        
        if (error2) {
          tripsError = error2;
        } else {
          trips = tripsWithDate || [];
        }
      } else if (error1) {
        tripsError = error1;
      } else {
        trips = tripsWithDeparture || [];
      }

      if (tripsError) throw tripsError;

      // Extract unique provider IDs
      const providerIds = [...new Set((trips || []).map(trip => trip.provider_id).filter(Boolean))];

      if (providerIds.length === 0) {
        return []; // No providers available for this destination and date
      }

      // Get provider details for those providers
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .in('id', providerIds)
        .eq('status', 'active')
        .order('rating', { ascending: false });

      if (error) throw error;
      return data || [];
    }

    // If no filters, return all active providers (for backward compatibility)
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('status', 'active')
      .order('rating', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
};

export const getProvider = async (providerId) => {
  try {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateProvider = async (providerId, updates) => {
  try {
    const { error } = await supabase
      .from('providers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', providerId);

    if (error) throw error;
  } catch (error) {
    throw error;
  }
};

export const deleteProvider = async (providerId) => {
  try {
    const { error } = await supabase
      .from('providers')
      .update({ status: 'inactive' })
      .eq('id', providerId);

    if (error) throw error;
  } catch (error) {
    throw error;
  }
};