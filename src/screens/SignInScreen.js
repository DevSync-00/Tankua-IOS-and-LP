import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PaperBoatIcon from '../components/PaperBoatIcon';
import WavyShape from '../components/WavyShape';
import { useAuth } from '../contexts/AuthContext';

const SignInScreen = ({ navigation }) => {
  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithEmail, signUpWithEmail } = useAuth();

  const isSignUp = mode === 'signup';

  const handleEmailAuth = async () => {
    setLoading(true);
    try {
      if (isSignUp) {
        const result = await signUpWithEmail({ name, email, password });
        if (result.needsEmailConfirmation) {
          Alert.alert(
            'Check your email',
            'We sent you a confirmation link. Confirm your email, then sign in.',
          );
          setMode('signin');
        }
      } else {
        await signInWithEmail(email, password);
      }
    } catch (error) {
      Alert.alert('Authentication failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topWaveContainer}>
        <WavyShape position="top" color="#FFB800" />
      </View>
      <View style={styles.bottomWaveContainer}>
        <WavyShape position="bottom" color="#FFB800" />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <View style={styles.backButtonCircle}>
            <Ionicons name="chevron-back" size={22} color="#000" />
          </View>
        </TouchableOpacity>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoContainer}>
              <PaperBoatIcon size={92} color="#FFB800" />
              <Text style={styles.appName}>Tankua</Text>
            </View>

            <Text style={styles.heading}>{isSignUp ? 'Create account' : 'Sign in now'}</Text>
            <Text style={styles.subheading}>
              Use email or Telegram to continue
            </Text>

            <View style={styles.modeSwitch}>
              <TouchableOpacity
                style={[styles.modeButton, !isSignUp && styles.modeButtonActive]}
                onPress={() => setMode('signin')}
              >
                <Text style={[styles.modeButtonText, !isSignUp && styles.modeButtonTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, isSignUp && styles.modeButtonActive]}
                onPress={() => setMode('signup')}
              >
                <Text style={[styles.modeButtonText, isSignUp && styles.modeButtonTextActive]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {isSignUp && (
              <TextInput
                style={styles.input}
                placeholder="Full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                placeholderTextColor="#A9A9A9"
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholderTextColor="#A9A9A9"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType={isSignUp ? 'newPassword' : 'password'}
              placeholderTextColor="#A9A9A9"
            />

            <TouchableOpacity
              style={[styles.emailButton, loading && styles.disabledButton]}
              onPress={handleEmailAuth}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.emailButtonText}>
                  {isSignUp ? 'Create Account' : 'Sign In with Email'}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerHRule} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerHRule} />
            </View>

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
          </ScrollView>
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
  safeArea: {
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  appName: {
    fontSize: 40,
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
    marginBottom: 24,
  },
  modeSwitch: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#F7F8FA',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    height: 44,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#FFB800',
  },
  modeButtonText: {
    fontSize: 15,
    color: '#7A7A7A',
    fontWeight: '700',
  },
  modeButtonTextActive: {
    color: '#1A1A1A',
  },
  input: {
    width: '100%',
    height: 56,
    borderRadius: 15,
    backgroundColor: '#F7F8FA',
    paddingHorizontal: 18,
    marginBottom: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  emailButton: {
    backgroundColor: '#FFB800',
    width: '100%',
    height: 58,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  emailButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
    marginBottom: 20,
  },
  dividerHRule: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: '#8E8E8E',
  },
  telegramButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 58,
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
