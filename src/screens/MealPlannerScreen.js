import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { indianFoods } from '../data/indianFoods';
import { formatDate } from '../utils/dateUtils';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const MealPlannerScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealPlan, setMealPlan] = useState({});
  const [userProfile, setUserProfile] = useState({
    calorieGoal: 2000,
    proteinGoal: 100,
    carbsGoal: 250,
    fatGoal: 65
  });
  
  // Load meal plan data when component mounts or selected date changes
  useEffect(() => {
    navigation.setOptions({
      title: 'Meal Planner',
    });
    loadMealPlan();
    loadUserProfile();
  }, [selectedDate, navigation]);
  
  const loadUserProfile = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserProfile({
          calorieGoal: parseInt(userData.calorieGoal) || 2000,
          proteinGoal: Math.round((parseInt(userData.calorieGoal) || 2000) * 0.2 / 4), // 20% of calories from protein
          carbsGoal: Math.round((parseInt(userData.calorieGoal) || 2000) * 0.5 / 4), // 50% of calories from carbs
          fatGoal: Math.round((parseInt(userData.calorieGoal) || 2000) * 0.3 / 9), // 30% of calories from fat
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };
  
  const loadMealPlan = async () => {
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      const mealPlanKey = `mealPlan_${dateString}`;
      
      const mealPlanString = await AsyncStorage.getItem(mealPlanKey);
      
      if (mealPlanString) {
        const loadedMealPlan = JSON.parse(mealPlanString);
        setMealPlan(loadedMealPlan);
      } else {
        // Initialize empty meal plan for the date
        const emptyMealPlan = {};
        MEAL_TYPES.forEach(mealType => {
          emptyMealPlan[mealType] = [];
        });
        

        
        setMealPlan(emptyMealPlan);
      }
    } catch (error) {
      console.error('Error loading meal plan:', error);
    }
  };
  
  const saveMealPlan = async (updatedMealPlan = mealPlan) => {
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      const mealPlanKey = `mealPlan_${dateString}`;
      
      await AsyncStorage.setItem(mealPlanKey, JSON.stringify(updatedMealPlan));
    } catch (error) {
      console.error('Error saving meal plan:', error);
      Alert.alert('Error', 'Failed to save meal plan');
    }
  };
  
  const addFoodToMeal = (mealType) => {
    navigation.navigate('Food Vault', { 
      onFoodSelect: (food) => {
        const updatedMealPlan = { ...mealPlan };
        if (!updatedMealPlan[mealType]) {
          updatedMealPlan[mealType] = [];
        }
        updatedMealPlan[mealType].push({
          ...food,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          quantity: 1
        });
        setMealPlan(updatedMealPlan);
        saveMealPlan(updatedMealPlan);
      }
    });
  };
  
  const removeFoodFromMeal = (mealType, foodId) => {
    const updatedMealPlan = { ...mealPlan };
    updatedMealPlan[mealType] = updatedMealPlan[mealType].filter(food => food.id !== foodId);
    setMealPlan(updatedMealPlan);
    saveMealPlan(updatedMealPlan);
  };

  const copyMealToIntake = async (mealType) => {
    try {
      const currentDate = new Date();
      const dateString = currentDate.toISOString().split('T')[0];
      const foodEntriesKey = `foodEntries_${dateString}`;
      
      // Get existing entries for today
      const existingEntriesString = await AsyncStorage.getItem(foodEntriesKey);
      const existingEntries = existingEntriesString ? JSON.parse(existingEntriesString) : [];
      
      // Convert meal plan foods to diary entries format
      const mealFoods = mealPlan[mealType] || [];
      
      if (mealFoods.length === 0) {
        Alert.alert('No Foods to Copy', `There are no foods in ${mealType} to copy to the intake tracker.`);
        return;
      }
      
      const newEntries = mealFoods.map(food => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: food.name,
        calories: food.calories * food.quantity,
        protein: food.protein * food.quantity,
        carbs: food.carbs * food.quantity,
        fat: food.fat * food.quantity,
        servingSize: food.servingSize,
        quantity: food.quantity,
        timestamp: new Date().toISOString(),
        mealType: mealType
      }));
      
      // Combine with existing entries
      const updatedEntries = [...existingEntries, ...newEntries];
      
      // Save to intake tracker
      await AsyncStorage.setItem(foodEntriesKey, JSON.stringify(updatedEntries));
      
      const totalCalories = newEntries.reduce((total, entry) => total + entry.calories, 0);
      const message = `${mealType} has been copied to today's intake tracker.\n\n📊 ${newEntries.length} food item${newEntries.length > 1 ? 's' : ''} added\n🔥 ${totalCalories} calories added`;
      
      // Check if running in web browser (not React Native WebView)
      const isWebBrowser = typeof window !== 'undefined' && window.confirm && !window.ReactNativeWebView;
      
      if (isWebBrowser) {
        const result = window.confirm(`✅ Meal Copied Successfully!\n\n${message}\n\nWould you like to view the Intake Tracker?`);
        if (result) {
          navigation.navigate('Intake Tracker');
        }
      } else {
        Alert.alert(
          '✅ Meal Copied Successfully!', 
          message,
          [
            { text: 'Got it!', style: 'default' },
            { 
              text: 'View Intake Tracker', 
              style: 'default',
              onPress: () => navigation.navigate('Intake Tracker')
            }
          ],
          { cancelable: true }
        );
      }
    } catch (error) {
      console.error('Error copying meal to intake:', error);
      Alert.alert('Error', 'Failed to copy meal to intake tracker');
    }
  };

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

  // Helper function to check if two dates are the same day
  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };
  
  const generateMealPlan = () => {
    // Simple algorithm to generate a meal plan based on user's calorie and macro goals
    const generatedMealPlan = {};
    
    // Allocate calories to each meal type
    const breakfastCalories = Math.round(userProfile.calorieGoal * 0.25); // 25% for breakfast
    const lunchCalories = Math.round(userProfile.calorieGoal * 0.35); // 35% for lunch
    const dinnerCalories = Math.round(userProfile.calorieGoal * 0.3); // 30% for dinner
    const snacksCalories = Math.round(userProfile.calorieGoal * 0.1); // 10% for snacks
    
    // Filter foods by category and sort by calories
    const breakfastFoods = indianFoods.filter(food => food.category === 'Breakfast').sort(() => Math.random() - 0.5);
    const lunchFoods = indianFoods.filter(food => food.category === 'Lunch').sort(() => Math.random() - 0.5);
    const dinnerFoods = indianFoods.filter(food => food.category === 'Dinner').sort(() => Math.random() - 0.5);
    const snacksFoods = indianFoods.filter(food => food.category === 'Snacks').sort(() => Math.random() - 0.5);
    
    // Helper function to select foods that fit within calorie budget
    const selectFoods = (foodList, calorieTarget) => {
      const selectedFoods = [];
      let currentCalories = 0;
      
      for (const food of foodList) {
        if (currentCalories + food.calories <= calorieTarget) {
          selectedFoods.push({
            ...food,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            quantity: 1
          });
          currentCalories += food.calories;
          
          // Break if we've added 3 foods or reached 90% of the calorie target
          if (selectedFoods.length >= 3 || currentCalories >= calorieTarget * 0.9) {
            break;
          }
        }
      }
      
      return selectedFoods;
    };
    
    // Generate meal plan for each meal type
    generatedMealPlan['Breakfast'] = selectFoods(breakfastFoods, breakfastCalories);
    generatedMealPlan['Lunch'] = selectFoods(lunchFoods, lunchCalories);
    generatedMealPlan['Dinner'] = selectFoods(dinnerFoods, dinnerCalories);
    generatedMealPlan['Snacks'] = selectFoods(snacksFoods, snacksCalories);
    
    setMealPlan(generatedMealPlan);
    saveMealPlan();
  };
  
  const calculateMealNutrition = (mealFoods) => {
    return mealFoods.reduce((acc, food) => {
      return {
        calories: acc.calories + (food.calories * food.quantity),
        protein: acc.protein + (food.protein * food.quantity),
        carbs: acc.carbs + (food.carbs * food.quantity),
        fat: acc.fat + (food.fat * food.quantity)
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };
  
  const calculateDayTotalNutrition = () => {
    let dayTotal = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    MEAL_TYPES.forEach(mealType => {
      if (mealPlan[mealType] && mealPlan[mealType].length > 0) {
        const mealNutrition = calculateMealNutrition(mealPlan[mealType]);
        dayTotal.calories += mealNutrition.calories;
        dayTotal.protein += mealNutrition.protein;
        dayTotal.carbs += mealNutrition.carbs;
        dayTotal.fat += mealNutrition.fat;
      }
    });
    
    return dayTotal;
  };
  
  const renderMealSection = (mealType) => {
    const mealFoods = mealPlan[mealType] || [];
    const mealNutrition = calculateMealNutrition(mealFoods);
    
    return (
      <View style={[styles.mealSection, { backgroundColor: theme.card }]}>
        <View style={styles.mealHeader}>
          <Text style={[styles.mealTitle, { color: theme.text }]}>{mealType}</Text>
          <View style={styles.mealHeaderRight}>
            <Text style={[styles.mealCalories, { color: theme.primary }]}>{mealNutrition.calories} cal</Text>
            {mealFoods.length > 0 && (
              <TouchableOpacity
                style={[styles.copyButton, { backgroundColor: theme.success }]}
                onPress={() => copyMealToIntake(mealType)}
              >
                <Ionicons name="copy" size={14} color="white" />
                <Text style={styles.copyButtonText}>Copy to Intake</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {mealFoods.length > 0 ? (
          <FlatList
            data={mealFoods}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.foodItem}>
                <View style={styles.foodInfo}>
                  <Text style={[styles.foodName, { color: theme.text }]}>{item.name}</Text>
                  <Text style={[styles.foodServing, { color: theme.textSecondary }]}>
                    {item.servingSize} • {item.calories} cal
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeFoodFromMeal(mealType, item.id)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={24} color={theme.danger} />
                </TouchableOpacity>
              </View>
            )}
            scrollEnabled={false}
          />
        ) : (
          <Text style={[styles.emptyMealText, { color: theme.textSecondary }]}>No foods added</Text>
        )}
        
        <TouchableOpacity
          style={[styles.addFoodButton, { backgroundColor: theme.primary }]}
          onPress={() => addFoodToMeal(mealType)}
        >
          <Ionicons name="add" size={16} color="white" />
          <Text style={styles.addFoodButtonText}>Add Food</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  const dayTotal = calculateDayTotalNutrition();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.dateSelector, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.dateSelectorCenter}>
          <TouchableOpacity onPress={goToPreviousDay} style={styles.dateNavButton}>
            <Ionicons name="chevron-back" size={24} color={theme.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={goToToday} style={styles.dateContainer}>
            <Text style={[styles.dateText, { color: theme.text }]}>{formatDate(selectedDate)}</Text>
            {!isSameDay(selectedDate, new Date()) && (
              <Text style={[styles.todayText, { color: theme.primary }]}>Today</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={goToNextDay} style={styles.dateNavButton}>
            <Ionicons name="chevron-forward" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.spacer} />
      </View>
      
      <View style={[styles.nutritionSummary, { backgroundColor: theme.card }]}>
        <View style={styles.nutritionHeader}>
          <Text style={[styles.nutritionTitle, { color: theme.text }]}>Day Summary</Text>
          <TouchableOpacity
            style={[styles.generateButton, { backgroundColor: theme.secondary }]}
            onPress={generateMealPlan}
          >
            <Text style={styles.generateButtonText}>Generate Plan</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.nutritionDetails}>
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionValue, { color: theme.primary }]}>{dayTotal.calories}</Text>
            <Text style={[styles.nutritionLabel, { color: theme.textSecondary }]}>cal</Text>
            <Text style={[styles.nutritionGoal, { color: theme.textSecondary }]}>
              of {userProfile.calorieGoal}
            </Text>
          </View>
          
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionValue, { color: theme.success }]}>{dayTotal.protein}g</Text>
            <Text style={[styles.nutritionLabel, { color: theme.textSecondary }]}>protein</Text>
            <Text style={[styles.nutritionGoal, { color: theme.textSecondary }]}>
              of {userProfile.proteinGoal}g
            </Text>
          </View>
          
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionValue, { color: theme.info }]}>{dayTotal.carbs}g</Text>
            <Text style={[styles.nutritionLabel, { color: theme.textSecondary }]}>carbs</Text>
            <Text style={[styles.nutritionGoal, { color: theme.textSecondary }]}>
              of {userProfile.carbsGoal}g
            </Text>
          </View>
          
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionValue, { color: theme.warning }]}>{dayTotal.fat}g</Text>
            <Text style={[styles.nutritionLabel, { color: theme.textSecondary }]}>fat</Text>
            <Text style={[styles.nutritionGoal, { color: theme.textSecondary }]}>
              of {userProfile.fatGoal}g
            </Text>
          </View>
        </View>
      </View>
      
      <ScrollView style={styles.mealsContainer}>
        {MEAL_TYPES.map(mealType => (
          <View key={mealType}>
            {renderMealSection(mealType)}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
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
  dateSelectorCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 5,
  },
  dateNavButton: {
    padding: 5,
  },
  spacer: {
    width: 24, // Same width as the back button icon
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
  nutritionSummary: {
    margin: 10,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nutritionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  nutritionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  generateButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  nutritionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  nutritionLabel: {
    fontSize: 12,
  },
  nutritionGoal: {
    fontSize: 10,
  },
  mealsContainer: {
    flex: 1,
    padding: 10,
  },
  mealSection: {
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mealHeaderRight: {
    alignItems: 'flex-end',
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '500',
  },
  foodServing: {
    fontSize: 12,
  },
  removeButton: {
    padding: 5,
  },
  emptyMealText: {
    textAlign: 'center',
    padding: 10,
    fontStyle: 'italic',
  },
  addFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 5,
  },
  addFoodButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: '500',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  copyButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default MealPlannerScreen;