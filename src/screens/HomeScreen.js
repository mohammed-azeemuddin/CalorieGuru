import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DailyProgressCard from '../components/DailyProgressCard';
import RecentFoodsCard from '../components/RecentFoodsCard';
import NutritionSummaryCard from '../components/NutritionSummaryCard';
import WaterTrackerCard from '../components/WaterTrackerCard';
import { useTheme } from '../context/ThemeContext';

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  // Default calorie goal is set to 2000. This can be updated via user settings
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [consumedCalories, setConsumedCalories] = useState(0);
  const [recentFoods, setRecentFoods] = useState([]);
  
  // Fetch user data and today's food entries when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          if (userData.calorieGoal) {
            setCalorieGoal(userData.calorieGoal);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    const loadTodaysFoods = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const foodEntriesString = await AsyncStorage.getItem(`foodEntries_${today}`);
        
        if (foodEntriesString) {
          const foodEntries = JSON.parse(foodEntriesString);
          
          // Calculate total calories consumed today
          const totalCalories = foodEntries.reduce((sum, entry) => sum + entry.calories, 0);
          setConsumedCalories(totalCalories);
          
          // Get recent foods (last 5)
          setRecentFoods(foodEntries.slice(-5).reverse());
        } else {
          setConsumedCalories(0);
          setRecentFoods([]);
        }
      } catch (error) {
        console.error('Error loading today\'s food entries:', error);
      }
    };

    loadUserData();
    loadTodaysFoods();
    
    // Set up a listener for when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadTodaysFoods();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <Text style={styles.headerTitle}>Calorie Guru</Text>
          <Text style={styles.headerSubtitle}>Track meals the smart way</Text>
        </View>
        
        <DailyProgressCard 
          calorieGoal={calorieGoal} 
          consumedCalories={consumedCalories} 
        />
        
        <NutritionSummaryCard />
        
        <WaterTrackerCard />
        
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Foods</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Diary')}>
            <Text style={[styles.seeAllText, { color: theme.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <RecentFoodsCard 
          foods={recentFoods} 
          onFoodPress={(food) => navigation.navigate('FoodDetail', { food })} 
        />
        
        <TouchableOpacity 
          style={[styles.addFoodButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('AddFood')}
        >
          <Text style={styles.addFoodButtonText}>Add Food</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontWeight: '600',
  },
  addFoodButton: {
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  addFoodButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen;