import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NutritionFactsCard from '../components/NutritionFactsCard';
import { useTheme } from '../context/ThemeContext';

const FoodDetailScreen = ({ route, navigation }) => {
  const { food } = route.params;
  const [quantity, setQuantity] = useState(1);
  const { theme } = useTheme();
  
  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const calculateNutrition = (nutrient) => {
    return Math.round(food[nutrient] * quantity);
  };
  
  const addToFoodDiary = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const foodEntryKey = `foodEntries_${today}`;
      
      // Get existing entries for today
      const existingEntriesString = await AsyncStorage.getItem(foodEntryKey);
      let entries = [];
      
      if (existingEntriesString) {
        entries = JSON.parse(existingEntriesString);
      }
      
      // Create new entry
      const newEntry = {
        id: Date.now().toString(),
        ...food,
        quantity,
        calories: calculateNutrition('calories'),
        protein: calculateNutrition('protein'),
        carbs: calculateNutrition('carbs'),
        fat: calculateNutrition('fat'),
        timestamp: new Date().toISOString(),
      };
      
      // Add new entry to the list
      entries.push(newEntry);
      
      // Save updated entries
      await AsyncStorage.setItem(foodEntryKey, JSON.stringify(entries));
      
      // Show success message
      Alert.alert(
        'Success',
        `${food.name} added to your food diary`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error adding food to diary:', error);
      Alert.alert('Error', 'Failed to add food to diary');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <Text style={styles.foodName}>{food.name}</Text>
          <Text style={styles.foodCategory}>{food.category}</Text>
        </View>
        
        <View style={[styles.quantityContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.quantityLabel, { color: theme.text }]}>Quantity (servings):</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity style={[styles.quantityButton, { backgroundColor: theme.primary }]} onPress={decreaseQuantity}>
              <Ionicons name="remove" size={20} color="white" />
            </TouchableOpacity>
            <Text style={[styles.quantityValue, { color: theme.text }]}>{quantity}</Text>
            <TouchableOpacity style={[styles.quantityButton, { backgroundColor: theme.primary }]} onPress={increaseQuantity}>
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.caloriesSummary}>
          <Text style={[styles.caloriesValue, { color: theme.primary }]}>{calculateNutrition('calories')}</Text>
          <Text style={[styles.caloriesLabel, { color: theme.textSecondary }]}>calories</Text>
        </View>
        
        <NutritionFactsCard 
          calories={calculateNutrition('calories')}
          protein={calculateNutrition('protein')}
          carbs={calculateNutrition('carbs')}
          fat={calculateNutrition('fat')}
          fiber={calculateNutrition('fiber')}
          sugar={calculateNutrition('sugar')}
          servingSize={food.servingSize}
        />
        
        {food.description && (
          <View style={[styles.descriptionContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.descriptionTitle, { color: theme.text }]}>About this food:</Text>
            <Text style={[styles.descriptionText, { color: theme.textSecondary }]}>{food.description}</Text>
          </View>
        )}
        
        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={addToFoodDiary}>
          <Text style={styles.addButtonText}>Add to Diary</Text>
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
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  foodCategory: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
    marginTop: 5,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
  },
  caloriesSummary: {
    alignItems: 'center',
    marginVertical: 20,
  },
  caloriesValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  caloriesLabel: {
    fontSize: 16,
  },
  descriptionContainer: {
    padding: 15,
    margin: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  addButton: {
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FoodDetailScreen;