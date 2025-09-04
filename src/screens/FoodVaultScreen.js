import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FoodItem from '../components/FoodItem';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as XLSX from 'xlsx';
import { Asset } from 'expo-asset';
import { useFocusEffect } from '@react-navigation/native';

const FoodVaultScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [allFoods, setAllFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  // Use a ref to store the initial category to prevent it from changing on re-renders
  const initialCategoryRef = React.useRef(route.params?.initialCategory || 'All');
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryRef.current);
  const [categories, setCategories] = useState(['All']);
  const [customFoods, setCustomFoods] = useState([]);

  // Enhanced CSV parsing function with better error handling
  const parseCSVContent = (csvContent) => {
    try {
      console.log('Starting CSV parsing...');
      console.log('CSV content length:', csvContent.length);
      
      // Log first few lines for debugging
      const lines = csvContent.split('\n').slice(0, 3);
      console.log('First few lines of CSV:');
      lines.forEach((line, index) => {
        console.log(`Line ${index}: "${line}"`);
      });
      
      // Parse CSV using XLSX
      const workbook = XLSX.read(csvContent, { 
        type: 'string',
        raw: false, // Don't parse as raw values
        cellDates: false,
        cellNF: false,
        cellText: true // Parse as text to avoid conversion issues
      });
      
      const sheetName = workbook.SheetNames[0];
      console.log('Sheet name:', sheetName);
      
      const worksheet = workbook.Sheets[sheetName];
      
      // Get the range of the worksheet
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      console.log('Worksheet range:', range);
      
      // Convert to JSON with header processing
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1, // Get as array of arrays first
        raw: false,
        defval: '-' // Default value for empty cells as '-' to handle missing serving sizes
      });
      
      console.log('Raw JSON data length:', jsonData.length);
      
      if (jsonData.length === 0) {
        throw new Error('No data found in CSV');
      }
      
      // Get headers from first row
      const headers = jsonData[0];
      console.log('Headers found:', headers);
      
      // Expected column mappings with variations
      const columnMappings = {
        name: ['Dish Name', 'dish name', 'Name', 'name', 'DISH NAME'],
        category: ['Category', 'category', 'CATEGORY'],
        serving: ['Serving', 'serving', 'SERVING'],
        quantity: ['Quantity', 'quantity', 'QUANTITY'],
        calories: ['Calories (kcal)', 'calories (kcal)', 'Calories', 'calories', 'CALORIES (KCAL)', 'CALORIES'],
        carbohydrates: ['Carbohydrates (g)', 'carbohydrates (g)', 'Carbohydrates', 'carbohydrates', 'CARBOHYDRATES (G)', 'CARBOHYDRATES'],
        protein: ['Protein (g)', 'protein (g)', 'Protein', 'protein', 'PROTEIN (G)', 'PROTEIN'],
        fats: ['Fats (g)', 'fats (g)', 'Fats', 'fats', 'FATS (G)', 'FATS']
      };
      
      // Find column indices
      const columnIndices = {};
      Object.keys(columnMappings).forEach(key => {
        const possibleNames = columnMappings[key];
        const index = headers.findIndex(header => 
          possibleNames.some(name => 
            header && header.toString().trim().toLowerCase() === name.toLowerCase()
          )
        );
        columnIndices[key] = index;
        console.log(`Column "${key}" found at index: ${index} (header: "${headers[index]}")`);
      });
      
      // Check if we found the essential columns
      if (columnIndices.name === -1) {
        console.error('Could not find "Dish Name" column');
        console.log('Available headers:', headers);
        throw new Error('Could not find "Dish Name" column in CSV');
      }
      
      // Process data rows (skip header row)
      const dataRows = jsonData.slice(1);
      console.log('Processing', dataRows.length, 'data rows');
      
      const transformedData = dataRows
        .filter(row => row && row.length > 0 && row[columnIndices.name]) // Filter out empty rows
        .map((row, index) => {
          // Normalize category names to handle variations
          const normalizeCategory = (category) => {
            const cat = category.toString().trim();
            // Handle common variations
            const categoryMappings = {
              'beverage': 'Beverages',
              'beverages': 'Beverages',
              'drink': 'Beverages',
              'drinks': 'Beverages',
              'snack': 'Snacks',
              'snacks': 'Snacks',
              'vegetable': 'Vegetables',
              'vegetables': 'Vegetables',
              'veggie': 'Vegetables',
              'veggies': 'Vegetables',
              'grain': 'Grains',
              'grains': 'Grains',
              'cereal': 'Grains',
              'cereals': 'Grains',
              'protein': 'Protein',
              'proteins': 'Protein',
              'meat': 'Protein',
              'meats': 'Protein',
              'dairy': 'Dairy',
              'milk': 'Dairy',
              'fruit': 'Fruits',
              'fruits': 'Fruits',
              'dessert': 'Desserts',
              'desserts': 'Desserts',
              'sweet': 'Desserts',
              'sweets': 'Desserts'
            };
            
            const lowerCat = cat.toLowerCase();
            return categoryMappings[lowerCat] || cat || 'Other';
          };

          const item = {
            id: index + 1,
            name: (row[columnIndices.name] || '').toString().trim(),
            category: normalizeCategory(row[columnIndices.category] || 'Other'),
            serving: (row[columnIndices.serving] || '-').toString().trim(),
            quantity: (row[columnIndices.quantity] || '-').toString().trim(),
            calories: parseFloat(String(row[columnIndices.calories]).replace(/[^0-9.]/g, '')) || 0,
            carbs: parseFloat(String(row[columnIndices.carbohydrates]).replace(/[^0-9.]/g, '')) || 0,
            protein: parseFloat(String(row[columnIndices.protein]).replace(/[^0-9.]/g, '')) || 0,
            fat: parseFloat(String(row[columnIndices.fats]).replace(/[^0-9.]/g, '')) || 0,
            hasOriginalServingSize: (row[columnIndices.serving] || '-') !== '-' // Mark as having original serving data
          };
          
          // Create description
          item.description = `${item.name} - ${item.category} (${item.quantity})`;
          
          // Log first few items for verification
          if (index < 3) {
            console.log(`Sample item ${index + 1}:`, JSON.stringify(item, null, 2));
          }
          
          return item;
        })
        .filter(item => item.name && item.name.length > 0); // Final filter for valid items
      
      console.log(`Successfully transformed ${transformedData.length} food items`);
      
      // Log category distribution
      const categoryCounts = {};
      transformedData.forEach(item => {
        const cat = item.category || 'Other';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
      
      console.log('Category distribution:');
      Object.entries(categoryCounts).forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count} items`);
      });
      
      return transformedData;
      
    } catch (error) {
      console.error('Error parsing CSV content:', error);
      console.error('Error details:', error.message);
      throw error;
    }
  };

  // Enhanced CSV loading with better debugging
  const loadFoodData = async () => {
    try {
      console.log('=== Starting CSV Load Process ===');
      console.log('Platform:', Platform.OS);
      
      let csvContent = null;
      
      // Try to get cached CSV content first
      const cachedContent = await getCachedCSV();
      
      if (cachedContent) {
        console.log('Using cached CSV content (length:', cachedContent.length, ')');
        csvContent = cachedContent;
      } else {
        console.log('Loading CSV content for first time');
        
        if (Platform.OS === 'web') {
          try {
            console.log('Attempting to fetch CSV from web assets');
            // Try multiple possible paths for web
            const possiblePaths = [
              '/assets/FoodSheet.csv',
              '/assets/foodsheet.csv',
              './assets/FoodSheet.csv',
              '../assets/FoodSheet.csv'
            ];
            
            let loaded = false;
            for (const path of possiblePaths) {
              try {
                console.log(`Trying path: ${path}`);
                const response = await fetch(path);
                if (response.ok) {
                  csvContent = await response.text();
                  console.log(`Successfully loaded CSV from ${path} (length: ${csvContent.length})`);
                  loaded = true;
                  break;
                }
              } catch (e) {
                console.log(`Failed to load from ${path}:`, e.message);
              }
            }
            
            if (!loaded) {
              throw new Error('Could not load from any web path');
            }
            
          } catch (error) {
            console.log('Could not load CSV from web assets:', error.message);
            console.log('Using fallback sample data');
            csvContent = getSampleCSVContent();
          }
        } else {
          // For native platforms (iOS and Android)
          try {
            console.log('Attempting to load CSV from bundled assets');
            const asset = Asset.fromModule(require('../../assets/FoodSheet.csv'));
            
            console.log('Asset info:', {
              uri: asset.uri,
              hash: asset.hash
            });
            
            const response = await fetch(asset.uri);
            if (response.ok) {
              csvContent = await response.text();
              console.log(`Successfully loaded CSV using fetch (length: ${csvContent.length})`);
            } else {
              throw new Error(`Fetch failed with status ${response.status}`);
            }
          } catch (error) {
            console.error('Error loading bundled asset:', error);
            console.log('Falling back to sample data');
            csvContent = getSampleCSVContent();
          }
        }
        
        // Cache the content for future use
        if (csvContent && csvContent !== getSampleCSVContent()) {
          await setCachedCSV(csvContent);
          console.log('CSV content cached successfully');
        }
      }
      
      // Parse the CSV content
      console.log('=== Starting CSV Parsing ===');
      const transformedData = parseCSVContent(csvContent);
      
      // If we got no data but had CSV content, something went wrong with parsing
      if (transformedData.length === 0 && csvContent) {
        console.error('CSV parsing returned no data despite having content');
        console.log('CSV content first 100 chars:', csvContent.substring(0, 100));
        await AsyncStorage.removeItem('cached_csv_content');
        console.log('Cleared cached CSV due to parsing error');
        throw new Error('CSV parsing failed to produce data');
      }
      
      console.log('=== CSV Load Complete ===');
      console.log(`Final result: ${transformedData.length} food items loaded`);
      
      return transformedData;
      
    } catch (error) {
      console.error('=== CSV Load Failed ===');
      console.error('Error loading food data:', error);
      console.error('Error stack:', error.stack);
      
      // Return sample data as fallback
      console.log('Returning sample data as fallback');
      return getSampleFoodData();
    }
  };

  // Helper function to check if a food item has a serving size
  const hasServingSize = (food) => {
    return food.hasOriginalServingSize || (food.serving && food.serving !== '-');
  };

  // Helper function to sort foods by serving availability first, then by name
  const sortByServingAndName = (a, b) => {
    const aHasServing = hasServingSize(a);
    const bHasServing = hasServingSize(b);
    
    if (aHasServing && !bHasServing) return -1;
    if (!aHasServing && bHasServing) return 1;
    return a.name.localeCompare(b.name);
  };

  // Function to filter and sort foods
  const filterAndSortFoods = (foods, searchText) => {
    return foods
      .filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
      )
      .sort(sortByServingAndName);
  };

  // Sample CSV content for fallback (with exact headers you mentioned)
  const getSampleCSVContent = () => {
    return `Dish Name,Category,Serving,Quantity,Calories (kcal),Carbohydrates (g),Protein (g),Fats (g)
Rice,Grains,Bowl,1 cup,200,45,4,0.5
Chicken Curry,Protein,Plate,1 serving,300,10,30,15
Vegetable Salad,Vegetables,Bowl,1 bowl,50,10,3,2
Chapati,Grains,Piece,1 piece,120,25,3,1
Dal Tadka,Protein,Bowl,1 bowl,180,20,12,6
Paneer Butter Masala,Protein,Plate,100g,265,8,18,20
Biryani,Mixed,Plate,1 plate,400,50,15,18
Samosa,Snacks,Piece,1 piece,150,18,3,8
Mango Lassi,Beverages,Glass,1 glass,120,20,8,4
Masala Chai,Beverages,Cup,1 cup,50,8,2,2`;
  };

  // Sample food data for fallback
  const getSampleFoodData = () => {
    const csvContent = getSampleCSVContent();
    try {
      return parseCSVContent(csvContent);
    } catch (error) {
      console.error('Error parsing sample CSV:', error);
      return [
        { 
          id: 1, 
          name: 'Rice', 
          category: 'Grains', 
          serving: 'Bowl', 
          quantity: '1 cup', 
          calories: 200, 
          carbs: 45, 
          protein: 4, 
          fat: 0.5, 
          description: 'Rice - Grains (1 cup)',
          hasOriginalServingSize: true
        }
      ];
    }
  };

  // Platform-agnostic storage functions
  const getCachedCSV = async () => {
    try {
      return await AsyncStorage.getItem('cached_csv_content');
    } catch (error) {
      console.log('Could not get cached CSV:', error.message);
      return null;
    }
  };

  const setCachedCSV = async (content) => {
    try {
      await AsyncStorage.setItem('cached_csv_content', content);
      console.log('CSV content cached successfully');
    } catch (error) {
      console.log('Could not cache CSV content:', error.message);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    
    let filtered = allFoods;
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(food => food.category === selectedCategory);
    }
    
    if (text) {
      filtered = filterAndSortFoods(filtered, text);
    } else {
      // Sort by serving availability even when no search query
      filtered = filtered.sort(sortByServingAndName);
    }
    
    setFilteredFoods(filtered);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    
    let filtered = allFoods;
    
    if (category !== 'All') {
      console.log(`Filtering for category "${category}": Found ${allFoods.filter(food => food.category === category).length} items`);
      filtered = filtered.filter(food => food.category === category);
    }
    
    if (searchQuery) {
      filtered = filterAndSortFoods(filtered, searchQuery);
    } else {
      // Sort by serving availability even when no search query
      filtered = filtered.sort(sortByServingAndName);
    }
    
    setFilteredFoods(filtered);
  };

  useEffect(() => {
    navigation.setOptions({
      title: 'Food Vault',
    });
    loadAllFoods();
  }, []);

  // Load custom foods from AsyncStorage
  const loadCustomFoods = async () => {
    try {
      const customFoodsString = await AsyncStorage.getItem('customFoods');
      if (customFoodsString) {
        return JSON.parse(customFoodsString);
      }
      return [];
    } catch (error) {
      console.error('Error loading custom foods:', error);
      return [];
    }
  };

  // Delete a custom food
  const deleteCustomFood = async (foodId, foodName, deleteFromIntake = false) => {
    try {
      console.log('Deleting food with ID:', foodId, 'and name:', foodName);
      
      // Get current custom foods
      const customFoodsString = await AsyncStorage.getItem('customFoods');
      if (!customFoodsString) return;
      
      const currentCustomFoods = JSON.parse(customFoodsString);
      console.log('Current custom foods count:', currentCustomFoods.length);
      
      // Filter out the food to delete by ID
      const updatedCustomFoods = currentCustomFoods.filter(food => food.id !== foodId);
      console.log('Updated custom foods count:', updatedCustomFoods.length);
      
      // Save updated custom foods
      await AsyncStorage.setItem('customFoods', JSON.stringify(updatedCustomFoods));
      
      // Update state
      setCustomFoods(updatedCustomFoods);
      
      // Update all foods and filtered foods - make sure to filter by ID
      // This ensures we only remove the exact food item that was deleted
      const updatedAllFoods = allFoods.filter(food => food.id !== foodId);
      setAllFoods(updatedAllFoods);
      
      // Update filtered foods based on current category
      setFilteredFoods(prev => prev.filter(food => food.id !== foodId));
      
      // Force a reload of all foods to ensure consistency
      setTimeout(() => {
        loadAllFoods(updatedCustomFoods);
      }, 100);
      
      // If deleteFromIntake is true, also delete from today's intake
      if (deleteFromIntake) {
        const today = new Date().toISOString().split('T')[0];
        const foodEntryKey = `foodEntries_${today}`;
        
        // Get existing entries for today
        const existingEntriesString = await AsyncStorage.getItem(foodEntryKey);
        
        if (existingEntriesString) {
          const entries = JSON.parse(existingEntriesString);
          
          // Remove all entries with the same food name
          const updatedEntries = entries.filter(entry => entry.name !== foodName);
          
          // Save updated entries
          await AsyncStorage.setItem(foodEntryKey, JSON.stringify(updatedEntries));
        }
      }
      
      Alert.alert('Success', 'Food deleted successfully');
    } catch (error) {
      console.error('Error deleting custom food:', error);
      Alert.alert('Error', 'Failed to delete food');
    }
  };

  // Check if a food is in today's intake
  const checkFoodInTodaysIntake = async (foodName) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const foodEntryKey = `foodEntries_${today}`;
      
      // Get existing entries for today
      const existingEntriesString = await AsyncStorage.getItem(foodEntryKey);
      
      if (existingEntriesString) {
        const entries = JSON.parse(existingEntriesString);
        // Check if any entry has the same food name
        return entries.some(entry => entry.name === foodName);
      }
      
      return false;
    } catch (error) {
      console.error('Error checking food in today\'s intake:', error);
      return false;
    }
  };

  // Confirm deletion of a custom food
  const confirmDeleteFood = async (food) => {
    // Check if the food is in today's intake
    const isInTodaysIntake = await checkFoodInTodaysIntake(food.name);
    
    if (isInTodaysIntake) {
      // If the food is in today's intake, ask if the user wants to delete it from there too
      Alert.alert(
        'Delete Food',
        `${food.name} is in today's intake. Do you want to delete it from both the Food Vault and today's intake?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Food Vault Only', onPress: () => deleteCustomFood(food.id, food.name, false) },
          { text: 'Both', style: 'destructive', onPress: () => deleteCustomFood(food.id, food.name, true) }
        ]
      );
    } else {
      // If the food is not in today's intake, just confirm deletion from Food Vault
      Alert.alert(
        'Delete Food',
        `Are you sure you want to delete ${food.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deleteCustomFood(food.id, food.name, false) }
        ]
      );
    }
  };

  // Use useFocusEffect to reload custom foods when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const loadFoods = async () => {
        // Clear the existing foods first to prevent stale data
        setAllFoods([]);
        setFilteredFoods([]);
        
        const customFoodsData = await loadCustomFoods();
        setCustomFoods(customFoodsData);
        loadAllFoods(customFoodsData);
      };
      
      loadFoods();
      
      // Preserve the selected category from route params if it exists
      if (route.params?.initialCategory) {
        setSelectedCategory(route.params.initialCategory);
        // Update the ref to maintain the value across re-renders
        initialCategoryRef.current = route.params.initialCategory;
        // Clear the parameter after using it to prevent reapplying on subsequent focus events
        navigation.setParams({ initialCategory: undefined });
      }
    }, [navigation, route.params?.initialCategory])
  );

  const loadAllFoods = async (customFoodsData = null) => {
    try {
      console.log('=== Starting loadAllFoods ===');
      
      // Get custom foods from AsyncStorage or use provided data
      let customFoods = [];
      if (customFoodsData) {
        customFoods = customFoodsData;
        console.log(`Using provided ${customFoods.length} custom foods`);
      } else {
        const customFoodsString = await AsyncStorage.getItem('customFoods');
        if (customFoodsString) {
          customFoods = JSON.parse(customFoodsString);
          console.log(`Loaded ${customFoods.length} custom foods from AsyncStorage`);
        }
      }
      
      // Ensure each custom food has a unique ID
      customFoods = customFoods.map((food, index) => ({
        ...food,
        id: food.id || `custom_${index}_${Date.now()}` // Ensure unique IDs
      }));
      
      // Load food data from CSV
      const csvFoods = await loadFoodData();
      console.log(`Successfully loaded ${csvFoods.length} foods from CSV`);
      
      // Combine and sort foods
      const combinedFoods = [...customFoods, ...csvFoods];
      // Sort foods by serving availability first, then by name
      const sortedFoods = [...combinedFoods].sort(sortByServingAndName);
      
      console.log(`Total foods: ${sortedFoods.length}`);
      setAllFoods(sortedFoods);
      
      // Generate categories with normalization for custom foods too
      const csvCategories = new Set();
      const normalizeCategory = (category) => {
        const cat = category.toString().trim();
        const categoryMappings = {
          'beverage': 'Beverages',
          'beverages': 'Beverages',
          'drink': 'Beverages',
          'drinks': 'Beverages',
          'snack': 'Snacks',
          'snacks': 'Snacks',
          'vegetable': 'Vegetables',
          'vegetables': 'Vegetables',
          'veggie': 'Vegetables',
          'veggies': 'Vegetables',
          'grain': 'Grains',
          'grains': 'Grains',
          'cereal': 'Grains',
          'cereals': 'Grains',
          'protein': 'Protein',
          'proteins': 'Protein',
          'meat': 'Protein',
          'meats': 'Protein',
          'dairy': 'Dairy',
          'milk': 'Dairy',
          'fruit': 'Fruits',
          'fruits': 'Fruits',
          'dessert': 'Desserts',
          'desserts': 'Desserts',
          'sweet': 'Desserts',
          'sweets': 'Desserts'
        };
        
        const lowerCat = cat.toLowerCase();
        return categoryMappings[lowerCat] || cat || 'Other';
      };
      
      // Normalize categories for all foods (both CSV and custom)
      const allFoodsWithNormalizedCategories = sortedFoods.map(food => ({
        ...food,
        category: normalizeCategory(food.category || 'Other'),
        isCustom: customFoods.some(customFood => customFood.id === food.id)
      }));
      
      // Update the sorted foods with normalized categories
      setAllFoods(allFoodsWithNormalizedCategories);
      
      // Generate categories from normalized data
      allFoodsWithNormalizedCategories.forEach(food => {
        if (food.category) {
          csvCategories.add(food.category);
        }
      });
      
      const categoryArray = Array.from(csvCategories).sort();
      
      // Make sure 'Custom' and 'Other' are at the end
      const customIndex = categoryArray.indexOf('Custom');
      if (customIndex > -1) {
        categoryArray.splice(customIndex, 1);
      }
      
      const otherIndex = categoryArray.indexOf('Other');
      if (otherIndex > -1) {
        categoryArray.splice(otherIndex, 1);
      }
      
      // Add 'Other' at the end
      categoryArray.push('Other');
      
      // Create dynamic categories with 'All' first, then 'Custom', then the rest
      const dynamicCategories = ['All', 'Custom', ...categoryArray];
      
      console.log('Categories:', dynamicCategories);
      setCategories(dynamicCategories);
      
      // Initialize filtered foods with normalized categories
      let filtered = allFoodsWithNormalizedCategories;
      if (selectedCategory !== 'All') {
        if (selectedCategory === 'Custom') {
          filtered = filtered.filter(food => food.isCustom);
        } else {
          filtered = filtered.filter(food => food.category === selectedCategory);
        }
      }
      if (searchQuery) {
        filtered = filterAndSortFoods(filtered, searchQuery);
      }
      setFilteredFoods(filtered);
      
    } catch (error) {
      console.error('Error in loadAllFoods:', error);
      Alert.alert('Error', 'Failed to load food database. Using sample data.');
      
      const fallbackFoods = getSampleFoodData();
      setAllFoods(fallbackFoods);
      setFilteredFoods(fallbackFoods);
      setCategories(['All', 'Grains', 'Protein', 'Vegetables', 'Mixed', 'Snacks', 'Beverages']);
    }
  };
  
  // Function to clear cache and reload data
  const clearCacheAndReload = async () => {
    try {
      console.log('Clearing CSV cache and reloading data');
      await AsyncStorage.removeItem('cached_csv_content');
      await loadAllFoods();
      Alert.alert('Success', 'Food data reloaded successfully');
    } catch (error) {
      console.error('Error reloading data:', error);
      Alert.alert('Error', 'Failed to reload data: ' + error.message);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
        <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search foods..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity onPress={clearCacheAndReload} style={styles.refreshButton}>
           <Ionicons name="refresh" size={20} color={theme.textSecondary} />
         </TouchableOpacity>
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
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={3}
          getItemLayout={(data, index) => ({
            length: 100, // Approximate width of each category item
            offset: 100 * index,
            index,
          })}
        />
      </View>
      
      {selectedCategory === 'Custom' && customFoods.length > 0 && (
        <TouchableOpacity 
          style={[styles.addCustomButtonHeader, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('AddFood')}
        >
          <Text style={styles.addCustomButtonText}>Add Custom Food</Text>
        </TouchableOpacity>
      )}
      
      <FlatList
        data={filteredFoods}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <FoodItem 
            food={item} 
            onPress={() => navigation.navigate('FoodDetail', { food: item })}
            onDelete={item.category === 'Custom' ? confirmDeleteFood : null}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {selectedCategory === 'Custom' ? (
              <View style={styles.emptyCustomContainer}>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No custom foods found</Text>
                <TouchableOpacity 
                  style={[styles.addCustomButton, { backgroundColor: theme.primary }]}
                  onPress={() => navigation.navigate('AddFood')}
                >
                  <Text style={styles.addCustomButtonText}>Add Custom Food</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No foods found</Text>
            )}
          </View>
        }
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={10}
        updateCellsBatchingPeriod={50}
        getItemLayout={(data, index) => ({
          length: 80, // Approximate height of each item
          offset: 80 * index,
          index,
        })}
      />
      
      {selectedCategory !== 'Custom' && (
        <TouchableOpacity 
          style={[styles.floatingButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('AddFood')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}
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
  refreshButton: {
    padding: 8,
    marginLeft: 5,
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
  emptyCustomContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 20,
  },
  addCustomButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  addCustomButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addCustomButtonHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 10,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButton: {
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

export default FoodVaultScreen;