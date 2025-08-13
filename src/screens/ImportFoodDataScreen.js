import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { importExcelFoodData, saveImportedFoodData, importCSVFromPath } from '../utils/importExcelData';
import * as FileSystem from 'expo-file-system';

const ImportFoodDataScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [importedData, setImportedData] = useState(null);
  const [error, setError] = useState(null);

  const handleImportExcel = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await importExcelFoodData();
      
      if (result.success) {
        setImportedData(result.data);
        Alert.alert('Success', result.message);
      } else {
        setError(result.message);
        Alert.alert('Error', result.message);
      }
    } catch (err) {
      const errorMessage = err.message || 'An unknown error occurred';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveData = async () => {
    if (!importedData || importedData.length === 0) {
      Alert.alert('Error', 'No data to save. Please import data first.');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await saveImportedFoodData(importedData);
      
      if (result.success) {
        Alert.alert('Success', result.message, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (err) {
      const errorMessage = err.message || 'An unknown error occurred';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={styles.headerTitle}>Import Food Data</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Import Indian Foods Dataset</Text>
          <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
            Import an Excel file containing Indian food data. The Excel file should have columns for name, category, calories, protein, carbs, fat, fiber, sugar, servingSize, and description.
          </Text>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleImportExcel}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="document-outline" size={20} color="white" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Select Excel File</Text>
              </>
            )}
          </TouchableOpacity>
          
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: theme.error + '15', borderColor: theme.error }]}>
              <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
            </View>
          )}
          
          {importedData && importedData.length > 0 && (
            <View style={styles.dataPreviewContainer}>
              <Text style={[styles.dataPreviewTitle, { color: theme.text }]}>
                Successfully imported {importedData.length} food items
              </Text>
              
              <View style={[styles.dataPreviewItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.previewItemTitle, { color: theme.text }]}>Sample Items:</Text>
                {importedData.slice(0, 3).map((item, index) => (
                  <View key={index} style={styles.previewItem}>
                    <Text style={[styles.previewItemName, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.previewItemDetails, { color: theme.textSecondary }]}>
                      {item.category} • {item.calories} cal • {item.servingSize}
                    </Text>
                  </View>
                ))}
                {importedData.length > 3 && (
                  <Text style={[styles.moreItems, { color: theme.textSecondary }]}>
                    ...and {importedData.length - 3} more items
                  </Text>
                )}
              </View>
              
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: theme.success }]}
                onPress={handleSaveData}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={20} color="white" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Save to Database</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Excel Format Requirements</Text>
          <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
            Your Excel file should have the following columns:
          </Text>
          
          <View style={styles.requirementsList}>
            {[
              'name - Name of the food item',
              'category - Category (Breakfast, Lunch, Dinner, Snacks, Sweets, Beverages)',
              'calories - Calories per serving (number)',
              'protein - Protein in grams (number)',
              'carbs - Carbohydrates in grams (number)',
              'fat - Fat in grams (number)',
              'fiber - Fiber in grams (number)',
              'sugar - Sugar in grams (number)',
              'servingSize - Serving size (e.g., "1 cup (200g)")',
              'description - Description of the food item'
            ].map((item, index) => (
              <View key={index} style={styles.requirementItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.success} style={styles.requirementIcon} />
                <Text style={[styles.requirementText, { color: theme.text }]}>{item}</Text>
              </View>
            ))}
          </View>
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
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  card: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 15,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorContainer: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 15,
  },
  errorText: {
    fontSize: 14,
  },
  dataPreviewContainer: {
    marginTop: 15,
  },
  dataPreviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dataPreviewItem: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 15,
  },
  previewItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  previewItem: {
    marginBottom: 8,
  },
  previewItemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewItemDetails: {
    fontSize: 12,
  },
  moreItems: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  requirementsList: {
    marginTop: 5,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementIcon: {
    marginRight: 8,
  },
  requirementText: {
    fontSize: 14,
    flex: 1,
  },
});

export default ImportFoodDataScreen;