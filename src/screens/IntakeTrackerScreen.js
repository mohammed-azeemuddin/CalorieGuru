import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DiaryEntryItem from '../components/DiaryEntryItem';
import { formatDate } from '../utils/dateUtils';
import { useTheme } from '../context/ThemeContext';

const IntakeTrackerScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState([]);
  const [nutritionSummary, setNutritionSummary] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  
  // Load food entries for the selected date
  useEffect(() => {
    navigation.setOptions({
      title: 'Intake Tracker',
    });
    
    const loadFoodEntries = async () => {
      try {
        const dateString = selectedDate.toISOString().split('T')[0];
        const foodEntriesKey = `foodEntries_${dateString}`;
        
        const entriesString = await AsyncStorage.getItem(foodEntriesKey);
        
        if (entriesString) {
          const foodEntries = JSON.parse(entriesString);
          setEntries(foodEntries);
          
          // Calculate nutrition summary
          const summary = foodEntries.reduce((acc, entry) => {
            return {
              calories: acc.calories + entry.calories,
              protein: acc.protein + entry.protein,
              carbs: acc.carbs + entry.carbs,
              fat: acc.fat + entry.fat
            };
          }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
          
          setNutritionSummary(summary);
        } else {
          setEntries([]);
          setNutritionSummary({ calories: 0, protein: 0, carbs: 0, fat: 0 });
        }
      } catch (error) {
        console.error('Error loading food entries:', error);
      }
    };
    
    loadFoodEntries();
    
    // Set up a listener for when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadFoodEntries();
    });

    return unsubscribe;
  }, [selectedDate, navigation]);
  
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };
  
  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };
  
  const goToToday = () => {
    setSelectedDate(new Date());
  };
  
  const deleteEntry = async (entryId) => {
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      const foodEntriesKey = `foodEntries_${dateString}`;
      
      // Filter out the entry to delete
      const updatedEntries = entries.filter(entry => entry.id !== entryId);
      
      // Save updated entries
      await AsyncStorage.setItem(foodEntriesKey, JSON.stringify(updatedEntries));
      
      // Update state
      setEntries(updatedEntries);
      
      // Recalculate nutrition summary
      const summary = updatedEntries.reduce((acc, entry) => {
        return {
          calories: acc.calories + entry.calories,
          protein: acc.protein + entry.protein,
          carbs: acc.carbs + entry.carbs,
          fat: acc.fat + entry.fat
        };
      }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
      
      setNutritionSummary(summary);
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.dateSelector, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={goToPreviousDay}>
          <Ionicons name="chevron-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={goToToday} style={styles.dateContainer}>
          <Text style={[styles.dateText, { color: theme.text }]}>{formatDate(selectedDate)}</Text>
          {!isSameDay(selectedDate, new Date()) && (
            <Text style={[styles.todayText, { color: theme.primary }]}>Today</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={goToNextDay}>
          <Ionicons name="chevron-forward" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.helpTextContainer}>
        <Text style={[styles.helpText, { color: theme.textSecondary }]}>
          Track your daily food intake here. Navigate between dates using the arrows above.
          View your nutrition summary for each day and add foods from the Food Vault or create custom foods.
          Tap on any food entry to view details or click on the Bin icon to delete.
        </Text>
      </View>
      
      <View style={[styles.summaryContainer, { backgroundColor: theme.card }]}>
        <View style={styles.calorieContainer}>
          <Text style={[styles.calorieValue, { color: theme.primary }]}>{nutritionSummary.calories}</Text>
          <Text style={[styles.calorieLabel, { color: theme.textSecondary }]}>calories</Text>
        </View>
        
        <View style={styles.macrosContainer}>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: theme.text }]}>{nutritionSummary.protein}g</Text>
            <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>Protein</Text>
          </View>
          
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: theme.text }]}>{nutritionSummary.carbs}g</Text>
            <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>Carbs</Text>
          </View>
          
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: theme.text }]}>{nutritionSummary.fat}g</Text>
            <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>Fat</Text>
          </View>
        </View>
      </View>
      
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DiaryEntryItem 
            entry={item} 
            onPress={() => navigation.navigate('FoodDetail', { food: item })}
            onDelete={() => deleteEntry(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No food entries for this day</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.addFoodButton, { backgroundColor: theme.primary, marginRight: 10 }]}
                onPress={() => navigation.navigate('Food Vault')}
              >
                <Text style={styles.addFoodButtonText}>Add Food from Food Vault</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.addFoodButton, { backgroundColor: theme.secondary }]}
                onPress={() => navigation.navigate('AddFood')}
              >
                <Text style={styles.addFoodButtonText}>Add Custom Food</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />
      
      {entries.length > 0 && (
        <View style={styles.floatingButtonContainer}>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: theme.primary, bottom: 70 }]}
            onPress={() => navigation.navigate('Food Vault')}
          >
            <Text style={styles.floatingButtonText}>Food Vault</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: theme.secondary }]}
            onPress={() => navigation.navigate('AddFood')}
          >
            <Text style={styles.floatingButtonText}>Custom Food</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

// Helper function to check if two dates are the same day
const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  dateContainer: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  todayText: {
    fontSize: 12,
    marginTop: 4,
  },
  helpTextContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  helpText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  summaryContainer: {
    padding: 15,
    margin: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  calorieContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  calorieValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  calorieLabel: {
    fontSize: 14,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  macroLabel: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFoodButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  addFoodButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  addButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    minWidth: 120,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  floatingButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default IntakeTrackerScreen;