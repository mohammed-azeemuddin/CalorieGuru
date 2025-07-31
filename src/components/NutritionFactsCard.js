import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const NutritionFactsCard = ({ calories, protein, carbs, fat, fiber, sugar, servingSize }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.text }]}>Nutrition Facts</Text>
      
      <View style={styles.servingContainer}>
        <Text style={[styles.servingText, { color: theme.textSecondary }]}>Serving Size: {servingSize}</Text>
      </View>
      
      <View style={[styles.divider, { backgroundColor: theme.text }]} />
      
      <View style={styles.calorieContainer}>
        <Text style={[styles.calorieLabel, { color: theme.text }]}>Calories</Text>
        <Text style={[styles.calorieValue, { color: theme.text }]}>{calories}</Text>
      </View>
      
      <View style={[styles.divider, { backgroundColor: theme.text }]} />
      
      <View style={styles.nutrientContainer}>
        <View style={styles.nutrientRow}>
          <Text style={[styles.nutrientLabel, { color: theme.text }]}>Total Fat</Text>
          <Text style={[styles.nutrientValue, { color: theme.text }]}>{fat}g</Text>
        </View>
        
        <View style={[styles.dividerThin, { backgroundColor: theme.border }]} />
        
        <View style={styles.nutrientRow}>
          <Text style={[styles.nutrientLabel, { color: theme.text }]}>Total Carbohydrates</Text>
          <Text style={[styles.nutrientValue, { color: theme.text }]}>{carbs}g</Text>
        </View>
        
        <View style={styles.nutrientIndentedRow}>
          <Text style={[styles.nutrientIndentedLabel, { color: theme.textSecondary }]}>Dietary Fiber</Text>
          <Text style={[styles.nutrientValue, { color: theme.text }]}>{fiber || 0}g</Text>
        </View>
        
        <View style={styles.nutrientIndentedRow}>
          <Text style={[styles.nutrientIndentedLabel, { color: theme.textSecondary }]}>Sugars</Text>
          <Text style={[styles.nutrientValue, { color: theme.text }]}>{sugar || 0}g</Text>
        </View>
        
        <View style={[styles.dividerThin, { backgroundColor: theme.border }]} />
        
        <View style={styles.nutrientRow}>
          <Text style={[styles.nutrientLabel, { color: theme.text }]}>Protein</Text>
          <Text style={[styles.nutrientValue, { color: theme.text }]}>{protein}g</Text>
        </View>
      </View>
      
      <View style={[styles.divider, { backgroundColor: theme.text }]} />
      
      <Text style={[styles.disclaimer, { color: theme.textSecondary }]}>
        * Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 15,
    margin: 15,
    marginTop: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  servingContainer: {
    marginBottom: 10,
  },
  servingText: {
    fontSize: 14,
  },
  divider: {
    height: 5,
    marginVertical: 10,
  },
  dividerThin: {
    height: 1,
    marginVertical: 8,
  },
  calorieContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calorieLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  calorieValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nutrientContainer: {
    marginBottom: 10,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  nutrientIndentedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingLeft: 20,
  },
  nutrientLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  nutrientIndentedLabel: {
    fontSize: 14,
  },
  nutrientValue: {
    fontSize: 14,
  },
  disclaimer: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 5,
  },
});

export default NutritionFactsCard;