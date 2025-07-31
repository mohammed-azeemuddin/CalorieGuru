import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FoodItem from '../components/FoodItem';
import { indianFoods } from '../data/indianFoods';
import { useTheme } from '../context/ThemeContext';

const FoodDatabaseScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFoods, setFilteredFoods] = useState(indianFoods);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = [
    'All',
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snacks',
    'Sweets',
    'Beverages'
  ];

  const handleSearch = (text) => {
    setSearchQuery(text);
    
    let filtered = indianFoods;
    
    // Filter by category if not 'All'
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(food => food.category === selectedCategory);
    }
    
    // Filter by search text
    if (text) {
      filtered = filtered.filter(food => 
        food.name.toLowerCase().includes(text.toLowerCase())
      );
    }
    
    setFilteredFoods(filtered);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    
    let filtered = indianFoods;
    
    // Filter by category if not 'All'
    if (category !== 'All') {
      filtered = filtered.filter(food => food.category === category);
    }
    
    // Apply existing search filter
    if (searchQuery) {
      filtered = filtered.filter(food => 
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredFoods(filtered);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
        <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search Indian foods..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>
      
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.categoryItem, 
                { backgroundColor: theme.card, borderColor: theme.border },
                selectedCategory === item && [styles.selectedCategory, { backgroundColor: theme.primary, borderColor: theme.primary }]
              ]}
              onPress={() => handleCategorySelect(item)}
            >
              <Text style={[
                styles.categoryText, 
                { color: theme.text },
                selectedCategory === item && styles.selectedCategoryText
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      
      <FlatList
        data={filteredFoods}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <FoodItem 
            food={item} 
            onPress={() => navigation.navigate('FoodDetail', { food: item })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No foods found</Text>
          </View>
        }
      />
      
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate('AddFood')}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    margin: 15,
    paddingHorizontal: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
  },
  categoriesContainer: {
    marginBottom: 10,
  },
  categoryItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  selectedCategory: {
  },
  categoryText: {
  },
  selectedCategoryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default FoodDatabaseScreen;