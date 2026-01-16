import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, ANIMATIONS } from '../config/theme';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import ModernButton from '../components/ModernButton';

const LoginScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const { t } = useLanguage();
  const { sendOTP, verifyOTP } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpPhone, setOtpPhone] = useState(null);
  const [loading, setLoading] = useState(false);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: 1 },
      { rotate: '0deg' },
    ],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1,
    transform: [{ translateY: 0 }],
  }));

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setOtp('');
    setOtpPhone(null);
    try {
      const result = await sendOTP(phoneNumber);
      setOtpPhone(result.phoneNumber);
      Alert.alert('Success', 'OTP sent to your phone');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(otpPhone || phoneNumber, otp);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Animated Logo */}
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>⛪</Text>
            </View>
            <Text style={styles.appName}>{t('appName') || 'Tankua'}</Text>
            <Text style={styles.tagline}>Your Journey to Sacred Places</Text>
          </Animated.View>

          {/* Animated Form */}
          <Animated.View style={[styles.form, formAnimatedStyle]}>
            {!otpPhone ? (
              <>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="call-outline" size={20} color={COLORS.primary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="+251 9XX XXX XXX"
                    placeholderTextColor={COLORS.gray}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    autoFocus
                  />
                </View>

                <ModernButton
                  title={t('sendOTP') || 'Send OTP'}
                  onPress={handleSendOTP}
                  loading={loading}
                  variant="primary"
                  size="large"
                  style={styles.button}
                  icon="send"
                  iconPosition="right"
                />
              </>
            ) : (
              <>
                <View style={styles.otpHeader}>
                  <Text style={styles.otpTitle}>Enter Verification Code</Text>
                  <Text style={styles.otpSubtitle}>
                    Sent to {otpPhone}
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="000000"
                    placeholderTextColor={COLORS.gray}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />
                </View>

                <ModernButton
                  title={t('verifyOTP') || 'Verify OTP'}
                  onPress={handleVerifyOTP}
                  loading={loading}
                  variant="primary"
                  size="large"
                  style={styles.button}
                  icon="checkmark-circle"
                  iconPosition="right"
                />

                <ModernButton
                  title={t('resendOTP') || 'Resend Code'}
                  onPress={handleSendOTP}
                  variant="ghost"
                  size="medium"
                  style={styles.resendButton}
                />
              </>
            )}
          </Animated.View>

          <Text style={styles.footer}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.primary,
  },
  logoEmoji: {
    fontSize: 60,
  },
  appName: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray,
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  otpHeader: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  otpTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  otpSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    ...SHADOWS.medium,
  },
  inputIcon: {
    paddingLeft: SPACING.md,
    paddingRight: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingRight: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  button: {
    marginTop: SPACING.sm,
  },
  resendButton: {
    marginTop: SPACING.md,
  },
  footer: {
    textAlign: 'center',
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray,
    marginTop: SPACING.xl,
    lineHeight: 18,
    paddingHorizontal: SPACING.lg,
  },
});

export default LoginScreen;
