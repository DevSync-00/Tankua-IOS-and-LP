import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../config/theme';

const ChurchCard = ({ church, onPress, variant = 'list' }) => {
  // Get first image or use placeholder
  const imageUri = church.images && church.images.length > 0 
    ? church.images[0] 
    : 'https://via.placeholder.com/400x300?text=Church';

  if (variant === 'grid') {
    return (
      <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.8}>
        <Image source={{ uri: imageUri }} style={styles.gridImage} />
        <View style={styles.gridContent}>
          <Text style={styles.gridName} numberOfLines={2}>{church.name}</Text>
          <View style={styles.gridFooter}>
            <Ionicons name="location-outline" size={14} color={COLORS.gray} />
            <Text style={styles.gridLocation}>{church.city || 'Unknown'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.listCard} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: imageUri }} style={styles.listImage} />
      <View style={styles.listContent}>
        <Text style={styles.listName} numberOfLines={1}>{church.name}</Text>
        <Text style={styles.listDescription} numberOfLines={2}>
          {church.description || ''}
        </Text>
        <View style={styles.listFooter}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color={COLORS.gray} />
            <Text style={styles.listLocation}>{church.city || 'Unknown'}</Text>
          </View>
          <Text style={styles.distance}>{church.distance || 0} km</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // List variant
  listCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
    overflow: 'hidden',
  },
  listImage: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.lightGray,
  },
  listContent: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  listName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  listDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    lineHeight: 18,
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listLocation: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginLeft: SPACING.xs,
  },
  distance: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Grid variant
  gridCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    margin: SPACING.xs,
    ...SHADOWS.medium,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.lightGray,
  },
  gridContent: {
    padding: SPACING.md,
  },
  gridName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
    height: 40,
  },
  gridFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridLocation: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginLeft: SPACING.xs,
  },
});

export default ChurchCard;

