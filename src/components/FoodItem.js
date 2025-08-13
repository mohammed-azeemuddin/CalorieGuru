import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const FoodItem = ({ food, onPress }) => {
  const { theme } = useTheme();
  // Get appropriate icon based on food category
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Main course':
        return 'restaurant-outline';
      case 'Snacks':
        return 'cafe-outline';
      case 'Sweets':
        return 'ice-cream-outline';
      case 'Beverages':
        return 'beer-outline';
      case 'Beverage':
        return 'beer-outline';
      case 'Other':
        return 'nutrition-outline';
      default:
        return 'nutrition-outline';
    }
  };

  // Format serving and quantity information
  const getServingInfo = () => {
    if (food.servingSize && food.quantity) {
      if (food.servingSize !== '-' && food.servingSize !== food.quantity) {
        return `${food.servingSize} • ${food.quantity}`;
      } else {
        return food.quantity;
      }
    } else if (food.servingSize) {
      return food.servingSize;
    } else if (food.quantity) {
      return food.quantity;
    } else {
      return '100g'; // Default
    }
  };

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: theme.card }]} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: theme.cardLight }]}>
        <Ionicons name={getCategoryIcon(food.category)} size={24} color={theme.primary} />
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={[styles.foodName, { color: theme.text }]}>{food.name}</Text>
        <Text style={[styles.servingInfo, { color: theme.textSecondary }]}>{getServingInfo()}</Text>
      </View>
      
      <View style={styles.nutritionContainer}>
        <Text style={[styles.calories, { color: theme.primary }]}>{food.calories} cal</Text>
        <View style={styles.macrosContainer}>
          <Text style={[styles.macroText, { color: theme.textSecondary }]}>P: {food.protein}g</Text>
          <Text style={[styles.macroText, { color: theme.textSecondary }]}>C: {food.carbs}g</Text>
          <Text style={[styles.macroText, { color: theme.textSecondary }]}>F: {food.fat}g</Text>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  servingInfo: {
    fontSize: 12,
    color: '#666',
  },
  nutritionContainer: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  calories: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  macrosContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  macroText: {
    fontSize: 12,
    marginLeft: 8,
  },
});

export default FoodItem;