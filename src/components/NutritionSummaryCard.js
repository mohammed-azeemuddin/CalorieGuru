import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const NutritionSummaryCard = () => {
  const { theme } = useTheme();
  const [nutritionData, setNutritionData] = useState({
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  
  // Load nutrition data for today
  useEffect(() => {
    const loadNutritionData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const foodEntriesKey = `foodEntries_${today}`;
        
        const entriesString = await AsyncStorage.getItem(foodEntriesKey);
        
        if (entriesString) {
          const foodEntries = JSON.parse(entriesString);
          
          // Calculate total nutrition values
          const totals = foodEntries.reduce((acc, entry) => {
            return {
              protein: acc.protein + (entry.protein || 0),
              carbs: acc.carbs + (entry.carbs || 0),
              fat: acc.fat + (entry.fat || 0),
            };
          }, { protein: 0, carbs: 0, fat: 0 });
          
          setNutritionData(totals);
        }
      } catch (error) {
        console.error('Error loading nutrition data:', error);
      }
    };
    
    loadNutritionData();
    
    // Set up interval to refresh data every minute
    const intervalId = setInterval(loadNutritionData, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Calculate total grams and percentages
  const totalGrams = nutritionData.protein + nutritionData.carbs + nutritionData.fat;
  
  const calculatePercentage = (value) => {
    if (totalGrams === 0) return 0;
    return Math.round((value / totalGrams) * 100);
  };
  
  const proteinPercentage = calculatePercentage(nutritionData.protein);
  const carbsPercentage = calculatePercentage(nutritionData.carbs);
  const fatPercentage = calculatePercentage(nutritionData.fat);

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.text }]}>Macronutrients</Text>
      
      <View style={[styles.progressBarContainer, { backgroundColor: theme.border }]}>
        <View style={[styles.progressSegment, { flex: proteinPercentage, backgroundColor: theme.success }]} />
        <View style={[styles.progressSegment, { flex: carbsPercentage, backgroundColor: theme.info }]} />
        <View style={[styles.progressSegment, { flex: fatPercentage, backgroundColor: theme.warning }]} />
      </View>
      
      <View style={styles.macrosContainer}>
        <View style={styles.macroItem}>
          <View style={[styles.macroIndicator, { backgroundColor: theme.success }]} />
          <View>
            <Text style={[styles.macroValue, { color: theme.text }]}>{nutritionData.protein}g</Text>
            <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>Protein</Text>
          </View>
          <Text style={[styles.macroPercentage, { color: theme.text }]}>{proteinPercentage}%</Text>
        </View>
        
        <View style={styles.macroItem}>
          <View style={[styles.macroIndicator, { backgroundColor: theme.info }]} />
          <View>
            <Text style={[styles.macroValue, { color: theme.text }]}>{nutritionData.carbs}g</Text>
            <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>Carbs</Text>
          </View>
          <Text style={[styles.macroPercentage, { color: theme.text }]}>{carbsPercentage}%</Text>
        </View>
        
        <View style={styles.macroItem}>
          <View style={[styles.macroIndicator, { backgroundColor: theme.warning }]} />
          <View>
            <Text style={[styles.macroValue, { color: theme.text }]}>{nutritionData.fat}g</Text>
            <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>Fat</Text>
          </View>
          <Text style={[styles.macroPercentage, { color: theme.text }]}>{fatPercentage}%</Text>
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
    marginTop: 0,
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
  progressBarContainer: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressSegment: {
    height: '100%',
  },
  macrosContainer: {
    marginTop: 5,
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  macroIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  macroLabel: {
    fontSize: 12,
  },
  macroPercentage: {
    marginLeft: 'auto',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NutritionSummaryCard;