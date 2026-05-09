import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  useWindowDimensions,
  TouchableOpacity,
  Alert,
  ScrollView,
  Share,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  useAnimatedScrollHandler,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../config/theme';
import { useLanguage } from '../contexts/LanguageContext';
import { useBooking } from '../contexts/BookingContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { validateProfile, getProfileIncompleteMessage } from '../utils/profileValidation';
import ModernButton from '../components/ModernButton';

const IMAGE_HEIGHT = 420;

const DestinationDetailScreen = ({ route, navigation }) => {
  const { destination } = route.params;
  const { t } = useLanguage();
  const { updateBooking } = useBooking();
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const scrollY = useSharedValue(0);
  const heartScale = useSharedValue(1);

  const {
    name,
    images = [],
    description = '',
    city = '',
    region = '',
    distance = 0,
    rating = 0,
    review_count = 0,
    price = null,
    estimated_duration = null,
    price_range = null,
    is_verified = false,
    category = 'other',
    tags = [],
  } = destination;

  const heroImage = images && images.length > 0 ? images[0] : null;
  const galleryImages = images && images.length > 1 ? images.slice(1, 6) : [];

  useEffect(() => {
    checkIfSaved();
    loadReviews();
  }, [destination?.id, user?.id]);

  const checkIfSaved = async () => {
    if (!user?.id || !destination?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('saved_destinations')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      const savedDestinations = data?.saved_destinations || [];
      setSaved(savedDestinations.includes(destination.id));
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const loadReviews = async () => {
    if (!destination?.id) return;
    
    setLoadingReviews(true);
    try {
      // First, get trips for this destination
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('id')
        .eq('destination_id', destination.id)
        .limit(50);

      if (tripsError) throw tripsError;

      if (!tripsData || tripsData.length === 0) {
        setReviews([]);
        setLoadingReviews(false);
        return;
      }

      const tripIds = tripsData.map(trip => trip.id);

      // Get bookings for these trips
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('id')
        .in('trip_id', tripIds)
        .limit(50);

      if (bookingsError) throw bookingsError;

      if (!bookingsData || bookingsData.length === 0) {
        setReviews([]);
        setLoadingReviews(false);
        return;
      }

      const bookingIds = bookingsData.map(booking => booking.id);

      // Get reviews for these bookings
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          users (name)
        `)
        .in('booking_id', bookingIds)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleBookTrip = () => {
    const validation = validateProfile(user);
    if (!validation.isValid) {
      Alert.alert(
        'Profile Incomplete',
        getProfileIncompleteMessage(validation.missingFields),
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Update Profile', 
            onPress: () => navigation.navigate('MainTabs', { screen: 'Profile' })
          },
        ]
      );
      return;
    }

    updateBooking({ destination });
    navigation.navigate('BookingFlow', { screen: 'SelectTrip' });
  };

  const handleSave = async () => {
    if (!user?.id || !destination?.id) return;
    
    heartScale.value = withSpring(1.3, { damping: 8 }, () => {
      heartScale.value = withSpring(1);
    });
    
    try {
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('saved_destinations')
        .eq('id', user.id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const currentSaved = userData?.saved_destinations || [];
      let newSaved;
      
      if (saved) {
        newSaved = currentSaved.filter(id => id !== destination.id);
      } else {
        newSaved = [...currentSaved, destination.id];
      }
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ saved_destinations: newSaved })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      setSaved(!saved);
    } catch (error) {
      console.error('Error saving destination:', error);
      Alert.alert('Error', 'Failed to update saved destinations');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${name} in ${city || region}!`,
        title: name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatDuration = () => {
    if (!estimated_duration) return null;
    if (estimated_duration < 1) {
      return `${Math.round(estimated_duration * 60)}min`;
    }
    if (estimated_duration < 24) {
      return `${Math.round(estimated_duration)}h`;
    }
    return `${Math.round(estimated_duration / 24)}d`;
  };

  const formatPriceRange = () => {
    if (!price_range) return null;
    if (typeof price_range === 'string') return price_range;
    if (price_range.min && price_range.max) {
      return `$${price_range.min}-${price_range.max}`;
    }
    return null;
  };

  // Feature chips data with pastel colors
  const featureChips = [
    formatDuration() && { icon: '⏱️', label: formatDuration(), color: '#E8F5E9' },
    distance > 0 && { icon: '📍', label: `${distance}km away`, color: '#E3F2FD' },
    category && { icon: '🏷️', label: category, color: '#FFF3E0' },
    formatPriceRange() && { icon: '💰', label: formatPriceRange(), color: '#F3E5F5' },
    rating > 0 && { icon: '⭐', label: `${rating.toFixed(1)} rating`, color: '#FFF9C4' },
  ].filter(Boolean);

  // Animated image style
  const imageAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [-IMAGE_HEIGHT, 0],
      [1.2, 1],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ scale }],
    };
  });

  const heartAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: heartScale.value }],
    };
  });

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image */}
        <Animated.View style={[styles.heroContainer, imageAnimatedStyle]}>
          {heroImage ? (
            <Image source={{ uri: heroImage }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Ionicons name="image-outline" size={80} color={COLORS.grayLight} />
            </View>
          )}
          {/* Subtle bottom-to-top gradient */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
            locations={[0.4, 0.7, 1]}
            style={styles.heroGradient}
          />
          
          {/* Hero Header with Back and Heart buttons */}
          <SafeAreaView edges={['top']} style={styles.heroHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.white} />
            </TouchableOpacity>
            
            <Animated.View style={heartAnimatedStyle}>
              <TouchableOpacity
                style={[styles.heartButton, saved && styles.heartButtonActive]}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={saved ? 'heart' : 'heart-outline'} 
                  size={22} 
                  color={saved ? COLORS.accent : COLORS.white} 
                />
              </TouchableOpacity>
            </Animated.View>
          </SafeAreaView>
        </Animated.View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title Section - Premium Typography */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{name}</Text>
            
            {/* Metadata Row - Muted Grey */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={14} color={COLORS.gray} />
                <Text style={[styles.metaText, { marginLeft: SPACING.xs }]}>{city || region || 'Ethiopia'}</Text>
              </View>
              {rating > 0 && (
                <View style={styles.metaItem}>
                  <Ionicons name="star" size={14} color={COLORS.warning} />
                  <Text style={[styles.metaText, { marginLeft: SPACING.xs }]}>{rating.toFixed(1)}</Text>
                  {review_count > 0 && (
                    <Text style={styles.metaText}> · {review_count > 1000 ? `${(review_count / 1000).toFixed(1)}k` : review_count} reviews</Text>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Feature Chips - Horizontal Scrolling with Pastel Colors */}
          {featureChips.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsContainer}
            >
              {featureChips.map((chip, index) => (
                <View key={index} style={[styles.featureChip, { backgroundColor: chip.color }]}>
                  <Text style={styles.chipIcon}>{chip.icon}</Text>
                  <Text style={[styles.chipText, { marginLeft: SPACING.xs }]}>{chip.label}</Text>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Things to Do - Bento Grid Layout */}
          {galleryImages.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Things to Do</Text>
              <View style={styles.bentoGrid}>
                {galleryImages.slice(0, 4).map((imageUri, index) => {
                  const isLarge = index === 0;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.bentoItem, isLarge && styles.bentoItemLarge]}
                      activeOpacity={0.9}
                    >
                      <Image source={{ uri: imageUri }} style={styles.bentoImage} resizeMode="cover" />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.6)']}
                        style={styles.bentoGradient}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* About Section */}
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>
              {description || 'Discover this amazing destination and create unforgettable memories.'}
            </Text>
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.reviewsSectionTitle}>Reviews</Text>
              {review_count > 0 && (
                <Text style={styles.reviewsCount}>{review_count} {review_count === 1 ? 'review' : 'reviews'}</Text>
              )}
            </View>
            {loadingReviews ? (
              <View style={styles.reviewsLoading}>
                <Text style={styles.loadingText}>Loading reviews...</Text>
              </View>
            ) : reviews.length === 0 ? (
              <View style={styles.noReviews}>
                <Ionicons name="chatbubbles-outline" size={48} color={COLORS.grayLight} />
                <Text style={styles.noReviewsText}>No reviews yet</Text>
                <Text style={styles.noReviewsSubtext}>Be the first to review this destination!</Text>
              </View>
            ) : (
              <View style={styles.reviewsList}>
                {reviews.map((review, index) => (
                  <View key={review.id} style={[styles.reviewCard, index === reviews.length - 1 && styles.reviewCardLast]}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewUser}>
                        <View style={styles.reviewAvatar}>
                          <Text style={styles.reviewAvatarText}>
                            {(review.users?.name || 'U').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.reviewUserInfo}>
                          <Text style={styles.reviewUserName}>
                            {review.users?.name || 'Anonymous'}
                          </Text>
                          <View style={styles.reviewRating}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Ionicons
                                key={star}
                                name={star <= review.rating ? 'star' : 'star-outline'}
                                size={14}
                                color={star <= review.rating ? COLORS.warning : COLORS.grayLight}
                                style={{ marginRight: 2 }}
                              />
                            ))}
                          </View>
                        </View>
                      </View>
                      <Text style={styles.reviewDate}>
                        {new Date(review.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                    {review.comment && (
                      <Text style={styles.reviewComment}>{review.comment}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Price Card */}
          {typeof price === 'number' && price > 0 && (
            <View style={styles.priceCard}>
              <View style={styles.priceCardContent}>
                <View style={styles.priceInfo}>
                  <Text style={styles.priceLabel}>Starting from</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceValue}>ETB {price}</Text>
                    <Text style={styles.priceNote}>per person</Text>
                  </View>
                </View>
                <View style={styles.priceIconContainer}>
                  <Ionicons name="cash" size={32} color={COLORS.primary} />
                </View>
              </View>
            </View>
          )}

        </View>
      </Animated.ScrollView>

      {/* Sticky Footer */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <View style={styles.footerContent}>
          {typeof price === 'number' && price > 0 && (
            <View style={styles.footerPrice}>
              <Text style={styles.footerPriceLabel}>From</Text>
              <Text style={styles.footerPriceValue}>ETB {price}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.bookNowButton}
            onPress={handleBookTrip}
            activeOpacity={0.9}
          >
            <Text style={styles.bookNowText}>Book Now</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} style={styles.bookNowIcon} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  scrollContent: {
    paddingBottom: 20, // Minimal space for sticky footer
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  heartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  heartButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  heroContainer: {
    height: IMAGE_HEIGHT,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  heroHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    zIndex: 10,
  },
  content: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  titleSection: {
    marginBottom: SPACING.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  titleLeft: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.secondary,
    letterSpacing: -1,
    lineHeight: 40,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.bold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  metaText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray,
    fontWeight: FONTS.weights.medium,
  },
  chipsContainer: {
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 24,
    marginRight: SPACING.sm,
  },
  chipIcon: {
    fontSize: 16,
  },
  chipText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.secondary,
    fontWeight: FONTS.weights.semibold,
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.black,
    color: COLORS.secondary,
    letterSpacing: -0.5,
    marginBottom: SPACING.md,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  bentoItem: {
    width: '48%',
    height: 160,
    borderRadius: 24,
    overflow: 'hidden',
    margin: SPACING.xs,
    ...SHADOWS.medium,
  },
  bentoItemLarge: {
    width: '100%',
    height: 200,
    margin: SPACING.xs,
  },
  bentoImage: {
    width: '100%',
    height: '100%',
  },
  bentoGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  aboutSection: {
    marginBottom: SPACING.md,
  },
  reviewsSection: {
    marginBottom: 0,
    paddingBottom: 0,
    marginTop: 0,
    paddingTop: 0,
  },
  description: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray,
    lineHeight: 24,
    fontWeight: FONTS.weights.regular,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  tagText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.secondary,
    fontWeight: FONTS.weights.medium,
  },
  priceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.large,
  },
  priceCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    fontWeight: FONTS.weights.medium,
    opacity: 0.9,
    marginBottom: SPACING.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    fontSize: FONTS.sizes.xxxl,
    color: COLORS.white,
    fontWeight: FONTS.weights.black,
    letterSpacing: -1,
    marginRight: SPACING.xs,
  },
  priceNote: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    fontWeight: FONTS.weights.medium,
    opacity: 0.8,
  },
  priceIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    ...SHADOWS.large,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  footerPrice: {
    flex: 1,
    marginRight: SPACING.md,
  },
  footerPriceLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray,
    fontWeight: FONTS.weights.medium,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerPriceValue: {
    fontSize: FONTS.sizes.xxl,
    color: COLORS.secondary,
    fontWeight: FONTS.weights.black,
    letterSpacing: -0.5,
  },
  bookNowButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 24,
    ...SHADOWS.medium,
  },
  bookNowText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.black,
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  bookNowIcon: {
    marginLeft: SPACING.xs,
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  reviewsSectionTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.black,
    color: COLORS.secondary,
    letterSpacing: -0.5,
    marginBottom: 0,
  },
  reviewsCount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    fontWeight: FONTS.weights.medium,
  },
  reviewsLoading: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
  },
  noReviews: {
    alignItems: 'center',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.small,
  },
  noReviewsText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.secondary,
    marginTop: SPACING.sm,
    marginBottom: 0,
  },
  noReviewsSubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginBottom: 0,
  },
  reviewsList: {
    // Reviews list spacing handled by marginBottom in reviewCard
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.small,
  },
  reviewCardLast: {
    marginBottom: 0,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  reviewAvatarText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.secondary,
    marginBottom: SPACING.xs / 2,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewDate: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.grayLight,
  },
  reviewComment: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    lineHeight: 20,
    marginTop: SPACING.xs,
  },
});

export default DestinationDetailScreen;
