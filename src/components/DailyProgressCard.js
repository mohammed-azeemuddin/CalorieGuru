import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const DailyProgressCard = ({ calorieGoal, consumedCalories }) => {
  const { theme } = useTheme();
  // Calculate remaining calories
  const remainingCalories = calorieGoal - consumedCalories;
  
  // Calculate progress percentage (capped at 100%)
  const progressPercentage = Math.min(Math.round((consumedCalories / calorieGoal) * 100), 100);
  
  // Determine progress bar color based on percentage
  let progressColor = theme.success; // Green by default
  
  if (progressPercentage > 100) {
    progressColor = theme.danger; // Red if exceeded
  } else if (progressPercentage > 85) {
    progressColor = theme.warning; // Yellow if close to goal
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.text }]}>Daily Calorie Goal</Text>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressTextContainer}>
          <Text style={[styles.consumedText, { color: theme.primary }]}>{consumedCalories}</Text>
          <Text style={[styles.goalText, { color: theme.textSecondary }]}>/ {calorieGoal}</Text>
        </View>
        
        <View style={[styles.progressBarBackground, { backgroundColor: theme.border }]}>
          <View 
            style={[styles.progressBar, { width: `${progressPercentage}%`, backgroundColor: progressColor }]}
          />
        </View>
        
        <Text style={[styles.percentageText, { color: theme.textSecondary }]}>{progressPercentage}%</Text>
      </View>
      
      <View style={[styles.remainingContainer, { borderTopColor: theme.border }]}>
        <Text style={[styles.remainingLabel, { color: theme.textSecondary }]}>Remaining</Text>
        <Text style={[styles.remainingValue, { color: remainingCalories < 0 ? theme.danger : theme.success }]}>
          {remainingCalories}
        </Text>
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
  progressTextContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  consumedText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  goalText: {
    fontSize: 16,
    marginLeft: 5,
  },
  progressBarBackground: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  percentageText: {
    alignSelf: 'flex-end',
    marginTop: 5,
    fontSize: 12,
  },
  remainingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  remainingLabel: {
    fontSize: 16,
  },
  remainingValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default DailyProgressCard;