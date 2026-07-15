import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import Loader from '../components/Loader';

const SavedDestinationsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSavedDestinations();
  }, [user]);

  const loadSavedDestinations = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get user's saved destination IDs
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('saved_destinations')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      const savedIds = userData?.saved_destinations || [];
      
      if (savedIds.length === 0) {
        setSavedDestinations([]);
        setLoading(false);
        return;
      }

      // Fetch destination details
      const { data: destinations, error: destError } = await supabase
        .from('destinations')
        .select('*')
        .in('id', savedIds);

      if (destError) throw destError;

      // Sort by the order they were saved (maintain order from saved_destinations array)
      const sorted = savedIds
        .map(id => destinations?.find(d => d.id === id))
        .filter(Boolean);

      setSavedDestinations(sorted);
    } catch (error) {
      console.error('Error loading saved destinations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRemove = async (destinationId) => {
    if (!user?.id) return;

    try {
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('saved_destinations')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const currentSaved = userData?.saved_destinations || [];
      const newSaved = currentSaved.filter(id => id !== destinationId);

      const { error: updateError } = await supabase
        .from('users')
        .update({ saved_destinations: newSaved })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Reload saved destinations
      await loadSavedDestinations();
    } catch (error) {
      console.error('Error removing destination:', error);
    }
  };

  const renderDestination = ({ item }) => {
    const imageUri = item.images && item.images.length > 0 ? item.images[0] : null;

    return (
      <TouchableOpacity
        style={styles.destinationCard}
        onPress={() => navigation.navigate('DestinationDetail', { destination: item })}
        activeOpacity={0.7}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.destinationImage} />
        ) : (
          <View style={[styles.destinationImage, styles.imagePlaceholder]}>
            <Ionicons name="image-outline" size={32} color={COLORS.grayLight} />
          </View>
        )}
        <View style={styles.destinationContent}>
          <View style={styles.destinationHeader}>
            <Text style={styles.destinationName} numberOfLines={1}>
              {item.name}
            </Text>
            <TouchableOpacity
              onPress={() => handleRemove(item.id)}
              style={styles.removeButton}
            >
              <Ionicons name="heart" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
          <Text style={styles.destinationLocation} numberOfLines={1}>
            {item.city || item.region || 'Ethiopia'}
          </Text>
          {item.rating > 0 && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={COLORS.warning} />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              {item.review_count > 0 && (
                <Text style={styles.reviewCount}>({item.review_count})</Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
          <Text style={styles.title}>Saved Destinations</Text>
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
        <Text style={styles.title}>Saved Destinations</Text>
        <View style={styles.placeholder} />
      </View>

      {savedDestinations.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={64} color={COLORS.grayLight} />
          <Text style={styles.emptyText}>No saved destinations</Text>
          <Text style={styles.emptySubtext}>
            Save destinations you love to access them quickly
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedDestinations}
          renderItem={renderDestination}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadSavedDestinations();
              }}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
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
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl + SPACING.xxl,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
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
  },
  destinationCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  destinationImage: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.lightGray,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationContent: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  destinationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  destinationName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.secondary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  removeButton: {
    padding: SPACING.xs,
  },
  destinationLocation: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginBottom: SPACING.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs / 2,
  },
  ratingText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.secondary,
  },
  reviewCount: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray,
  },
});

export default SavedDestinationsScreen;
