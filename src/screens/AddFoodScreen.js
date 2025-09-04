import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const AddFoodScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [foodData, setFoodData] = useState({
    name: '',
    category: 'Custom',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    sugar: '',
    servingSize: '',
    description: '',
  });
  
  // Custom foods are automatically categorized as 'Custom'
  
  const handleInputChange = (field, value) => {
    setFoodData({
      ...foodData,
      [field]: value
    });
  };
  
  const validateForm = () => {
    if (!foodData.name) {
      Alert.alert('Error', 'Please enter a food name');
      return false;
    }
    
    if (!foodData.calories) {
      Alert.alert('Error', 'Please enter calories');
      return false;
    }
    
    if (!foodData.servingSize) {
      Alert.alert('Error', 'Please enter a serving size');
      return false;
    }
    
    return true;
  };
  
  const addFoodToDiary = async (food) => {
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
        quantity: 1,
        timestamp: new Date().toISOString(),
      };
      
      // Add new entry to the list
      entries.push(newEntry);
      
      // Save updated entries
      await AsyncStorage.setItem(foodEntryKey, JSON.stringify(entries));
      
      Alert.alert('Success', `${food.name} added to today's intake`);
      navigation.goBack();
    } catch (error) {
      console.error('Error adding food to diary:', error);
      Alert.alert('Error', 'Failed to add food to diary');
    }
  };
  
  const saveFood = async () => {
    if (!validateForm()) return;
    
    try {
      // Convert string values to numbers
      const newFood = {
        id: Date.now().toString(),
        ...foodData,
        calories: parseInt(foodData.calories) || 0,
        protein: parseInt(foodData.protein) || 0,
        carbs: parseInt(foodData.carbs) || 0,
        fat: parseInt(foodData.fat) || 0,
        fiber: parseInt(foodData.fiber) || 0,
        sugar: parseInt(foodData.sugar) || 0,
      };
      
      // Get existing custom foods
      const customFoodsString = await AsyncStorage.getItem('customFoods');
      let customFoods = [];
      
      if (customFoodsString) {
        customFoods = JSON.parse(customFoodsString);
      }
      
      // Add new food to the list
      customFoods.push(newFood);
      
      // Save updated custom foods
      await AsyncStorage.setItem('customFoods', JSON.stringify(customFoods));
      
      // Ask user if they want to add the food to today's intake
      Alert.alert(
        'Food Added Successfully',
        'Would you like to add this food to today\'s intake?',
        [
          { text: 'No', onPress: () => navigation.goBack() },
          { text: 'Yes', onPress: () => addFoodToDiary(newFood) }
        ]
      );
    } catch (error) {
      console.error('Error saving custom food:', error);
      Alert.alert('Error', 'Failed to save food');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add New Food</Text>
          </View>
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Food Name*</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
              placeholder="Enter food name"
              value={foodData.name}
              onChangeText={(text) => handleInputChange('name', text)}
            />
          </View>
          
          {/* Category is automatically set to 'Custom' */}
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Serving Size*</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
              placeholder="e.g., 100g, 1 cup, 1 piece"
              value={foodData.servingSize}
              onChangeText={(text) => handleInputChange('servingSize', text)}
            />
          </View>
          
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Nutrition Information (per serving)</Text>
          
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionLabel, { color: theme.text }]}>Calories*</Text>
              <TextInput
                style={[styles.nutritionInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                placeholder="0"
                value={foodData.calories}
                onChangeText={(text) => handleInputChange('calories', text)}
                keyboardType="number-pad"
              />
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionLabel, { color: theme.text }]}>Protein (g)</Text>
              <TextInput
                style={[styles.nutritionInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                placeholder="0"
                value={foodData.protein}
                onChangeText={(text) => handleInputChange('protein', text)}
                keyboardType="number-pad"
              />
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionLabel, { color: theme.text }]}>Carbs (g)</Text>
              <TextInput
                style={[styles.nutritionInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                placeholder="0"
                value={foodData.carbs}
                onChangeText={(text) => handleInputChange('carbs', text)}
                keyboardType="number-pad"
              />
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionLabel, { color: theme.text }]}>Fat (g)</Text>
              <TextInput
                style={[styles.nutritionInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                placeholder="0"
                value={foodData.fat}
                onChangeText={(text) => handleInputChange('fat', text)}
                keyboardType="number-pad"
              />
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionLabel, { color: theme.text }]}>Fiber (g)</Text>
              <TextInput
                style={[styles.nutritionInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                placeholder="0"
                value={foodData.fiber}
                onChangeText={(text) => handleInputChange('fiber', text)}
                keyboardType="number-pad"
              />
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionLabel, { color: theme.text }]}>Sugar (g)</Text>
              <TextInput
                style={[styles.nutritionInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                placeholder="0"
                value={foodData.sugar}
                onChangeText={(text) => handleInputChange('sugar', text)}
                keyboardType="number-pad"
              />
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Description (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
              placeholder="Enter description or notes about this food"
              value={foodData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              multiline
              numberOfLines={4}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={saveFood}
          >
            <Text style={styles.saveButtonText}>Save Food</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  nutritionItem: {
    width: '48%',
    marginBottom: 15,
  },
  nutritionLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  nutritionInput: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  saveButton: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddFoodScreen;