import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import ModernButton from '../components/ModernButton';

const MyAccountScreen = ({ navigation }) => {
  const { user, updateProfile, logout } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    emergency_contact: user?.emergency_contact || '',
    location: user?.location || '',
  });

  const handleSave = async () => {
    if (!formData.name || !formData.phone_number) {
      Alert.alert('Error', 'Name and phone number are required');
      return;
    }

    try {
      setLoading(true);
      await updateProfile(formData);
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Account</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter your full name"
              placeholderTextColor={COLORS.grayLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.grayLight}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone_number}
              onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
              placeholder="Enter your phone number"
              placeholderTextColor={COLORS.grayLight}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Emergency Contact</Text>
            <TextInput
              style={styles.input}
              value={formData.emergency_contact}
              onChangeText={(text) => setFormData({ ...formData, emergency_contact: text })}
              placeholder="Emergency contact phone number"
              placeholderTextColor={COLORS.grayLight}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
              placeholder="Your location (city, address)"
              placeholderTextColor={COLORS.grayLight}
            />
          </View>

          {/* Language Toggle */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Language</Text>
            <View style={styles.languageToggle}>
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  language === 'am' && styles.languageOptionActive,
                ]}
                onPress={() => changeLanguage('am')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.languageText,
                    language === 'am' && styles.languageTextActive,
                  ]}
                >
                  Amharic
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  language === 'en' && styles.languageOptionActive,
                ]}
                onPress={() => changeLanguage('en')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.languageText,
                    language === 'en' && styles.languageTextActive,
                  ]}
                >
                  English
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notification Settings Shortcut */}
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate('NotificationPreferences')}
            activeOpacity={0.7}
          >
            <View style={styles.linkLeft}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.linkText}>Notification Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => {
              Alert.alert(
                'Log out',
                'Are you sure you want to log out?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Log out',
                    style: 'destructive',
                    onPress: async () => {
                      await logout();
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'SignIn' }],
                      });
                    },
                  },
                ]
              );
            }}
            activeOpacity={0.7}
          >
            <View style={styles.linkLeft}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
              <Text style={[styles.linkText, { color: COLORS.error }]}>Log out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <ModernButton
          title="Save Changes"
          onPress={handleSave}
          variant="primary"
          size="large"
          loading={loading}
          style={styles.saveButton}
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
    paddingBottom: SPACING.xl,
  },
  form: {
    gap: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  saveButton: {
    width: '100%',
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  languageToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
    padding: SPACING.xs,
    ...SHADOWS.small,
  },
  languageOption: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  languageOptionActive: {
    backgroundColor: COLORS.primary,
  },
  languageText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    fontWeight: FONTS.weights.medium,
  },
  languageTextActive: {
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
  },
  linkRow: {
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderColor: COLORS.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  linkText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.secondary,
    fontWeight: FONTS.weights.medium,
  },
});

export default MyAccountScreen;
