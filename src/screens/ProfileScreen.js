import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';

// ─── Menu section definition ─────────────────────────────────────────────────

const MENU_SECTIONS = [
  {
    title: 'Account',
    items: [
      {
        id: 'account',
        icon: 'person-outline',
        label: 'My Account',
        sublabel: 'Edit your personal details',
        screen: 'MyAccount',
      },
      {
        id: 'saved',
        icon: 'heart-outline',
        label: 'Saved Destinations',
        sublabel: 'Your bookmarked places',
        screen: 'SavedDestinations',
      },
    ],
  },
  {
    title: 'Travel',
    items: [
      {
        id: 'suggest',
        icon: 'map-outline',
        label: 'Suggest a Trip',
        sublabel: 'Recommend a new route',
        screen: 'SuggestRoute',
      },
      {
        id: 'friends',
        icon: 'people-outline',
        label: 'Close Friends',
        sublabel: 'Travel with your circle',
        screen: 'CloseFriends',
      },
      {
        id: 'refer',
        icon: 'share-social-outline',
        label: 'Refer a Friend',
        sublabel: 'Invite friends and earn rewards',
        screen: 'ReferFriend',
      },
    ],
  },
  {
    title: 'Perks',
    items: [
      {
        id: 'rewards',
        icon: 'gift-outline',
        label: 'Rewards',
        sublabel: 'Your points and benefits',
        screen: 'Rewards',
      },
      {
        id: 'coupons',
        icon: 'pricetag-outline',
        label: 'Coupons',
        sublabel: 'Discounts and promo codes',
        screen: 'Coupons',
      },
      {
        id: 'payment',
        icon: 'card-outline',
        label: 'Payment Methods',
        sublabel: 'Manage your payment options',
        screen: 'PaymentMethods',
      },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        id: 'notifications',
        icon: 'notifications-outline',
        label: 'Notifications',
        sublabel: 'See your activity',
        screen: 'Notifications',
      },
      {
        id: 'notificationSettings',
        icon: 'settings-outline',
        label: 'Notification Settings',
        sublabel: 'Manage push preferences',
        screen: 'NotificationPreferences',
      },
      {
        id: 'help',
        icon: 'help-circle-outline',
        label: 'Help Center',
        sublabel: 'FAQs and support',
        screen: 'HelpCenter',
      },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const Avatar = ({ user }) => {
  const photoUrl = user?.photo_url;
  const initials = (user?.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (photoUrl) {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={styles.avatarImage}
        resizeMode="cover"
      />
    );
  }

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryDark]}
      style={styles.avatarImage}
    >
      <Text style={styles.avatarInitials}>{initials}</Text>
    </LinearGradient>
  );
};

const MenuRow = ({ item, onPress, isLast }) => (
  <>
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.65}
    >
      <View style={styles.menuIconWrap}>
        <Ionicons name={item.icon} size={20} color={COLORS.iconPrimary} />
      </View>
      <View style={styles.menuTextWrap}>
        <Text style={styles.menuLabel}>{item.label}</Text>
        {item.sublabel ? (
          <Text style={styles.menuSublabel}>{item.sublabel}</Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.grayLight} />
    </TouchableOpacity>
    {!isLast && <View style={styles.rowDivider} />}
  </>
);

// ─── Main screen ──────────────────────────────────────────────────────────────

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: logout,
        },
      ],
    );
  };

  const navigate = (screen) => navigation.navigate(screen);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Page title ───────────────────────────────────────────────── */}
        <Text style={styles.pageTitle}>Profile</Text>

        {/* ── Hero card ────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.heroCard}
          activeOpacity={0.85}
          onPress={() => navigate('MyAccount')}
        >
          <View style={styles.heroLeft}>
            <View style={styles.avatarWrap}>
              <Avatar user={user} />
            </View>
            <View style={styles.heroText}>
              <Text style={styles.heroName} numberOfLines={1}>
                {user?.name || 'Traveler'}
              </Text>
              <Text style={styles.heroSub} numberOfLines={1}>
                {user?.telegram_username
                  ? `@${user.telegram_username}`
                  : user?.email || 'Tap to complete profile'}
              </Text>
              <View style={styles.telegramBadge}>
                <Text style={styles.telegramBadgeText}>✈  Telegram</Text>
              </View>
            </View>
          </View>
          <View style={styles.editChip}>
            <Ionicons name="pencil" size={14} color={COLORS.primary} />
            <Text style={styles.editChipText}>Edit</Text>
          </View>
        </TouchableOpacity>

        {/* ── Menu sections ────────────────────────────────────────────── */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) => (
                <MenuRow
                  key={item.id}
                  item={item}
                  onPress={() => navigate(item.screen)}
                  isLast={idx === section.items.length - 1}
                />
              ))}
            </View>
          </View>
        ))}

        {/* ── Sign out ─────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Tankua · v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  scroll: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 120, // clear the floating tab bar
  },

  // Page title
  pageTitle: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: FONTS.weights.black,
    color: COLORS.secondary,
    letterSpacing: -0.5,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },

  // Hero card
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarWrap: {
    marginRight: SPACING.md,
  },
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarInitials: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
  heroText: {
    flex: 1,
    gap: 3,
  },
  heroName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.secondary,
  },
  heroSub: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    fontWeight: FONTS.weights.medium,
  },
  telegramBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: '#229ED915',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  telegramBadgeText: {
    fontSize: FONTS.sizes.xs,
    color: '#1a85c0',
    fontWeight: FONTS.weights.semibold,
  },
  editChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${COLORS.primary}18`,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginLeft: SPACING.sm,
  },
  editChipText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
  },

  // Sections
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.grayLight,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs + 2,
    marginLeft: SPACING.xs,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.small,
  },

  // Menu rows
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: `${COLORS.iconPrimary}12`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.secondary,
    marginBottom: 1,
  },
  menuSublabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.grayLight,
    fontWeight: FONTS.weights.regular,
  },
  rowDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginLeft: 38 + SPACING.md + SPACING.md, // align under text
  },

  // Sign out
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: `${COLORS.error}10`,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md + 2,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: `${COLORS.error}20`,
  },
  signOutText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.error,
  },

  // Footer
  version: {
    textAlign: 'center',
    fontSize: FONTS.sizes.xs,
    color: COLORS.grayLight,
    marginBottom: SPACING.md,
  },
});

export default ProfileScreen;
