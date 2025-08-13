/**
 * Utility functions to import Excel/CSV data and convert it to the app's food data format
 */

import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import XLSX from 'xlsx';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Picks an Excel file and converts it to the app's food data format
 * @returns {Promise<{success: boolean, message: string, data?: Array}>}
 */
export const importExcelFoodData = async () => {
  try {
    // Pick the Excel file
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      copyToCacheDirectory: true
    });

    if (result.canceled) {
      return { success: false, message: 'File selection was canceled' };
    }

    // Read the file
    const fileUri = result.assets[0].uri;
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64
    });

    // Parse Excel data
    const workbook = XLSX.read(fileContent, { type: 'base64' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Validate and transform data to match the app's food data structure
    const transformedData = transformExcelData(jsonData);

    return { 
      success: true, 
      message: `Successfully imported ${transformedData.length} food items`, 
      data: transformedData 
    };
  } catch (error) {
    console.error('Error importing Excel data:', error);
    return { success: false, message: `Error importing data: ${error.message}` };
  }
};

/**
 * Transforms Excel data to match the app's food data structure
 * @param {Array} excelData - Raw data from Excel
 * @returns {Array} - Transformed data matching the app's food structure
 */
const transformExcelData = (excelData) => {
  // Expected columns in Excel: name, category, calories, protein, carbs, fat, fiber, sugar, servingSize, description
  // If column names are different, map them here
  
  return excelData.map((item, index) => {
    // Generate a unique ID for each food item
    const id = `imported_${Date.now()}_${index}`;
    
    // Transform and validate each field
    return {
      id,
      name: item.name || item.Name || item.FOOD_NAME || item.food_name || 'Unknown Food',
      category: item.category || item.Category || item.CATEGORY || 'Other',
      calories: parseInt(item.calories || item.Calories || item.CALORIES || 0),
      protein: parseInt(item.protein || item.Protein || item.PROTEIN || 0),
      carbs: parseInt(item.carbs || item.Carbs || item.carbohydrates || item.CARBS || 0),
      fat: parseInt(item.fat || item.Fat || item.FAT || 0),
      fiber: parseInt(item.fiber || item.Fiber || item.FIBER || 0),
      sugar: parseInt(item.sugar || item.Sugar || item.SUGAR || 0),
      servingSize: item.servingSize || item.serving_size || item.ServingSize || item.SERVING_SIZE || '100g',
      description: item.description || item.Description || item.DESCRIPTION || ''
    };
  });
};

/**
 * Saves imported food data to AsyncStorage
 * @param {Array} foodData - Transformed food data
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const saveImportedFoodData = async (foodData) => {
  try {
    // Get existing custom foods
    const customFoodsString = await AsyncStorage.getItem('customFoods');
    let customFoods = [];
    
    if (customFoodsString) {
      customFoods = JSON.parse(customFoodsString);
    }
    
    // Add new imported foods
    const updatedCustomFoods = [...customFoods, ...foodData];
    
    // Save updated custom foods
    await AsyncStorage.setItem('customFoods', JSON.stringify(updatedCustomFoods));
    
    return { 
      success: true, 
      message: `Successfully saved ${foodData.length} imported food items` 
    };
  } catch (error) {
    console.error('Error saving imported food data:', error);
    return { success: false, message: `Error saving data: ${error.message}` };
  }
};

/**
 * Imports CSV data from a specific file path
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<{success: boolean, message: string, data?: Array}>}
 */
export const importCSVFromPath = async (filePath) => {
  try {
    // Read the file
    const fileContent = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.UTF8
    });

    // Parse CSV data
    const workbook = XLSX.read(fileContent, { type: 'string' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Transform data to match the app's food data structure
    const transformedData = transformCSVData(jsonData);

    return { 
      success: true, 
      message: `Successfully imported ${transformedData.length} food items`, 
      data: transformedData 
    };
  } catch (error) {
    console.error('Error importing CSV data:', error);
    return { success: false, message: `Error importing data: ${error.message}` };
  }
};

/**
 * Transforms CSV data to match the app's food data structure
 * @param {Array} csvData - Raw data from CSV
 * @returns {Array} - Transformed data matching the app's food structure
 */
const transformCSVData = (csvData) => {
  return csvData.map((item, index) => {
    // Generate a unique ID for each food item
    const id = `imported_${Date.now()}_${index}`;
    
    // Extract the dish name
    const name = item['Dish Name'] || 'Unknown Food';
    
    // Determine category based on the food name or set a default
    let category = 'Other';
    if (name.toLowerCase().includes('soup') || name.toLowerCase().includes('stock')) {
      category = 'Soup';
    } else if (name.toLowerCase().includes('sandwich')) {
      category = 'Snacks';
    } else if (name.toLowerCase().includes('tea') || name.toLowerCase().includes('coffee') || 
               name.toLowerCase().includes('drink') || name.toLowerCase().includes('lassi')) {
      category = 'Beverages';
    } else if (name.toLowerCase().includes('paratha') || name.toLowerCase().includes('chapati') || 
               name.toLowerCase().includes('porridge')) {
      category = 'Breakfast';
    } else {
      category = 'Lunch';
    }
    
    // Transform and validate each field
    return {
      id,
      name,
      category,
      calories: Math.round(parseFloat(item['Calories (kcal)'] || 0)),
      protein: Math.round(parseFloat(item['Protein (g)'] || 0)),
      carbs: Math.round(parseFloat(item['Carbohydrates (g)'] || 0)),
      fat: Math.round(parseFloat(item['Fats (g)'] || 0)),
      fiber: Math.round(parseFloat(item['Fibre (g)'] || 0)),
      sugar: Math.round(parseFloat(item['Free Sugar (g)'] || 0)),
      servingSize: '100g',
      description: `Indian dish with ${Math.round(parseFloat(item['Calories (kcal)'] || 0))} calories per 100g serving.`
    };
  });
};