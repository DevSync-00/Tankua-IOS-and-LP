import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import PaperBoatIcon from '../components/PaperBoatIcon';
import EthiopiaFlag from '../components/EthiopiaFlag';
import WavyShape from '../components/WavyShape';

const SignInScreen = ({ navigation }) => {
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

  return (
    <View style={styles.container}>
      {/* Absolute Background Shapes */}
      <View style={styles.topWaveContainer}>
        <WavyShape position="top" color="#FFB800" /> 
      </View>
      <View style={styles.bottomWaveContainer}>
        <WavyShape position="bottom" color="#FFB800" />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
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
            {/* Logo Section */}
            <View style={styles.logoContainer}>
              <PaperBoatIcon size={100} color="#FFB800" />
              <Text style={styles.appName}>Tankua</Text>
            </View>

            {/* Headers */}
            <Text style={styles.heading}>Sign in now</Text>
            <Text style={styles.subheading}>Please sign in to continue our app</Text>

            {/* Input styled like the image */}
            <View style={styles.inputWrapper}>
              <View style={styles.flagSection}>
                <EthiopiaFlag size={32} />
              </View>
              <View style={styles.divider} />
              <TextInput
                style={styles.input}
                placeholder="09XXXXXXXX"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholderTextColor="#A9A9A9"
              />
            </View>

            {/* Main Sign In Button */}
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
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
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
    marginTop: -40, // Adjust to balance with logo height
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA', // Light gray background from image
    borderRadius: 15,
    width: '100%',
    height: 65,
    marginBottom: 30,
    overflow: 'hidden',
  },
  flagSection: {
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    fontSize: 18,
    paddingHorizontal: 15,
    color: '#000',
  },
  signInButton: {
    backgroundColor: '#FFB800', // Matches the yellow in the image
    width: '100%',
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 80,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  termsText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  },
});

export default SignInScreen;