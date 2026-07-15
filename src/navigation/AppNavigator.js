import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/Loader';
import { COLORS } from '../config/theme';

// Auth Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import SignInScreen from '../screens/SignInScreen';
// [SMS DISABLED] import OTPScreen from '../screens/OTPScreen';
import TelegramLoginScreen from '../screens/TelegramLoginScreen';

// Main Screens
import MainTabNavigator from './MainTabNavigator';
import DestinationDetailScreen from '../screens/DestinationDetailScreen';
import ChurchDetailScreen from '../screens/ChurchDetailScreen'; // Deprecated: kept for backward compatibility only - use DestinationDetailScreen instead
import BookingFlowNavigator from './BookingFlowNavigator';
import TicketScreen from '../screens/TicketScreen';

// Profile Screens
import MyAccountScreen from '../screens/MyAccountScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import NotificationPreferencesScreen from '../screens/NotificationPreferencesScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import CouponsScreen from '../screens/CouponsScreen';
import RewardsScreen from '../screens/RewardsScreen';
import ReferFriendScreen from '../screens/ReferFriendScreen';
import SuggestRouteScreen from '../screens/SuggestRouteScreen';
import CloseFriendsScreen from '../screens/CloseFriendsScreen';
import SavedDestinationsScreen from '../screens/SavedDestinationsScreen';
import ReviewScreen from '../screens/ReviewScreen';

// Admin Screens
import AddAdminScreen from '../screens/admin/AddAdminScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  useEffect(() => {
    const loadOnboardingFlag = async () => {
      try {
        const value = await AsyncStorage.getItem('has_seen_onboarding');
        setHasSeenOnboarding(value === 'true');
      } catch (error) {
        console.log('Error loading onboarding flag:', error);
      } finally {
        setOnboardingChecked(true);
      }
    };

    loadOnboardingFlag();
  }, []);

  if (loading || !onboardingChecked) {
    // Show loading screen while checking authentication and onboarding flag
    return (
      <View style={styles.loadingContainer}>
        <Loader size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* First app launch: always show onboarding */}
      {!hasSeenOnboarding ? (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          {/* [SMS DISABLED] <Stack.Screen name="OTP" component={OTPScreen} /> */}
          <Stack.Screen name="TelegramLogin" component={TelegramLoginScreen} />
        </>
      ) : !user ? (
        <>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          {/* [SMS DISABLED] <Stack.Screen name="OTP" component={OTPScreen} /> */}
          <Stack.Screen name="TelegramLogin" component={TelegramLoginScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen 
            name="DestinationDetail" 
            component={DestinationDetailScreen}
            options={{ headerShown: true, headerTitle: '' }}
          />
          <Stack.Screen 
            name="ChurchDetail" 
            component={ChurchDetailScreen}
            options={{ headerShown: true, headerTitle: '' }}
            // Deprecated: kept for backward compatibility only - use DestinationDetail instead
          />
          <Stack.Screen 
            name="BookingFlow" 
            component={BookingFlowNavigator}
          />
          <Stack.Screen 
            name="Ticket" 
            component={TicketScreen}
            options={{ headerShown: true, headerTitle: 'Ticket' }}
          />
          <Stack.Screen 
            name="MyAccount" 
            component={MyAccountScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="NotificationPreferences" 
            component={NotificationPreferencesScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="HelpCenter" 
            component={HelpCenterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="PaymentMethods" 
            component={PaymentMethodsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Coupons" 
            component={CouponsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Rewards" 
            component={RewardsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="ReferFriend" 
            component={ReferFriendScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="SuggestRoute" 
            component={SuggestRouteScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="CloseFriends" 
            component={CloseFriendsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="SavedDestinations" 
            component={SavedDestinationsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Review" 
            component={ReviewScreen}
            options={{ headerShown: true, headerTitle: 'Rate Your Trip' }}
          />
          <Stack.Screen 
            name="AddAdmin" 
            component={AddAdminScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});

export default AppNavigator;

