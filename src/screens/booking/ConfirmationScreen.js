import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import Animated, {
  useAnimatedStyle,
} from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, ANIMATIONS } from '../../config/theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';
import ModernButton from '../../components/ModernButton';
import AnimatedCard from '../../components/AnimatedCard';
import Loader from '../../components/Loader';

const ConfirmationScreen = ({ navigation, route }) => {
  const { t } = useLanguage();
  const { currentBooking, createBooking, resetBooking } = useBooking();
  const { user } = useAuth();
  const [booking, setBooking] = useState(route.params?.booking || null);
  const [loading, setLoading] = useState(!route.params?.booking);

  useEffect(() => {
    // Only create booking if it wasn't passed via route params
    if (!route.params?.booking) {
      finalizeBooking();
    }
  }, []);

  const finalizeBooking = async () => {
    try {
      const newBooking = await createBooking(user.id, user);
      setBooking(newBooking);
      setLoading(false);
    } catch (error) {
      if (error.code === 'PROFILE_INCOMPLETE') {
        Alert.alert(
          'Profile Incomplete',
          error.message,
          [
            { text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'Profile' }) }
          ]
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to create booking');
      }
      setLoading(false);
    }
  };

  const handleDone = () => {
    resetBooking();
    // Navigate to parent navigator (AppNavigator) to exit BookingFlow and go to MainTabs
    // This will pop the entire BookingFlow stack
    navigation.getParent()?.navigate('MainTabs', { screen: 'Trips' });
  };

  const handleViewTicket = () => {
    navigation.navigate('Ticket', { booking });
  };

  const successAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: 1 },
      { rotate: '0deg' },
    ],
  }));

  const qrAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 }],
    opacity: 1,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1,
  }));

  if (loading || !booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Loader />
          <Text style={styles.loadingText}>Creating your booking...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <Animated.View style={[styles.successIcon, successAnimatedStyle]}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={64} color={COLORS.white} />
        </View>
        </Animated.View>

        <Text style={styles.title}>{t('bookingConfirmed') || 'Booking Confirmed!'}</Text>
        <Text style={styles.subtitle}>Your trip has been successfully booked</Text>

        {/* QR Code */}
        <Animated.View style={[styles.qrContainer, qrAnimatedStyle]}>
          <AnimatedCard variant="glass">
            <View style={styles.qrContent}>
          <QRCode
            value={booking?.qr_code || booking?.qrCode || 'N/A'}
            size={200}
            backgroundColor={COLORS.white}
            color={COLORS.secondary}
          />
          <Text style={styles.qrCode}>{booking?.qr_code || booking?.qrCode || 'N/A'}</Text>
              <Text style={styles.qrCodeLabel}>Scan this QR code at pickup</Text>
        </View>
          </AnimatedCard>
        </Animated.View>

        {/* Booking Details */}
        <Animated.View style={contentAnimatedStyle}>
          <AnimatedCard variant="glass" style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Trip Details</Text>

          <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
            <Ionicons name="location" size={20} color={COLORS.primary} />
              </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Destination</Text>
              <Text style={styles.detailValue}>
                {booking?.destination_name || booking?.church_name || booking?.churchName || 'Unknown Destination'}
              </Text>
            </View>
          </View>

          {booking?.date && (
            <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
                </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{booking.date}</Text>
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
            <Ionicons name="location" size={20} color={COLORS.primary} />
              </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Pickup Station</Text>
              <Text style={styles.detailValue}>
                {(booking?.pickup_station || booking?.pickupStation)?.name || 
                 (booking?.pickup_station || booking?.pickupStation)?.stationName || 
                 'Pickup Station'}
              </Text>
              {((booking?.pickup_station || booking?.pickupStation)?.pickupTime || 
                (booking?.pickup_station || booking?.pickupStation)?.pickup_time) && (
                <Text style={styles.detailSubValue}>
                  Pickup Time: {(booking?.pickup_station || booking?.pickupStation)?.pickupTime || 
                                (booking?.pickup_station || booking?.pickupStation)?.pickup_time}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
            <Ionicons name="people" size={20} color={COLORS.primary} />
              </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Seats</Text>
              <Text style={styles.detailValue}>{booking?.seats || 1}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>
              {booking?.total_price || booking?.totalPrice || 0} ETB
            </Text>
          </View>
          </AnimatedCard>
        </Animated.View>

        {/* Important Notice */}
        <Animated.View style={contentAnimatedStyle}>
          <AnimatedCard variant="glass" style={styles.noticeCard}>
            <View style={styles.noticeHeader}>
          <Ionicons name="information-circle" size={24} color={COLORS.primary} />
            <Text style={styles.noticeTitle}>Important</Text>
            </View>
            <View style={styles.noticeList}>
              <View style={styles.noticeItem}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.noticeText}>Arrive 15 minutes before pickup time</Text>
              </View>
              <View style={styles.noticeItem}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.noticeText}>Show this QR code to the driver</Text>
              </View>
              <View style={styles.noticeItem}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.noticeText}>Keep your phone charged</Text>
              </View>
              <View style={styles.noticeItem}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.noticeText}>Bring valid ID</Text>
          </View>
        </View>
          </AnimatedCard>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <ModernButton
          title={t('downloadTicket') || 'View Ticket'}
          onPress={handleViewTicket}
          variant="outline"
          size="large"
          style={styles.button}
          icon="ticket-outline"
          iconPosition="left"
        />
        <ModernButton
          title="Done"
          onPress={handleDone}
          variant="primary"
          size="large"
          style={styles.button}
          icon="checkmark"
          iconPosition="right"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.gray,
    fontWeight: '500',
  },
  content: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  successIcon: {
    marginVertical: SPACING.xl,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.large,
  },
  title: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '800',
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    fontWeight: '500',
  },
  qrContainer: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  qrContent: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  qrCode: {
    marginTop: SPACING.lg,
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.secondary,
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
  qrCodeLabel: {
    marginTop: SPACING.xs,
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    fontWeight: '500',
  },
  detailsCard: {
    width: '100%',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: SPACING.lg,
    letterSpacing: -0.5,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.secondary,
    letterSpacing: -0.3,
  },
  detailSubValue: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginTop: SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  totalValue: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -1,
  },
  noticeCard: {
    width: '100%',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  noticeTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  noticeList: {
    gap: SPACING.sm,
  },
  noticeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  noticeText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.secondary,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    flexDirection: 'row',
    gap: SPACING.md,
    ...SHADOWS.large,
  },
  button: {
    flex: 1,
  },
});

export default ConfirmationScreen;
