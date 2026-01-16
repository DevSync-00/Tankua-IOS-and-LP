import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  useWindowDimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../config/theme';
import { useLanguage } from '../contexts/LanguageContext';
import { useBooking } from '../contexts/BookingContext';
import { useAuth } from '../contexts/AuthContext';
import { validateProfile, getProfileIncompleteMessage } from '../utils/profileValidation';
import Button from '../components/Button';

const ChurchDetailScreen = ({ route, navigation }) => {
  const { width } = useWindowDimensions();
  const { church } = route.params;
  const { t } = useLanguage();
  const { updateBooking } = useBooking();
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const handleBookTrip = () => {
    // Validate profile before allowing booking
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

    updateBooking({ church });
    navigation.navigate('BookingFlow', { screen: 'SelectTrip' });
  };

  const handleSave = () => {
    setSaved(!saved);
    // TODO: Save to user's saved churches
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image */}
        <Image source={{ uri: church.images[0] }} style={[styles.image, { width }]} />

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={28}
            color={saved ? COLORS.error : COLORS.white}
          />
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.name}>{church.name}</Text>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {church.tags?.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Info Cards */}
          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <Ionicons name="location" size={24} color={COLORS.primary} />
              <Text style={styles.infoLabel}>{t('location')}</Text>
              <Text style={styles.infoValue}>{church.city}</Text>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="navigate" size={24} color={COLORS.primary} />
              <Text style={styles.infoLabel}>{t('distance')}</Text>
              <Text style={styles.infoValue}>{church.distance} km</Text>
            </View>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('about')}</Text>
            <Text style={styles.description}>{church.description}</Text>
          </View>

          {/* Popular Trips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('popularTrips')}</Text>
            <View style={styles.tripCard}>
              <View style={styles.tripInfo}>
                <Text style={styles.tripType}>{t('groupTrip')}</Text>
                <Text style={styles.tripDate}>Next: Dec 25, 2025</Text>
              </View>
              <Text style={styles.tripPrice}>500 ETB</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Book Button */}
      <View style={styles.footer}>
        <Button
          title={t('bookTrip')}
          onPress={handleBookTrip}
          variant="primary"
          size="large"
          style={styles.bookButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  image: {
    height: 300,
    backgroundColor: COLORS.lightGray,
  },
  saveButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.md,
  },
  name: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SPACING.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.lg,
  },
  tag: {
    backgroundColor: `${COLORS.primary}20`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tagText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  infoCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
    ...SHADOWS.medium,
  },
  infoLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginTop: SPACING.xs,
  },
  infoValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.secondary,
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray,
    lineHeight: 22,
  },
  tripCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  tripInfo: {
    flex: 1,
  },
  tripType: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  tripDate: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
  },
  tripPrice: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.large,
  },
  bookButton: {
    width: '100%',
  },
});

export default ChurchDetailScreen;

