import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

// Exercise types with their MET values (Metabolic Equivalent of Task)
// MET values are used to calculate calories burned
const EXERCISE_TYPES = [
  { id: '1', name: 'Walking', icon: 'walk', met: 3.5 },
  { id: '2', name: 'Running', icon: 'bicycle', met: 8.0 },
  { id: '3', name: 'Cycling', icon: 'bicycle', met: 6.0 },
  { id: '4', name: 'Swimming', icon: 'water', met: 6.0 },
  { id: '5', name: 'Yoga', icon: 'body', met: 3.0 },
  { id: '6', name: 'Weight Training', icon: 'barbell', met: 5.0 },
  { id: '7', name: 'Dancing', icon: 'musical-notes', met: 4.5 },
  { id: '8', name: 'Hiking', icon: 'trail-sign', met: 5.3 },
  { id: '9', name: 'Cricket', icon: 'baseball', met: 5.0 },
  { id: '10', name: 'Badminton', icon: 'tennisball', met: 5.5 },
  { id: '11', name: 'Household Chores', icon: 'home', met: 3.0 },
  { id: '12', name: 'Gardening', icon: 'leaf', met: 3.8 },
];

const ExerciseLogScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [exercises, setExercises] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [duration, setDuration] = useState('');
  const [userWeight, setUserWeight] = useState(70); // Default weight in kg
  
  // Load exercises for the selected date and user weight
  useEffect(() => {
    const loadExercises = async () => {
      try {
        const dateString = selectedDate.toISOString().split('T')[0];
        const exercisesKey = `exercises_${dateString}`;
        
        const exercisesString = await AsyncStorage.getItem(exercisesKey);
        
        if (exercisesString) {
          setExercises(JSON.parse(exercisesString));
        } else {
          setExercises([]);
        }
        
        // Load user weight from profile
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          if (userData.weight) {
            setUserWeight(parseFloat(userData.weight));
          }
        }
      } catch (error) {
        console.error('Error loading exercises:', error);
      }
    };
    
    loadExercises();
  }, [selectedDate]);
  
  const saveExercises = async (updatedExercises) => {
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      const exercisesKey = `exercises_${dateString}`;
      
      await AsyncStorage.setItem(exercisesKey, JSON.stringify(updatedExercises));
      setExercises(updatedExercises);
      
      // Update daily calorie allowance based on exercise
      updateCalorieAllowance(updatedExercises);
    } catch (error) {
      console.error('Error saving exercises:', error);
    }
  };
  
  const updateCalorieAllowance = async (exerciseList) => {
    try {
      // Calculate total calories burned
      const totalCaloriesBurned = exerciseList.reduce((total, exercise) => {
        return total + exercise.caloriesBurned;
      }, 0);
      
      // Store the calories burned for the day
      const dateString = selectedDate.toISOString().split('T')[0];
      const caloriesBurnedKey = `caloriesBurned_${dateString}`;
      await AsyncStorage.setItem(caloriesBurnedKey, totalCaloriesBurned.toString());
    } catch (error) {
      console.error('Error updating calorie allowance:', error);
    }
  };
  
  const addExercise = () => {
    if (!selectedExercise) {
      Alert.alert('Error', 'Please select an exercise type');
      return;
    }
    
    if (!duration || isNaN(duration) || parseInt(duration) <= 0) {
      Alert.alert('Error', 'Please enter a valid duration in minutes');
      return;
    }
    
    const durationMinutes = parseInt(duration);
    
    // Calculate calories burned using MET formula
    // Calories = MET × weight (kg) × duration (hours)
    const durationHours = durationMinutes / 60;
    const caloriesBurned = Math.round(selectedExercise.met * userWeight * durationHours);
    
    const newExercise = {
      id: Date.now().toString(),
      type: selectedExercise.name,
      icon: selectedExercise.icon,
      duration: durationMinutes,
      caloriesBurned,
      timestamp: new Date().toISOString(),
    };
    
    const updatedExercises = [...exercises, newExercise];
    saveExercises(updatedExercises);
    
    // Reset form and close modal
    setSelectedExercise(null);
    setDuration('');
    setModalVisible(false);
  };
  
  const deleteExercise = (exerciseId) => {
    Alert.alert(
      'Delete Exercise',
      'Are you sure you want to delete this exercise?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const updatedExercises = exercises.filter(exercise => exercise.id !== exerciseId);
            saveExercises(updatedExercises);
          }
        },
      ]
    );
  };
  
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };
  
  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };
  
  const goToToday = () => {
    setSelectedDate(new Date());
  };
  
  const formatDate = (date) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };
  
  // Calculate total calories burned for the day
  const totalCaloriesBurned = exercises.reduce((total, exercise) => {
    return total + exercise.caloriesBurned;
  }, 0);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Date Selector */}
      <View style={styles.dateSelector}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.dateSelectorCenter}>
          <TouchableOpacity onPress={goToPreviousDay} style={styles.dateNavButton}>
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={goToToday} style={styles.dateContainer}>
            <Text style={[styles.dateText, { color: theme.text }]}>
              {formatDate(selectedDate)}
            </Text>
            {isToday(selectedDate) && (
              <Text style={[styles.todayText, { color: theme.primary }]}>Today</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={goToNextDay} style={styles.dateNavButton}>
            <Ionicons name="chevron-forward" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.spacer} />
      </View>
      
      {/* Summary Card */}
      <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
        <View style={styles.summaryContent}>
          <View style={styles.summaryIconContainer}>
            <Ionicons name="flame" size={36} color={theme.primary} />
          </View>
          <View style={styles.summaryTextContainer}>
            <Text style={[styles.summaryValue, { color: theme.primary }]}>
              {totalCaloriesBurned}
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Calories Burned
            </Text>
          </View>
        </View>
      </View>
      
      {/* Exercise List */}
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.exerciseItem, { backgroundColor: theme.card }]}>
            <View style={styles.exerciseIconContainer}>
              <Ionicons name={item.icon} size={24} color={theme.primary} />
            </View>
            <View style={styles.exerciseDetails}>
              <Text style={[styles.exerciseType, { color: theme.text }]}>{item.type}</Text>
              <Text style={[styles.exerciseDuration, { color: theme.textSecondary }]}>
                {item.duration} minutes
              </Text>
            </View>
            <View style={styles.exerciseCalories}>
              <Text style={[styles.caloriesValue, { color: theme.primary }]}>
                {item.caloriesBurned}
              </Text>
              <Text style={[styles.caloriesLabel, { color: theme.textSecondary }]}>cal</Text>
            </View>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => deleteExercise(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color={theme.danger} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No exercises logged for this day
            </Text>
          </View>
        }
      />
      
      {/* Add Exercise Button */}
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
      
      {/* Add Exercise Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Add Exercise</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.inputLabel, { color: theme.text }]}>Exercise Type</Text>
            <View style={styles.exerciseTypeGrid}>
              {EXERCISE_TYPES.map((exercise) => (
                <TouchableOpacity
                  key={exercise.id}
                  style={[
                    styles.exerciseTypeItem,
                    selectedExercise?.id === exercise.id && { backgroundColor: theme.primaryLight },
                    { borderColor: theme.border }
                  ]}
                  onPress={() => setSelectedExercise(exercise)}
                >
                  <Ionicons 
                    name={exercise.icon} 
                    size={24} 
                    color={selectedExercise?.id === exercise.id ? theme.primary : theme.textSecondary} 
                  />
                  <Text 
                    style={[
                      styles.exerciseTypeName,
                      { color: selectedExercise?.id === exercise.id ? theme.primary : theme.text }
                    ]}
                  >
                    {exercise.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={[styles.inputLabel, { color: theme.text }]}>Duration (minutes)</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
              placeholder="Enter duration"
              placeholderTextColor={theme.textSecondary}
            />
            
            <TouchableOpacity 
              style={[styles.addExerciseButton, { backgroundColor: theme.primary }]}
              onPress={addExercise}
            >
              <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  dateSelectorCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 5,
  },
  spacer: {
    width: 24, // Same width as the back button icon
  },
  dateNavButton: {
    padding: 5,
  },
  dateContainer: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  todayText: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryCard: {
    margin: 15,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIconContainer: {
    marginRight: 15,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 14,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  exerciseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseType: {
    fontSize: 16,
    fontWeight: '500',
  },
  exerciseDuration: {
    fontSize: 14,
  },
  exerciseCalories: {
    alignItems: 'center',
    marginRight: 10,
  },
  caloriesValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  caloriesLabel: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  exerciseTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  exerciseTypeItem: {
    width: '30%',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    margin: '1.5%',
    alignItems: 'center',
  },
  exerciseTypeName: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  addExerciseButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addExerciseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ExerciseLogScreen;