import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const RecentFoodsCard = ({ foods, onFoodPress }) => {
  const { theme } = useTheme();
  if (!foods || foods.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.card }]}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No recent foods</Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>Foods you add will appear here</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <FlatList
        data={foods}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.foodItem}
            onPress={() => onFoodPress(item)}
          >
            <View style={[styles.foodIconContainer, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="restaurant-outline" size={24} color={theme.primary} />
            </View>
            
            <View style={styles.foodInfo}>
              <Text style={[styles.foodName, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.foodCategory, { color: theme.textSecondary }]}>{item.category}</Text>
            </View>
            
            <View style={styles.calorieInfo}>
              <Text style={[styles.calorieValue, { color: theme.primary }]}>{item.calories}</Text>
              <Text style={[styles.calorieLabel, { color: theme.textSecondary }]}>cal</Text>
            </View>
          </TouchableOpacity>
        )}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    margin: 15,
    marginTop: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    overflow: 'hidden',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 5,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme => theme.border,
  },
  foodIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
  },
  foodCategory: {
    fontSize: 14,
    marginTop: 2,
  },
  calorieInfo: {
    alignItems: 'center',
  },
  calorieValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  calorieLabel: {
    fontSize: 12,
  },
});

export default RecentFoodsCard;