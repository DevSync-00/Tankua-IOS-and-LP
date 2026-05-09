import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  Share,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// Using semi-transparent background instead of blur for compatibility
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../config/theme';
import { isFavorited, toggleFavorite } from '../services/favorites';

const EnhancedDestinationCard = ({
  destination,
  onPress,
  size = 'medium', // 'small', 'medium', 'large'
  index = 0,
  containerWidth, // Passed from parent to avoid hook timing issues
}) => {
  const windowDimensions = useWindowDimensions();
  const [isFavorited, setIsFavorited] = useState(false);
  
  // Safely get width with multiple fallbacks - ensure we always have a valid number
  const width = useMemo(() => {
    if (containerWidth && typeof containerWidth === 'number' && containerWidth > 0 && !isNaN(containerWidth)) {
      return containerWidth;
    }
    
    const wdWidth = windowDimensions?.width;
    if (wdWidth && typeof wdWidth === 'number' && wdWidth > 0 && !isNaN(wdWidth)) {
      return wdWidth;
    }
    
    try {
      const dims = Dimensions.get('window');
      const dimsWidth = dims?.width;
      if (dimsWidth && typeof dimsWidth === 'number' && dimsWidth > 0 && !isNaN(dimsWidth)) {
        return dimsWidth;
      }
    } catch (error) {
      // Silently fall through to default
    }
    
    return 375; // Default iPhone width
  }, [containerWidth, windowDimensions]);

  const {
    id,
    name,
    images = [],
    city = '',
    region = '',
    rating = 0,
    review_count = 0,
    price = null,
    distance = 0,
    category = 'other',
    estimated_duration = null, // in hours
    price_range = null, // e.g., '$$' or { min: 100, max: 500 }
  } = destination;

  const imageUri = images && images.length > 0 ? images[0] : null;

  // Bento Grid sizing
  const getCardDimensions = () => {
    // Ensure width is a valid number
    const safeWidth = typeof width === 'number' && width > 0 ? width : 375;
    const cardSpacing = SPACING.md * 2;
    const availableWidth = safeWidth - cardSpacing;
    
    if (size === 'large') {
      return {
        width: availableWidth,
        height: 320,
        imageHeight: 240,
      };
    } else if (size === 'small') {
      return {
        width: (availableWidth - SPACING.md) / 2,
        height: 230, // Fixed height for standard grid
        imageHeight: 200, // Fixed image height
      };
    } else {
      // Medium - takes 2/3 width
      return {
        width: (availableWidth * 2) / 3 - SPACING.md / 2,
        height: 300,
        imageHeight: 220,
      };
    }
  };

  const dimensions = getCardDimensions();

  // Load favorite status on mount
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (id) {
        const favorited = await isFavorited(id);
        setIsFavorited(favorited);
      }
    };
    loadFavoriteStatus();
  }, [id]);

  const handleFavorite = async (e) => {
    e.stopPropagation(); // Prevent card press when clicking favorite button
    if (!id) return;
    
    const newFavoriteStatus = await toggleFavorite(id);
    setIsFavorited(newFavoriteStatus);
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

  const formatPriceRange = () => {
    if (!price_range) return null;
    if (typeof price_range === 'string') return price_range;
    if (price_range.min && price_range.max) {
      return `$${price_range.min}-${price_range.max}`;
    }
    return null;
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

  return (
    <TouchableOpacity
      style={[styles.card, { width: dimensions.width, height: dimensions.height }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={[styles.image, { height: dimensions.imageHeight }]} />
        ) : (
          <View style={[styles.imagePlaceholder, { height: dimensions.imageHeight }]}>
            <Ionicons name="image-outline" size={48} color={COLORS.grayLight} />
          </View>
        )}

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']}
          style={styles.gradient}
        />

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleFavorite}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorited ? COLORS.accent : COLORS.white}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { marginLeft: SPACING.xs }]}
            onPress={handleShare}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="share-outline" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Price Badge */}
        {typeof price === 'number' && price > 0 && (
          <View style={styles.priceBadge}>
            <Text style={styles.priceLabel}>From</Text>
            <Text style={styles.priceValue}>ETB {price}</Text>
          </View>
        )}
      </View>

      {/* Glassmorphism Footer */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={styles.footerTop}>
            <Text style={styles.title} numberOfLines={2}>
              {name}
            </Text>
            {rating > 0 && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color={COLORS.warning} />
                <Text style={[styles.ratingText, { marginLeft: 4 }]}>{rating.toFixed(1)}</Text>
                {review_count > 0 && (
                  <Text style={styles.reviewCount}>({review_count})</Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.gray} />
            <Text style={[styles.location, { marginLeft: 4 }]} numberOfLines={1}>
              {city || region}
            </Text>
          </View>

          {/* Metadata Row */}
          <View style={styles.metadataRow}>
            {formatDuration() && (
              <View style={styles.metadataBadge}>
                <Ionicons name="time-outline" size={12} color={COLORS.gray} />
                <Text style={[styles.metadataText, { marginLeft: 4 }]}>{formatDuration()}</Text>
              </View>
            )}
            {formatPriceRange() && (
              <View style={styles.metadataBadge}>
                <Ionicons name="cash-outline" size={12} color={COLORS.gray} />
                <Text style={[styles.metadataText, { marginLeft: 4 }]}>{formatPriceRange()}</Text>
              </View>
            )}
            {distance > 0 && (
              <View style={styles.metadataBadge}>
                <Ionicons name="navigate-outline" size={12} color={COLORS.gray} />
                <Text style={[styles.metadataText, { marginLeft: 4 }]}>{distance}km</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  imageContainer: {
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    backgroundColor: COLORS.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  actionButtons: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small,
  },
  priceLabel: {
    fontSize: 9,
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    fontWeight: FONTS.weights.black,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    ...SHADOWS.small,
    height: 80, // Fixed height for consistent card appearance regardless of content
  },
  footerContent: {
    padding: SPACING.md,
    height: '100%',
    justifyContent: 'flex-start',
  },
  footerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
    height: 40, // Fixed height for title area
  },
  title: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.black,
    color: COLORS.secondary,
    marginRight: SPACING.sm,
    lineHeight: 20,
    height: 40, // Fixed height for title (2 lines max)
    overflow: 'hidden',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.secondary,
    fontWeight: FONTS.weights.bold,
  },
  reviewCount: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    height: 18, // Fixed height for consistent spacing
  },
  location: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray,
    fontWeight: FONTS.weights.medium,
    flex: 1,
  },
  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    minHeight: 24, // Fixed minimum height for consistent spacing
  },
  metadataBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundGray,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  metadataText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray,
    fontWeight: FONTS.weights.medium,
  },
});

export default EnhancedDestinationCard;
