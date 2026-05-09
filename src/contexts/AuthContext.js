import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';
import { registerForPushNotifications, savePushToken } from '../services/notifications';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const DEFAULT_COUNTRY_CODE = '+251';

  useEffect(() => {
    checkUser();
    
    // Listen for auth changes (handles automatic session refresh, logout, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        // User is authenticated, load their profile
        await loadUserProfile(session.user.id);
      } else {
        // User is not authenticated, clear state
        setUser(null);
        setIsAdmin(false);
        await AsyncStorage.removeItem('user');
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      // First, try to get cached user from AsyncStorage for faster initial load
      const cachedUser = await AsyncStorage.getItem('user');
      if (cachedUser) {
        try {
          const userData = JSON.parse(cachedUser);
          // Ensure location field exists (for backward compatibility)
          const userWithLocation = {
            ...userData,
            location: userData.location || '',
            saved_destinations: userData.saved_destinations || userData.saved_churches || [],
            saved_stations: userData.saved_stations || [],
          };
          setUser(userWithLocation);
          setIsAdmin(userData.is_admin || false);
        } catch (e) {
          console.log('Error parsing cached user:', e);
        }
      }

      // Then verify session with Supabase (this handles automatic session restoration)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.log('Session error:', sessionError);
        // If session check fails, clear cached user
        if (cachedUser) {
          await AsyncStorage.removeItem('user');
          setUser(null);
          setIsAdmin(false);
        }
      } else if (session?.user) {
        // Session is valid, load fresh user profile
        await loadUserProfile(session.user.id);
        // Register for push notifications
        const pushToken = await registerForPushNotifications();
        if (pushToken && session.user.id) {
          await savePushToken(session.user.id, pushToken);
        }
      } else {
        // No valid session, clear user state
        if (cachedUser) {
          await AsyncStorage.removeItem('user');
          setUser(null);
          setIsAdmin(false);
        }
      }
    } catch (error) {
      console.log('Error checking user:', error);
      // On error, clear any cached data
      await AsyncStorage.removeItem('user');
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const applyUserState = async (data) => {
    const userData = {
      ...data,
      name: data.name || '',
      phone_number: data.phone_number || '',
      emergency_contact: data.emergency_contact || '',
      location: data.location || '',
      saved_destinations: data.saved_destinations || data.saved_churches || [],
      saved_stations: data.saved_stations || [],
    };

    setUser(userData);
    setIsAdmin(data.is_admin || false);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const createUserProfile = async (userId, phoneNumber = '') => {
    const newUser = {
      id: userId,
      phone_number: phoneNumber,
      name: '',
      email: '',
      emergency_contact: '',
      location: '',
      saved_destinations: [],
      saved_stations: [],
      is_admin: false,
    };

    const { data, error } = await supabase
      .from('users')
      .upsert([newUser], { onConflict: 'id' })
      .select('*')
      .single();

    if (error) throw error;
    return applyUserState(data);
  };

  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const { data: authData } = await supabase.auth.getUser();
        await createUserProfile(userId, authData?.user?.phone || '');
        return;
      }

      await applyUserState(data);
    } catch (error) {
      console.log('Error loading user profile:', error);
    }
  };

  const normalizePhoneNumber = (phoneNumber) => {
    const rawInput = (phoneNumber || '').trim();
    if (!rawInput) {
      throw new Error('Please enter a valid phone number');
    }

    const cleaned = rawInput.replace(/[^\d+]/g, '');
    let normalized = cleaned;

    if (cleaned.startsWith('00')) {
      normalized = `+${cleaned.slice(2)}`;
    } else if (!cleaned.startsWith('+')) {
      if (/^0\d{9}$/.test(cleaned)) {
        normalized = `${DEFAULT_COUNTRY_CODE}${cleaned.slice(1)}`;
      } else if (/^\d{9}$/.test(cleaned)) {
        normalized = `${DEFAULT_COUNTRY_CODE}${cleaned}`;
      } else {
        normalized = `+${cleaned}`;
      }
    }

    if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
      throw new Error('Use a valid phone number format like 09XXXXXXXX or +2519XXXXXXXX');
    }

    return normalized;
  };

  const getOtpErrorMessage = (error) => {
    const providerMessage = error?.message || 'Unable to send OTP right now. Please try again.';

    if (providerMessage.includes('20003') || providerMessage.toLowerCase().includes('authenticate')) {
      return 'SMS provider authentication failed. Update Twilio credentials in Supabase Auth > Phone settings.';
    }

    return providerMessage;
  };

  const sendOTP = async (phoneNumber) => {
    try {
      const formattedPhone = normalizePhoneNumber(phoneNumber);

      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;

      return { success: true, phoneNumber: formattedPhone };
    } catch (error) {
      throw new Error(getOtpErrorMessage(error));
    }
  };

  const verifyOTP = async (phoneNumber, token) => {
    try {
      const formattedPhone = normalizePhoneNumber(phoneNumber);

      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: token,
        type: 'sms',
      });

      if (error) throw error;

      if (data.user) {
        // Check if user profile exists
        const { data: existingUser, error: existingUserError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (existingUserError) throw existingUserError;

        if (!existingUser) {
          await createUserProfile(data.user.id, formattedPhone);
        } else {
          await applyUserState(existingUser);
        }
      }

      return data.user;
    } catch (error) {
      throw new Error(getOtpErrorMessage(error));
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem('user');
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Reload user from database to ensure all fields are up to date
      await loadUserProfile(user.id);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        sendOTP,
        verifyOTP,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
