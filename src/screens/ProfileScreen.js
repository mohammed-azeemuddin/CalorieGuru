import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import ThemeToggleButton from '../components/ThemeToggleButton';

const ProfileScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [userData, setUserData] = useState({
    name: '',
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    activityLevel: 'moderate',
    calorieGoal: '2000',
  });
  
  // Load user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const parsedUserData = JSON.parse(userDataString);
          setUserData({
            ...userData,
            ...parsedUserData,
            // Convert numbers to strings for TextInput
            age: parsedUserData.age ? parsedUserData.age.toString() : '',
            weight: parsedUserData.weight ? parsedUserData.weight.toString() : '',
            height: parsedUserData.height ? parsedUserData.height.toString() : '',
            calorieGoal: parsedUserData.calorieGoal ? parsedUserData.calorieGoal.toString() : '2000',
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, []);
  
  const handleInputChange = (field, value) => {
    setUserData({
      ...userData,
      [field]: value
    });
  };
  
  const handleGenderSelect = (gender) => {
    setUserData({
      ...userData,
      gender
    });
  };
  
  const handleActivityLevelSelect = (activityLevel) => {
    setUserData({
      ...userData,
      activityLevel
    });
  };
  
  const calculateRecommendedCalories = () => {
    // Check if required fields are filled
    if (!userData.age || !userData.weight || !userData.height) {
      Alert.alert('Missing Information', 'Please fill in your age, weight, and height to calculate recommended calories');
      return;
    }
    
    const age = parseInt(userData.age);
    const weight = parseInt(userData.weight);
    const height = parseInt(userData.height);
    const gender = userData.gender;
    const activityLevel = userData.activityLevel;
    
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    // Apply activity multiplier
    let activityMultiplier;
    switch (activityLevel) {
      case 'sedentary':
        activityMultiplier = 1.2;
        break;
      case 'light':
        activityMultiplier = 1.375;
        break;
      case 'moderate':
        activityMultiplier = 1.55;
        break;
      case 'active':
        activityMultiplier = 1.725;
        break;
      case 'veryActive':
        activityMultiplier = 1.9;
        break;
      default:
        activityMultiplier = 1.55; // Default to moderate
    }
    
    const recommendedCalories = Math.round(bmr * activityMultiplier);
    
    // Update calorie goal
    setUserData({
      ...userData,
      calorieGoal: recommendedCalories.toString()
    });
  };
  
  const saveUserData = async () => {
    try {
      // Convert string values to numbers where appropriate
      const dataToSave = {
        ...userData,
        age: userData.age ? parseInt(userData.age) : null,
        weight: userData.weight ? parseInt(userData.weight) : null,
        height: userData.height ? parseInt(userData.height) : null,
        calorieGoal: userData.calorieGoal ? parseInt(userData.calorieGoal) : 2000,
      };
      
      await AsyncStorage.setItem('userData', JSON.stringify(dataToSave));
      Alert.alert('Success', 'Your profile has been saved');
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Error', 'Failed to save your profile');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <Text style={styles.headerTitle}>Your Profile</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Personal Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Name</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
              placeholder="Enter your name"
              placeholderTextColor={theme.textSecondary}
              value={userData.name}
              onChangeText={(text) => handleInputChange('name', text)}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Age</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
              placeholder="Enter your age"
              placeholderTextColor={theme.textSecondary}
              value={userData.age}
              onChangeText={(text) => handleInputChange('age', text)}
              keyboardType="number-pad"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Gender</Text>
            <View style={styles.genderContainer}>
            <TouchableOpacity 
              style={[
                styles.genderButton, 
                { backgroundColor: theme.card, borderColor: theme.border },
                userData.gender === 'male' && [styles.selectedGender, { backgroundColor: theme.primary, borderColor: theme.primary }]
              ]}
              onPress={() => handleGenderSelect('male')}
            >
              <Text style={[
                styles.genderText, 
                { color: theme.text },
                userData.gender === 'male' && styles.selectedGenderText
              ]}>Male</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.genderButton, 
                { backgroundColor: theme.card, borderColor: theme.border },
                userData.gender === 'female' && [styles.selectedGender, { backgroundColor: theme.primary, borderColor: theme.primary }]
              ]}
              onPress={() => handleGenderSelect('female')}
            >
              <Text style={[
                styles.genderText, 
                { color: theme.text },
                userData.gender === 'female' && styles.selectedGenderText
              ]}>Female</Text>
            </TouchableOpacity>
          </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Weight (kg)</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
              placeholder="Enter your weight in kg"
              placeholderTextColor={theme.textSecondary}
              value={userData.weight}
              onChangeText={(text) => handleInputChange('weight', text)}
              keyboardType="number-pad"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Height (cm)</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
              placeholder="Enter your height in cm"
              placeholderTextColor={theme.textSecondary}
              value={userData.height}
              onChangeText={(text) => handleInputChange('height', text)}
              keyboardType="number-pad"
            />
          </View>
          
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Activity Level</Text>
          
          <View style={styles.activityContainer}>
            {[
              { id: 'sedentary', label: 'Sedentary (little or no exercise)' },
              { id: 'light', label: 'Light (exercise 1-3 times/week)' },
              { id: 'moderate', label: 'Moderate (exercise 3-5 times/week)' },
              { id: 'active', label: 'Active (exercise 6-7 times/week)' },
              { id: 'veryActive', label: 'Very Active (hard exercise daily)' },
            ].map((activity) => (
              <TouchableOpacity 
                key={activity.id}
                style={[
                  styles.activityButton, 
                  { backgroundColor: theme.card, borderColor: theme.border },
                  userData.activityLevel === activity.id && [styles.selectedActivity, { backgroundColor: theme.primary, borderColor: theme.primary }]
                ]}
                onPress={() => handleActivityLevelSelect(activity.id)}
              >
                <Text style={[
                  styles.activityText, 
                  { color: theme.text },
                  userData.activityLevel === activity.id && styles.selectedActivityText
                ]}>
                  {activity.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={[styles.calculateButton, { backgroundColor: theme.success }]}
            onPress={calculateRecommendedCalories}
          >
            <Text style={styles.calculateButtonText}>Calculate Recommended Calories</Text>
          </TouchableOpacity>
          
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Calorie Goal</Text>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Daily Calorie Goal</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
              placeholder="Enter your daily calorie goal"
              placeholderTextColor={theme.textSecondary}
              value={userData.calorieGoal}
              onChangeText={(text) => handleInputChange('calorieGoal', text)}
              keyboardType="number-pad"
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={saveUserData}
          >
            <Text style={styles.saveButtonText}>Save Profile</Text>
          </TouchableOpacity>
          
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Features</Text>
          
          <View style={styles.featuresContainer}>
            <TouchableOpacity 
              style={[styles.featureButton, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => navigation.navigate('MealPlanner')}
            >
              <Ionicons name="restaurant" size={24} color={theme.primary} />
              <Text style={[styles.featureButtonText, { color: theme.text }]}>Meal Planner</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.featureButton, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => navigation.navigate('ExerciseLog')}
            >
              <Ionicons name="fitness" size={24} color={theme.primary} />
              <Text style={[styles.featureButtonText, { color: theme.text }]}>Exercise Log</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.featureButton, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => navigation.navigate('BarcodeScanner')}
            >
              <Ionicons name="barcode" size={24} color={theme.primary} />
              <Text style={[styles.featureButtonText, { color: theme.text }]}>Barcode Scanner</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.featureButton, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications" size={24} color={theme.primary} />
              <Text style={[styles.featureButtonText, { color: theme.text }]}>Notifications</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.themeToggleContainer}>
            <ThemeToggleButton />
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
  formContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
  },
  selectedGender: {
  },
  genderText: {
    fontSize: 16,
  },
  selectedGenderText: {
    color: 'white',
    fontWeight: 'bold',
  },
  activityContainer: {
    marginBottom: 15,
  },
  activityButton: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  selectedActivity: {
  },
  activityText: {
    fontSize: 16,
  },
  selectedActivityText: {
    color: 'white',
    fontWeight: 'bold',
  },
  calculateButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginVertical: 15,
  },
  calculateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButton: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  themeToggleContainer: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  featuresContainer: {
    marginVertical: 10,
  },
  featureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
  },
  featureButtonText: {
    fontSize: 16,
    marginLeft: 10,
  },
});

export default ProfileScreen;