import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PaperBoatIcon from '../components/PaperBoatIcon';
import WavyShape from '../components/WavyShape';

// ─────────────────────────────────────────────────────────────────────────────
// SMS / OTP sign-in is temporarily disabled.
// The only sign-in method is Telegram Login (see TelegramLoginScreen).
// To re-enable SMS, uncomment the blocks marked [SMS DISABLED].
// ─────────────────────────────────────────────────────────────────────────────

/* [SMS DISABLED]
import { useState } from 'react';
import { TextInput, Alert, KeyboardAvoidingView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import EthiopiaFlag from '../components/EthiopiaFlag';
*/

const SignInScreen = ({ navigation }) => {
  /* [SMS DISABLED]
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { sendOTP } = useAuth();

  const handleSignIn = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      const result = await sendOTP(phoneNumber);
      navigation.navigate('OTP', { phoneNumber: result.phoneNumber });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };
  */

  return (
    <View style={styles.container}>
      {/* Background shapes */}
      <View style={styles.topWaveContainer}>
        <WavyShape position="top" color="#FFB800" />
      </View>
      <View style={styles.bottomWaveContainer}>
        <WavyShape position="bottom" color="#FFB800" />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backButtonCircle}>
            <Ionicons name="chevron-back" size={22} color="#000" />
          </View>
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <PaperBoatIcon size={100} color="#FFB800" />
            <Text style={styles.appName}>Tankua</Text>
          </View>

          <Text style={styles.heading}>Sign in now</Text>
          <Text style={styles.subheading}>Please sign in to continue our app</Text>

          {/* ── [SMS DISABLED] Phone input + Sign In button ────────────────
          <View style={styles.inputWrapper}>
            <View style={styles.flagSection}>
              <EthiopiaFlag size={32} />
            </View>
            <View style={styles.dividerLine} />
            <TextInput
              style={styles.input}
              placeholder="09XXXXXXXX"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholderTextColor="#A9A9A9"
            />
          </View>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.9}
          >
            <Text style={styles.signInButtonText}>
              {loading ? 'Processing...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>*Terms and conditions apply</Text>

          <View style={styles.dividerRow}>
            <View style={styles.dividerHRule} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerHRule} />
          </View>
          ── end SMS DISABLED ── */}

          {/* Telegram — primary (and currently only) sign-in method */}
          <TouchableOpacity
            style={styles.telegramButton}
            onPress={() => navigation.navigate('TelegramLogin')}
            activeOpacity={0.85}
          >
            <View style={styles.telegramIconCircle}>
              <Text style={styles.telegramIconText}>✈</Text>
            </View>
            <Text style={styles.telegramButtonText}>Continue with Telegram</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>*Terms and conditions apply</Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topWaveContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  bottomWaveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  backButton: {
    paddingLeft: 20,
    paddingTop: 10,
  },
  backButtonCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    marginTop: -40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 42,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: Platform.OS === 'ios' ? 'Hoefler Text' : 'serif',
    marginTop: 10,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: '#8E8E8E',
    marginBottom: 40,
  },
  // ── [SMS DISABLED] styles kept for easy re-enable ──────────────────────
  // inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F8FA',
  //   borderRadius: 15, width: '100%', height: 65, marginBottom: 30, overflow: 'hidden' },
  // flagSection: { paddingHorizontal: 15, justifyContent: 'center' },
  // dividerLine: { width: 1, height: '60%', backgroundColor: '#E0E0E0' },
  // input: { flex: 1, fontSize: 18, paddingHorizontal: 15, color: '#000' },
  // signInButton: { backgroundColor: '#FFB800', width: '100%', height: 60, borderRadius: 15,
  //   justifyContent: 'center', alignItems: 'center', marginBottom: 80,
  //   elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.1, shadowRadius: 4 },
  // signInButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  // dividerRow: { flexDirection: 'row', alignItems: 'center', width: '100%',
  //   marginTop: 8, marginBottom: 20 },
  // dividerHRule: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
  // dividerText: { marginHorizontal: 12, fontSize: 13, color: '#8E8E8E' },
  // ── end SMS DISABLED styles ─────────────────────────────────────────────
  telegramButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 60,
    borderRadius: 15,
    backgroundColor: '#229ED9',
    gap: 10,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  telegramIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  telegramIconText: {
    fontSize: 16,
    color: '#FFFFFF',
    transform: [{ rotate: '30deg' }],
  },
  telegramButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  termsText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  },
});

export default SignInScreen;
