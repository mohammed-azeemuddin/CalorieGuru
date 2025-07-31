import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const BarcodeScannerScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  
  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || !scanning) return;
    
    setScanned(true);
    setLoading(true);
    
    try {
      // In a real app, this would call a food database API with the barcode
      // For this demo, we'll simulate an API call with a timeout
      setTimeout(() => {
        // Simulate finding a food item
        const foundFood = simulateBarcodeSearch(data);
        
        if (foundFood) {
          Alert.alert(
            'Food Found',
            `Found: ${foundFood.name}\nCalories: ${foundFood.calories} per ${foundFood.servingSize}`,
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => {
                  setScanned(false);
                  setLoading(false);
                }
              },
              {
                text: 'Add to Diary',
                onPress: () => {
                  addFoodToDiary(foundFood);
                  setLoading(false);
                  navigation.goBack();
                }
              },
              {
                text: 'View Details',
                onPress: () => {
                  setLoading(false);
                  navigation.navigate('FoodDetail', { food: foundFood });
                }
              }
            ]
          );
        } else {
          Alert.alert(
            'Food Not Found',
            'Sorry, we couldn\'t find this food item in our database.',
            [
              {
                text: 'Try Again',
                onPress: () => {
                  setScanned(false);
                  setLoading(false);
                }
              },
              {
                text: 'Add Manually',
                onPress: () => {
                  setLoading(false);
                  navigation.navigate('AddFood');
                }
              }
            ]
          );
        }
      }, 1500); // Simulate API delay
    } catch (error) {
      console.error('Error processing barcode:', error);
      Alert.alert('Error', 'Failed to process barcode');
      setScanned(false);
      setLoading(false);
    }
  };
  
  const simulateBarcodeSearch = (barcode) => {
    // This is a mock function that simulates finding food by barcode
    // In a real app, this would be an API call to a food database
    
    // For demo purposes, we'll return a food item for certain barcodes
    // and null for others to simulate not finding an item
    
    // Sample barcode matches (for testing)
    const barcodeFoodMap = {
      '8901725132829': {
        id: 'bc1',
        name: 'Parle-G Biscuits',
        category: 'Snacks',
        calories: 120,
        protein: 2,
        carbs: 22,
        fat: 3,
        fiber: 0.5,
        sugar: 8,
        servingSize: '4 biscuits (25g)',
        description: 'Popular Indian glucose biscuits',
      },
      '8901063010508': {
        id: 'bc2',
        name: 'Maggi Noodles',
        category: 'Lunch',
        calories: 350,
        protein: 8,
        carbs: 55,
        fat: 12,
        fiber: 2,
        sugar: 1,
        servingSize: '1 packet (70g)',
        description: 'Instant noodles with masala flavor',
      },
      '8901058851826': {
        id: 'bc3',
        name: 'Amul Butter',
        category: 'Breakfast',
        calories: 90,
        protein: 0,
        carbs: 0,
        fat: 10,
        fiber: 0,
        sugar: 0,
        servingSize: '1 tablespoon (14g)',
        description: 'Pasteurized butter',
      },
      // Add more sample barcodes as needed
    };
    
    // Return the food if found, otherwise null
    return barcodeFoodMap[barcode] || null;
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
      
      Alert.alert('Success', `${food.name} added to your food diary`);
    } catch (error) {
      console.error('Error adding food to diary:', error);
      Alert.alert('Error', 'Failed to add food to diary');
    }
  };
  
  const toggleFlash = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.torch
        : Camera.Constants.FlashMode.off
    );
  };
  
  const toggleScanning = () => {
    setScanning(!scanning);
    if (scanned) setScanned(false);
  };
  
  if (hasPermission === null) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.text, { color: theme.text }]}>Requesting camera permission...</Text>
      </SafeAreaView>
    );
  }
  
  if (hasPermission === false) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.text, { color: theme.text }]}>No access to camera</Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#000' }]}>
      <Camera
        style={styles.camera}
        type={Camera.Constants.Type.back}
        flashMode={flashMode}
        onBarCodeScanned={scanning ? handleBarCodeScanned : undefined}
        barCodeScannerSettings={{
          barCodeTypes: [BarCodeScanner.Constants.BarCodeType.ean13, BarCodeScanner.Constants.BarCodeType.ean8],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Scan Barcode</Text>
            
            <TouchableOpacity 
              style={styles.flashButton}
              onPress={toggleFlash}
            >
              <Ionicons 
                name={flashMode === Camera.Constants.FlashMode.torch ? "flash" : "flash-off"} 
                size={24} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.primary} />
                  <Text style={styles.loadingText}>Searching food database...</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.instructions}>
              {scanning 
                ? 'Position the barcode within the frame to scan' 
                : 'Scanning paused'}
            </Text>
            
            <TouchableOpacity 
              style={[styles.scanButton, { backgroundColor: scanning ? theme.danger : theme.primary }]}
              onPress={toggleScanning}
            >
              <Text style={styles.scanButtonText}>
                {scanning ? 'Pause Scanning' : 'Resume Scanning'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.manualButton, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('AddFood')}
            >
              <Text style={[styles.manualButtonText, { color: theme.text }]}>Enter Manually</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Camera>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  flashButton: {
    padding: 5,
  },
  scanArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  instructions: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  scanButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 10,
  },
  scanButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  manualButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  manualButtonText: {
    fontWeight: '500',
    fontSize: 16,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BarcodeScannerScreen;