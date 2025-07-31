import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { indianFoods } from '../data/indianFoods';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const MealPlannerScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [mealPlan, setMealPlan] = useState({});
  const [userProfile, setUserProfile] = useState({
    calorieGoal: 2000,
    proteinGoal: 100,
    carbsGoal: 250,
    fatGoal: 65
  });
  
  // Load meal plan data when component mounts or selected day changes
  useEffect(() => {
    loadMealPlan();
    loadUserProfile();
  }, [selectedDay]);
  
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
      const dayKey = DAYS_OF_WEEK[selectedDay].toLowerCase();
      const mealPlanKey = `mealPlan_${dayKey}`;
      
      const mealPlanString = await AsyncStorage.getItem(mealPlanKey);
      
      if (mealPlanString) {
        const loadedMealPlan = JSON.parse(mealPlanString);
        setMealPlan(loadedMealPlan);
      } else {
        // Initialize empty meal plan for the day
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
  
  const saveMealPlan = async () => {
    try {
      const dayKey = DAYS_OF_WEEK[selectedDay].toLowerCase();
      const mealPlanKey = `mealPlan_${dayKey}`;
      
      await AsyncStorage.setItem(mealPlanKey, JSON.stringify(mealPlan));
      Alert.alert('Success', 'Meal plan saved successfully');
    } catch (error) {
      console.error('Error saving meal plan:', error);
      Alert.alert('Error', 'Failed to save meal plan');
    }
  };
  
  const addFoodToMeal = (mealType) => {
    navigation.navigate('Food Database', { 
      onFoodSelect: (food) => {
        const updatedMealPlan = { ...mealPlan };
        if (!updatedMealPlan[mealType]) {
          updatedMealPlan[mealType] = [];
        }
        updatedMealPlan[mealType].push({
          ...food,
          id: Date.now().toString(),
          quantity: 1
        });
        setMealPlan(updatedMealPlan);
        saveMealPlan();
      }
    });
  };
  
  const removeFoodFromMeal = (mealType, foodId) => {
    const updatedMealPlan = { ...mealPlan };
    updatedMealPlan[mealType] = updatedMealPlan[mealType].filter(food => food.id !== foodId);
    setMealPlan(updatedMealPlan);
    saveMealPlan();
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
          <Text style={[styles.mealCalories, { color: theme.primary }]}>{mealNutrition.calories} cal</Text>
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
      <View style={styles.daySelector}>
        {DAYS_OF_WEEK.map((day, index) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDay === index && { backgroundColor: theme.primary }
            ]}
            onPress={() => setSelectedDay(index)}
          >
            <Text
              style={[
                styles.dayButtonText,
                { color: selectedDay === index ? 'white' : theme.text }
              ]}
            >
              {day.substring(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
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
        {MEAL_TYPES.map(mealType => renderMealSection(mealType))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  dayButtonText: {
    fontWeight: '500',
    fontSize: 14,
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
});

export default MealPlannerScreen;