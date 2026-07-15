import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { COLORS, SPACING, SHADOWS } from '../config/theme';

const OnboardingSlideItem = ({ item, index, width, scrollX }) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const contentAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolate.CLAMP);
    return { opacity };
  });

  return (
    <View style={[styles.slide, { width }]}>
      <View style={styles.imageWrapper}>
        <Image source={item.image} style={styles.image} resizeMode="cover" />
      </View>

      <Animated.View style={[styles.contentContainer, contentAnimatedStyle]}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.highlightWrapper}>
          <Text style={styles.titleHighlight}>{item.titleHighlight}</Text>
          <View style={styles.curvedUnderline} />
        </View>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    </View>
  );
};

const AnimatedDot = ({ index, scrollX, width }) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
  const dotAnimatedStyle = useAnimatedStyle(() => {
    const dotWidth = interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolate.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolate.CLAMP);

    return { width: dotWidth, opacity };
  });

  return <Animated.View style={[styles.dot, dotAnimatedStyle]} />;
};

const OnboardingScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useSharedValue(0);

  const slides = [
    {
      id: '1',
      title: 'Discover fascinating',
      titleHighlight: 'destinations',
      description: "Explore Ethiopia's biggest and most loved tourist attractions through our easy-to-use search and discover features.",
      image: require('../../assets/beautiful-shot-building-near-forested-mountains.jpg'),
    },
    {
      id: '2',
      title: 'Book memorable',
      titleHighlight: 'journeys',
      description: 'Choose your destination, date, seats, and pickup station with a simple booking flow.',
      image: require('../../assets/beautiful-woman-with-backpack-smiling-holding-binoculars.jpg'),
    },
    {
      id: '3',
      title: 'Travel with',
      titleHighlight: 'confidence',
      description: 'Connect with trusted providers for comfortable trips across Ethiopia.',
      image: require('../../assets/pexels-mussie-belachew-2153963984-33101756.jpg'),
    },
  ];

  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('has_seen_onboarding', 'true');
    } catch (error) {
      console.log('Error saving onboarding flag:', error);
    }
    navigation.replace('SignIn');
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      return;
    }

    finishOnboarding();
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={finishOnboarding}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item, index }) => (
          <OnboardingSlideItem
            item={item}
            index={index}
            width={width}
            scrollX={scrollX}
          />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          scrollX.value = e.nativeEvent.contentOffset.x;
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        scrollEventThrottle={16}
      />

      <View style={styles.bottomSection}>
        <View style={styles.dotsContainer}>
          {slides.map((_, i) => (
            <AnimatedDot key={i} index={i} scrollX={scrollX} width={width} />
          ))}
        </View>

        <TouchableOpacity style={styles.getStartedButton} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  slide: {
    flex: 1,
    padding: SPACING.md,
  },
  imageWrapper: {
    height: '55%',
    width: '100%',
    borderRadius: 40,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  skipText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  contentContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'serif',
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  highlightWrapper: {
    alignItems: 'center',
  },
  titleHighlight: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.primary || '#FFB800',
    textAlign: 'center',
  },
  curvedUnderline: {
    height: 4,
    width: 140,
    backgroundColor: COLORS.primary || '#FFB800',
    borderRadius: 2,
    marginTop: -2,
  },
  description: {
    fontSize: 16,
    color: '#7D7D7D',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 24,
  },
  bottomSection: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary || '#FFB800',
    marginHorizontal: 4,
  },
  getStartedButton: {
    backgroundColor: COLORS.primary || '#FFB800',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default OnboardingScreen;
