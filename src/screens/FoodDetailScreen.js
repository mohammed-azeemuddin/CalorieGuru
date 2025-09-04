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
    // Handle different possible property names for backward compatibility
    let value = 0;
    
    switch (nutrient) {
      case 'calories':
        value = food.calories || 0;
        break;
      case 'protein':
        value = food.protein || 0;
        break;
      case 'carbs':
      case 'carbohydrates':
        // Try both 'carbohydrates' (from CSV) and 'carbs' (legacy)
        value = food.carbohydrates || food.carbs || 0;
        break;
      case 'fat':
      case 'fats':
        // Try both 'fats' (from CSV) and 'fat' (legacy)
        value = food.fats || food.fat || 0;
        break;
      case 'fiber':
        value = food.fiber || 0;
        break;
      case 'sugar':
        value = food.sugar || 0;
        break;
      default:
        value = food[nutrient] || 0;
    }
    
    return Math.round(value * quantity * 100) / 100; // Round to 2 decimal places
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
      
      // Create new entry with correct property names
      const newEntry = {
        id: Date.now().toString(),
        ...food,
        quantity,
        // Store calculated values using consistent property names
        calories: calculateNutrition('calories'),
        protein: calculateNutrition('protein'),
        carbohydrates: calculateNutrition('carbohydrates'), // Use 'carbohydrates' to match CSV
        fats: calculateNutrition('fats'), // Use 'fats' to match CSV
        // Also store legacy names for backward compatibility
        carbs: calculateNutrition('carbohydrates'),
        fat: calculateNutrition('fats'),
        fiber: calculateNutrition('fiber'),
        sugar: calculateNutrition('sugar'),
        timestamp: new Date().toISOString(),
      };
      
      // Add new entry to the list
      entries.push(newEntry);
      
      // Save updated entries
      await AsyncStorage.setItem(foodEntryKey, JSON.stringify(entries));
      
      // Show success message
      Alert.alert(
        'Success',
        `${food.name} (${quantity} serving${quantity > 1 ? 's' : ''}) added to today's intake`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error adding food to diary:', error);
      Alert.alert('Error', 'Failed to add food to diary');
    }
  };

  // Debug logging to help identify missing properties
  console.log('Food object properties:', Object.keys(food));
  console.log('Food nutrition values:', {
    calories: food.calories,
    protein: food.protein,
    carbohydrates: food.carbohydrates,
    carbs: food.carbs,
    fats: food.fats,
    fat: food.fat,
    fiber: food.fiber,
    sugar: food.sugar
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerNav}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <Text style={styles.foodName}>{food.name}</Text>
          <Text style={styles.foodCategory}>{food.category}</Text>
          {food.quantity && (
            <Text style={styles.foodServing}>Serving: {food.quantity}</Text>
          )}
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
          carbs={calculateNutrition('carbohydrates')} // Pass carbohydrates value as carbs
          fat={calculateNutrition('fats')} // Pass fats value as fat
          fiber={calculateNutrition('fiber')}
          sugar={calculateNutrition('sugar')}
          servingSize={food.quantity || food.servingSize} // Use quantity from CSV or fallback
        />
        
        {/* Nutrition Summary Cards */}
        <View style={styles.nutritionSummaryContainer}>
          <View style={[styles.nutritionCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.nutritionValue, { color: theme.primary }]}>{calculateNutrition('protein')}g</Text>
            <Text style={[styles.nutritionLabel, { color: theme.textSecondary }]}>Protein</Text>
          </View>
          <View style={[styles.nutritionCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.nutritionValue, { color: theme.primary }]}>{calculateNutrition('carbohydrates')}g</Text>
            <Text style={[styles.nutritionLabel, { color: theme.textSecondary }]}>Carbs</Text>
          </View>
          <View style={[styles.nutritionCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.nutritionValue, { color: theme.primary }]}>{calculateNutrition('fats')}g</Text>
            <Text style={[styles.nutritionLabel, { color: theme.textSecondary }]}>Fat</Text>
          </View>
        </View>
        
        {food.description && (
          <View style={[styles.descriptionContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.descriptionTitle, { color: theme.text }]}>About this food:</Text>
            <Text style={[styles.descriptionText, { color: theme.textSecondary }]}>{food.description}</Text>
          </View>
        )}
        
        {/* Food Details */}
        <View style={[styles.detailsContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.detailsTitle, { color: theme.text }]}>Food Details:</Text>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Category:</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{food.category}</Text>
          </View>
          {food.serving && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Serving Type:</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>{food.serving}</Text>
            </View>
          )}
          {food.quantity && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Serving Size:</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>{food.quantity}</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={addToFoodDiary}>
          <Text style={styles.addButtonText}>Log to Today's Intake</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backButton: {
    padding: 5,
  },
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
  foodServing: {
    fontSize: 14,
    color: 'white',
    opacity: 0.7,
    marginTop: 3,
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
  nutritionSummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 15,
    marginBottom: 15,
  },
  nutritionCard: {
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  nutritionLabel: {
    fontSize: 12,
    marginTop: 5,
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
  detailsContainer: {
    padding: 15,
    margin: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
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