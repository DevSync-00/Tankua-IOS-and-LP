import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../config/theme';
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  registerForPushNotifications,
  savePushToken,
} from '../services/notifications';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/Loader';

const NotificationPreferencesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    bookingUpdates: true,
    tripReminders: true,
    promotions: true,
    announcements: true,
  });
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    loadPreferences();
    checkPushStatus();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await getNotificationPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPushStatus = async () => {
    try {
      const { status } = await require('expo-notifications').getPermissionsAsync();
      setPushEnabled(status === 'granted');
    } catch (error) {
      console.error('Error checking push status:', error);
    }
  };

  const handleToggle = async (key) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(newPreferences);
    await saveNotificationPreferences(newPreferences);
  };

  const handleEnablePush = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please sign in to enable push notifications');
      return;
    }

    try {
      const token = await registerForPushNotifications();
      if (token) {
        await savePushToken(user.id, token);
        setPushEnabled(true);
        Alert.alert('Success', 'Push notifications enabled');
      } else {
        Alert.alert('Permission Denied', 'Please enable notifications in your device settings');
      }
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      Alert.alert('Error', 'Failed to enable push notifications');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
          <Text style={styles.title}>Notification Settings</Text>
          <View style={styles.placeholder} />
        </View>
        <Loader />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Notification Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Push Notifications Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Push Notifications</Text>
          </View>
          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Enable Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive notifications even when the app is closed
              </Text>
            </View>
            {pushEnabled ? (
              <View style={styles.enabledBadge}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <Text style={styles.enabledText}>Enabled</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.enableButton}
                onPress={handleEnablePush}
              >
                <Text style={styles.enableButtonText}>Enable</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Notification Types */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings-outline" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Notification Types</Text>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Booking Updates</Text>
                <Text style={styles.settingDescription}>
                  Confirmations, cancellations, and status changes
                </Text>
              </View>
            </View>
            <Switch
              value={preferences.bookingUpdates}
              onValueChange={() => handleToggle('bookingUpdates')}
              trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <Ionicons name="alarm-outline" size={20} color={COLORS.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Trip Reminders</Text>
                <Text style={styles.settingDescription}>
                  Reminders before your scheduled trips
                </Text>
              </View>
            </View>
            <Switch
              value={preferences.tripReminders}
              onValueChange={() => handleToggle('tripReminders')}
              trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <Ionicons name="gift-outline" size={20} color={COLORS.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Promotions</Text>
                <Text style={styles.settingDescription}>
                  Special offers, discounts, and deals
                </Text>
              </View>
            </View>
            <Switch
              value={preferences.promotions}
              onValueChange={() => handleToggle('promotions')}
              trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <Ionicons name="megaphone-outline" size={20} color={COLORS.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Announcements</Text>
                <Text style={styles.settingDescription}>
                  Important updates and news
                </Text>
              </View>
            </View>
            <Switch
              value={preferences.announcements}
              onValueChange={() => handleToggle('announcements')}
              trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            You can change these settings at any time. Some notifications may still be sent for critical updates.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.secondary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl + SPACING.xxl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.secondary,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.secondary,
    marginBottom: SPACING.xs / 2,
  },
  settingDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    lineHeight: 18,
  },
  enabledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: `${COLORS.success}15`,
    borderRadius: BORDER_RADIUS.sm,
  },
  enabledText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.success,
  },
  enableButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
  },
  enableButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  infoText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    lineHeight: 20,
  },
});

export default NotificationPreferencesScreen;
