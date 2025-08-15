import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const DailyProgressCard = ({ calorieGoal, consumedCalories }) => {
  const { theme } = useTheme();
  // Calculate remaining calories
  const remainingCalories = calorieGoal - consumedCalories;
  
  // Calculate progress percentage (capped at 100%)
  const progressPercentage = Math.min(Math.round((consumedCalories / calorieGoal) * 100), 100);
  
  // Determine progress bar color based on percentage
  let progressColor;
  
  if (progressPercentage > 100) {
    progressColor = theme.danger; // Red if exceeded
  } else if (progressPercentage > 90) {
    progressColor = theme.success; // Green if above 90%
  } else if (progressPercentage >= 55) {
    progressColor = theme.warning; // Yellow if between 55% and 90%
  } else {
    progressColor = theme.primary; // Blue if below 50%
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.text }]}>Daily Calorie Goal</Text>
      
      <View style={styles.progressContainer}>
        <View style={styles.circularProgressContainer}>
          <AnimatedCircularProgress
            size={140}
            width={10}
            fill={progressPercentage}
            duration={1000}
            tintColor={progressColor}
            backgroundColor={theme.border}
            backgroundWidth={10}
            lineCap="round"
          >
            {(fill) => (
              <View style={styles.progressTextContainer}>
                <Text style={[styles.progressValue, { color: theme.text }]}>
                  {Math.round(fill)}%
                </Text>
                <Text style={[styles.progressTitle, { color: theme.textSecondary }]}>
                  calories
                </Text>
              </View>
            )}
          </AnimatedCircularProgress>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Consumed</Text>
            <Text style={[styles.statValue, { color: theme.primary }]}>{Math.round(consumedCalories)}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Goal</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{Math.round(calorieGoal)}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Remaining</Text>
            <Text style={[styles.statValue, { color: remainingCalories < 0 ? theme.danger : theme.success }]}>
              {remainingCalories < 0 
                ? `+${Math.abs(Math.round(remainingCalories))} cals consumed` 
                : Math.round(remainingCalories)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 15,
    margin: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  progressContainer: {
    marginBottom: 15,
  },
  circularProgressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  progressTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DailyProgressCard;