import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const WaterTrackerCard = () => {
  const { theme } = useTheme();
  const [waterIntake, setWaterIntake] = useState(0); // in ml
  const [waterGoal, setWaterGoal] = useState(2000); // default 2000ml (2L)
  const glassSize = 250; // ml per glass
  
  // Load water intake data when component mounts
  useEffect(() => {
    const loadWaterData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const waterKey = `waterIntake_${today}`;
        
        const savedWaterIntake = await AsyncStorage.getItem(waterKey);
        if (savedWaterIntake !== null) {
          setWaterIntake(parseInt(savedWaterIntake));
        } else {
          setWaterIntake(0);
        }
        
        // Load water goal from user settings
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          if (userData.waterGoal) {
            setWaterGoal(parseInt(userData.waterGoal));
          }
        }
      } catch (error) {
        console.error('Error loading water data:', error);
      }
    };
    
    loadWaterData();
    
    // Set up interval to refresh data every minute
    const intervalId = setInterval(loadWaterData, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const saveWaterIntake = async (newIntake) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const waterKey = `waterIntake_${today}`;
      
      await AsyncStorage.setItem(waterKey, newIntake.toString());
    } catch (error) {
      console.error('Error saving water intake:', error);
    }
  };
  
  const addWater = () => {
    const newIntake = waterIntake + glassSize;
    setWaterIntake(newIntake);
    saveWaterIntake(newIntake);
  };
  
  const removeWater = () => {
    if (waterIntake >= glassSize) {
      const newIntake = waterIntake - glassSize;
      setWaterIntake(newIntake);
      saveWaterIntake(newIntake);
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = Math.min((waterIntake / waterGoal) * 100, 100);
  
  // Calculate number of glasses
  const totalGlasses = Math.ceil(waterGoal / glassSize);
  const filledGlasses = Math.floor(waterIntake / glassSize);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="water" size={20} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]}>Water Intake</Text>
        </View>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {waterIntake} / {waterGoal} ml
        </Text>
      </View>
      
      <View style={[styles.progressBarContainer, { backgroundColor: theme.border }]}>
        <View 
          style={[
            styles.progressBar, 
            { 
              width: `${progressPercentage}%`,
              backgroundColor: theme.primary 
            }
          ]} 
        />
      </View>
      
      <View style={styles.glassesContainer}>
        {Array.from({ length: totalGlasses }).map((_, index) => (
          <Ionicons 
            key={index}
            name="water"
            size={24}
            color={index < filledGlasses ? theme.primary : theme.border}
            style={styles.glassIcon}
          />
        ))}
      </View>
      
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.danger }]}
          onPress={removeWater}
        >
          <Ionicons name="remove" size={20} color="white" />
        </TouchableOpacity>
        
        <View style={styles.glassInfo}>
          <Ionicons name="water" size={24} color={theme.primary} />
          <Text style={[styles.glassText, { color: theme.text }]}>{glassSize} ml</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={addWater}
        >
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 15,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  subtitle: {
    fontSize: 14,
  },
  progressBarContainer: {
    height: 10,
    borderRadius: 5,
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  glassesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  glassIcon: {
    marginRight: 5,
    marginBottom: 5,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  glassText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default WaterTrackerCard;