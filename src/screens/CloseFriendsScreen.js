import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import ModernButton from '../components/ModernButton';
import Loader from '../components/Loader';

const CloseFriendsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingFriend, setAddingFriend] = useState(false);

  useEffect(() => {
    loadFriends();
  }, [user]);

  const loadFriends = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('close_friends')
        .select(`
          id,
          friend_user_id,
          created_at,
          users!close_friends_friend_user_id_fkey (
            id,
            name,
            phone_number,
            email
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Table doesn't exist yet — treat as empty, not an error
      if (error) {
        if (error.code === 'PGRST205' || error.code === '42P01') {
          setFriends([]);
          return;
        }
        throw error;
      }

      // Get trip counts for each friend
      const friendsWithTrips = await Promise.all(
        (data || []).map(async (friendship) => {
          const friendUser = friendship.users;
          if (!friendUser) return null;

          // Count trips together (bookings on same trip)
          const { count } = await supabase
            .from('bookings')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', friendUser.id);

          return {
            id: friendship.id,
            friendId: friendUser.id,
            name: friendUser.name || 'Unknown',
            phone: friendUser.phone_number || '',
            email: friendUser.email || '',
            trips: count || 0,
          };
        })
      );

      setFriends(friendsWithTrips.filter(Boolean));
    } catch (error) {
      console.error('Error loading friends:', error);
      // Only show alert for unexpected errors, not missing table
      if (error.code !== 'PGRST205' && error.code !== '42P01') {
        Alert.alert('Error', 'Failed to load friends');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.phone.includes(searchQuery)
  );

  const handleAddFriend = () => {
    Alert.prompt(
      'Add Friend',
      'Enter your friend\'s phone number to add them to your close friends list.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async (phoneNumber) => {
            if (!phoneNumber || !phoneNumber.trim()) {
              Alert.alert('Error', 'Please enter a phone number');
              return;
            }

            await addFriendByPhone(phoneNumber.trim());
          },
        },
      ],
      'plain-text'
    );
  };

  const addFriendByPhone = async (phoneNumber) => {
    if (!user?.id) {
      Alert.alert('Error', 'Please sign in to add friends');
      return;
    }

    setAddingFriend(true);
    try {
      // Find user by phone number
      const { data: friendUser, error: findError } = await supabase
        .from('users')
        .select('id, name, phone_number')
        .eq('phone_number', phoneNumber)
        .single();

      if (findError || !friendUser) {
        Alert.alert('Not Found', 'No user found with that phone number');
        return;
      }

      if (friendUser.id === user.id) {
        Alert.alert('Error', 'You cannot add yourself as a friend');
        return;
      }

      // Check if already friends
      const { data: existing } = await supabase
        .from('close_friends')
        .select('id')
        .eq('user_id', user.id)
        .eq('friend_user_id', friendUser.id)
        .maybeSingle();

      if (existing) {
        Alert.alert('Already Added', 'This user is already in your close friends list');
        return;
      }

      // Add friend
      const { error: addError } = await supabase
        .from('close_friends')
        .insert({
          user_id: user.id,
          friend_user_id: friendUser.id,
        });

      if (addError) {
        if (addError.code === 'PGRST205' || addError.code === '42P01') {
          Alert.alert('Coming Soon', 'Close Friends is not set up yet. Check back later!');
          return;
        }
        throw addError;
      }

      Alert.alert('Success', `${friendUser.name || 'Friend'} added to your close friends!`);
      await loadFriends();
    } catch (error) {
      console.error('Error adding friend:', error);
      Alert.alert('Error', 'Failed to add friend. Please try again.');
    } finally {
      setAddingFriend(false);
    }
  };

  const handleRemoveFriend = (friendshipId, friendName) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${friendName} from your close friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('close_friends')
                .delete()
                .eq('id', friendshipId);

              if (error) throw error;

              await loadFriends();
            } catch (error) {
              console.error('Error removing friend:', error);
              Alert.alert('Error', 'Failed to remove friend');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Close Friends</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search friends..."
            placeholderTextColor={COLORS.grayLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <Loader />
      ) : (
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadFriends();
              }}
              tintColor={COLORS.primary}
            />
          }
        >
        {filteredFriends.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={COLORS.grayLight} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No friends found' : 'No close friends yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery
                ? 'Try a different search term'
                : 'Add friends to see their trips and travel together'}
            </Text>
          </View>
        ) : (
          filteredFriends.map((friend) => (
            <View key={friend.id} style={styles.friendCard}>
              <View style={styles.friendAvatar}>
                <Ionicons name="person" size={24} color={COLORS.white} />
              </View>
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.friendPhone}>{friend.phone}</Text>
                <Text style={styles.friendTrips}>{friend.trips} trips together</Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFriend(friend.id, friend.name)}
              >
                <Ionicons name="close-circle" size={24} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ))
        )}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <ModernButton
          title={addingFriend ? "Adding..." : "Add Friend"}
          onPress={handleAddFriend}
          variant="primary"
          size="large"
          icon="person-add"
          iconPosition="left"
          style={styles.addButton}
          disabled={addingFriend}
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
  searchSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.secondary,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl + SPACING.xxl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.secondary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  friendAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.secondary,
    marginBottom: SPACING.xs / 2,
  },
  friendPhone: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginBottom: SPACING.xs / 2,
  },
  friendTrips: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.grayLight,
  },
  removeButton: {
    padding: SPACING.sm,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  addButton: {
    width: '100%',
  },
});

export default CloseFriendsScreen;
