import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';

const RewardsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [rewardsHistory, setRewardsHistory] = useState([]);

  useEffect(() => {
    // Calculate points from bookings (mock for now)
    // In real app, fetch from database
    setPoints(250);
    setRewardsHistory([
      { id: '1', type: 'earned', amount: 50, description: 'Trip booking', date: '2025-01-15' },
      { id: '2', type: 'earned', amount: 100, description: 'Referral bonus', date: '2025-01-10' },
      { id: '3', type: 'redeemed', amount: -25, description: 'Discount applied', date: '2025-01-05' },
    ]);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Rewards</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Points Card */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsHeader}>
            <Ionicons name="trophy" size={32} color={COLORS.primary} />
            <Text style={styles.pointsLabel}>Your Points</Text>
          </View>
          <Text style={styles.pointsValue}>{points}</Text>
          <Text style={styles.pointsSubtext}>
            {points >= 100 ? 'You can redeem rewards!' : `${100 - points} points until next reward`}
          </Text>
        </View>

        {/* How It Works */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How Rewards Work</Text>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.infoText}>Earn 10 points for every trip booking</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.infoText}>Earn 50 points for each referral</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.infoText}>Redeem 100 points for 50 ETB discount</Text>
          </View>
        </View>

        {/* Rewards History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Rewards History</Text>
          {rewardsHistory.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistoryText}>No rewards history yet</Text>
            </View>
          ) : (
            rewardsHistory.map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <View style={styles.historyLeft}>
                  <View style={[
                    styles.historyIcon,
                    { backgroundColor: item.type === 'earned' ? `${COLORS.success}15` : `${COLORS.primary}15` }
                  ]}>
                    <Ionicons
                      name={item.type === 'earned' ? 'add-circle' : 'remove-circle'}
                      size={24}
                      color={item.type === 'earned' ? COLORS.success : COLORS.primary}
                    />
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyDescription}>{item.description}</Text>
                    <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
                  </View>
                </View>
                <Text style={[
                  styles.historyAmount,
                  { color: item.type === 'earned' ? COLORS.success : COLORS.primary }
                ]}>
                  {item.type === 'earned' ? '+' : ''}{item.amount}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl + SPACING.xxl,
  },
  pointsCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  pointsLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.gray,
  },
  pointsValue: {
    fontSize: FONTS.sizes.xxxl * 1.5,
    fontWeight: FONTS.weights.black,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  pointsSubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  infoTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.secondary,
    marginBottom: SPACING.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  infoText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    flex: 1,
  },
  historySection: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.secondary,
    marginBottom: SPACING.md,
  },
  emptyHistory: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  historyInfo: {
    flex: 1,
  },
  historyDescription: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.secondary,
    marginBottom: SPACING.xs / 2,
  },
  historyDate: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.grayLight,
  },
  historyAmount: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
  },
});

export default RewardsScreen;
