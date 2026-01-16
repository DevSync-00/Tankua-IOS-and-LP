import { supabase } from './supabase';

// Get featured tours/destinations for homepage
export async function getFeaturedTours(limit: number = 4) {
  try {
    // Try to get trips with destinations
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        destination:destinations(id, name, city, category, images, description),
        church:churches(id, name, city, images, description),
        provider:providers(id, name, rating)
      `)
      .eq('status', 'upcoming')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Transform data to match frontend format
    return (data || []).map((trip: any) => {
      const dest = trip.destination || trip.church;
      return {
        id: trip.id,
        name: dest?.name || 'Unknown Destination',
        location: dest?.city || 'Unknown',
        category: dest?.category || 'General',
        image: dest?.images?.[0] || 'https://images.pexels.com/photos/12109950/pexels-photo-12109950.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
        rating: trip.provider?.rating || 4.5,
        reviews: Math.floor(Math.random() * 2000) + 500, // Mock for now
        price: trip.price || 1000,
        description: dest?.description || '',
      };
    });
  } catch (error) {
    console.error('Error fetching featured tours:', error);
    return [];
  }
}

// Get all tours/destinations with filters
export async function getTours(options?: {
  search?: string;
  category?: string;
  region?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = supabase
      .from('trips')
      .select(`
        *,
        destination:destinations(id, name, city, category, images, description, region),
        church:churches(id, name, city, images, description, region),
        provider:providers(id, name, rating)
      `, { count: 'exact' })
      .eq('status', 'upcoming')
      .order('departure_date', { ascending: true });

    if (options?.search) {
      // Note: This is a simplified search - in production, use full-text search
      query = query.or(`destination.name.ilike.%${options.search}%,church.name.ilike.%${options.search}%`);
    }

    if (options?.category) {
      query = query.or(`destination.category.eq.${options.category},church.category.eq.${options.category}`);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      tours: (data || []).map((trip: any) => {
        const dest = trip.destination || trip.church;
        return {
          id: trip.id,
          name: dest?.name || 'Unknown Destination',
          location: dest?.city || 'Unknown',
          region: dest?.region || 'Unknown',
          category: dest?.category || 'general',
          image: dest?.images?.[0] || 'https://images.pexels.com/photos/12109950/pexels-photo-12109950.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
          rating: trip.provider?.rating || 4.5,
          reviews: Math.floor(Math.random() * 2000) + 500,
          price: trip.price || 1000,
          description: dest?.description || '',
          tags: dest?.category ? [dest.category] : [],
        };
      }),
      total: count || 0,
    };
  } catch (error) {
    console.error('Error fetching tours:', error);
    return { tours: [], total: 0 };
  }
}

// Get destinations/churches
export async function getDestinations(options?: {
  search?: string;
  category?: string;
  region?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = supabase
      .from('destinations')
      .select('*', { count: 'exact' })
      .order('name');

    if (options?.search) {
      query = query.or(`name.ilike.%${options.search}%,city.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    if (options?.category) {
      query = query.eq('category', options.category);
    }

    if (options?.region) {
      query = query.eq('region', options.region);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }

    let { data, error, count } = await query;

    // Fallback to churches table
    if (error && error.message?.includes('destinations')) {
      query = supabase
        .from('churches')
        .select('*', { count: 'exact' })
        .order('name');

      if (options?.search) {
        query = query.or(`name.ilike.%${options.search}%,city.ilike.%${options.search}%`);
      }

      if (options?.category) {
        query = query.eq('category', options.category);
      }

      if (options?.region) {
        query = query.eq('region', options.region);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
      }

      const result = await query;
      data = result.data;
      error = result.error;
      count = result.count;
    }

    if (error) throw error;

    return {
      destinations: (data || []).map((dest: any) => ({
        id: dest.id,
        name: dest.name,
        location: dest.city,
        region: dest.region || 'Unknown',
        category: dest.category || 'general',
        image: dest.images?.[0] || 'https://images.pexels.com/photos/12109950/pexels-photo-12109950.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
        rating: 4.5 + Math.random() * 0.5, // Mock rating
        reviews: Math.floor(Math.random() * 2000) + 500,
        price: 800 + Math.floor(Math.random() * 3000),
        description: dest.description || '',
        tags: dest.tags || [dest.category].filter(Boolean),
      })),
      total: count || 0,
    };
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return { destinations: [], total: 0 };
  }
}

// Get tour/destination by ID
export async function getTourById(id: string) {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        destination:destinations(*),
        church:churches(*),
        provider:providers(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    const dest = data.destination || data.church;
    return {
      id: data.id,
      name: dest?.name || 'Unknown',
      location: dest?.city || 'Unknown',
      region: dest?.region || 'Unknown',
      category: dest?.category || 'general',
      images: dest?.images || [],
      rating: data.provider?.rating || 4.5,
      reviews: Math.floor(Math.random() * 2000) + 500,
      price: data.price || 1000,
      description: dest?.description || '',
      provider: data.provider,
      departureDate: data.departure_date,
      tripType: data.trip_type,
    };
  } catch (error) {
    console.error('Error fetching tour:', error);
    return null;
  }
}

// Submit contact form
export async function submitContactForm(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  try {
    // In production, you'd save this to a database table or send via email service
    // For now, we'll just log it and return success
    console.log('Contact form submission:', data);
    
    // You could create a contact_submissions table in Supabase
    // const { error } = await supabase
    //   .from('contact_submissions')
    //   .insert(data);
    
    // if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return { success: false, error };
  }
}
