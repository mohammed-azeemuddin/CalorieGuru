import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const FeaturesScreen = ({ navigation }) => {
  const { theme } = useTheme();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        <View style={styles.contentContainer}>
          <Text style={[styles.screenTitle, { color: theme.text }]}>Features</Text>
          
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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

export default FeaturesScreen;