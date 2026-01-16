import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, ANIMATIONS } from '../config/theme';
import { useLanguage } from '../contexts/LanguageContext';
import { getDestinations } from '../services/database';
import AnimatedCard from '../components/AnimatedCard';
import ModernButton from '../components/ModernButton';

const MapScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const { t } = useLanguage();
  const [region, setRegion] = useState({
    latitude: 9.0320,
    longitude: 38.7469,
    latitudeDelta: 5,
    longitudeDelta: 5,
  });
  const [userLocation, setUserLocation] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  const cardTranslateY = useSharedValue(300);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    requestLocationPermission();
    loadDestinations();
  }, []);

  useEffect(() => {
    if (selectedDestination) {
      cardTranslateY.value = withSpring(0, ANIMATIONS.spring);
      cardOpacity.value = withTiming(1, { duration: ANIMATIONS.normal });
    } else {
      cardTranslateY.value = withSpring(300, ANIMATIONS.spring);
      cardOpacity.value = withTiming(0, { duration: ANIMATIONS.normal });
    }
  }, [selectedDestination]);

  const loadDestinations = async () => {
    try {
      setLoading(true);
      const data = await getDestinations();
      
      const transformedDestinations = data
        .filter(destination => destination.location && typeof destination.location === 'object')
        .map(destination => ({
          id: destination.id,
          name: destination.name,
          city: destination.city || '',
          category: destination.category || 'other',
          lat: destination.location?.lat || 0,
          lng: destination.location?.lng || 0,
          fullData: destination,
        }));
      
      setDestinations(transformedDestinations);
      setLoading(false);
    } catch (error) {
      console.error('Error loading destinations:', error);
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        });
      }
    } catch (error) {
      console.log('Error getting location:', error);
    }
  };

  const handleMarkerPress = (destination) => {
    setSelectedDestination(destination);
    setRegion({
      latitude: destination.lat,
      longitude: destination.lng,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    });
  };

  const handleViewDetails = () => {
    if (selectedDestination && selectedDestination.fullData) {
      navigation.navigate('DestinationDetail', { destination: selectedDestination.fullData });
    }
  };

  const getMarkerIcon = (category) => {
    const icons = {
      church: '⛪',
      religious: '⛪',
      historical: '🏛️',
      nature: '🌲',
      adventure: '🚴',
      cultural: '🎭',
      monument: '🗿',
      park: '🌳',
      museum: '🏛️',
    };
    return icons[category] || '📍';
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardTranslateY.value }],
    opacity: cardOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          scrollEnabled={true}
          zoomEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
        >
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
          >
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner} />
            </View>
          </Marker>
        )}

        {destinations.map((destination) => (
          <Marker
            key={destination.id}
            coordinate={{ latitude: destination.lat, longitude: destination.lng }}
            title={destination.name}
            description={destination.city}
            onPress={() => handleMarkerPress(destination)}
          >
            <Animated.View style={styles.markerContainer}>
              <View style={styles.markerBackground}>
                <Text style={styles.markerIcon}>{getMarkerIcon(destination.category)}</Text>
              </View>
            </Animated.View>
          </Marker>
        ))}
        </MapView>
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']} pointerEvents="box-none">
        <View style={styles.header}>
          <Text style={styles.title}>{t('mapView') || 'Map View'}</Text>
          <Text style={styles.subtitle}>
            {destinations.length} destinations available
          </Text>
        </View>
      </SafeAreaView>

      {/* Animated Selected Destination Card */}
      {selectedDestination && (
        <Animated.View style={[styles.selectedCard, cardAnimatedStyle]}>
          <AnimatedCard variant="glass">
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.cardIcon}>
                    <Text style={styles.cardIconText}>
                      {getMarkerIcon(selectedDestination.category)}
                    </Text>
                  </View>
                  <View style={styles.cardHeaderText}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {selectedDestination.name}
                    </Text>
                    <Text style={styles.cardSubtitle}>{selectedDestination.city}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => setSelectedDestination(null)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={COLORS.gray} />
                </TouchableOpacity>
              </View>
              {selectedDestination.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{selectedDestination.category}</Text>
                </View>
              )}
              <ModernButton
                title="View Details"
                onPress={handleViewDetails}
                variant="primary"
                size="medium"
                style={styles.viewButton}
                icon="arrow-forward"
                iconPosition="right"
              />
            </View>
          </AnimatedCard>
        </Animated.View>
      )}

      {/* Recenter Button */}
      {userLocation && (
        <TouchableOpacity
          style={styles.recenterButton}
          onPress={() =>
            setRegion({
              ...userLocation,
              latitudeDelta: 0.5,
              longitudeDelta: 0.5,
            })
          }
        >
          <Ionicons name="locate" size={24} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  header: {
    padding: SPACING.md,
    paddingTop: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  title: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '800',
    color: COLORS.secondary,
    letterSpacing: -1,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    fontWeight: '500',
  },
  mapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  userMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
    ...SHADOWS.large,
  },
  markerIcon: {
    fontSize: 24,
  },
  selectedCard: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardIconText: {
    fontSize: 28,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    fontWeight: '500',
  },
  closeButton: {
    padding: SPACING.xs,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  categoryText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  viewButton: {
    width: '100%',
  },
  recenterButton: {
    position: 'absolute',
    top: 100,
    right: SPACING.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.large,
  },
});

export default MapScreen;
