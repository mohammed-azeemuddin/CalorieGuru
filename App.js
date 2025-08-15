import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import FoodVaultScreen from './src/screens/FoodVaultScreen';
import FoodDetailScreen from './src/screens/FoodDetailScreen';
import IntakeTrackerScreen from './src/screens/IntakeTrackerScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AddFoodScreen from './src/screens/AddFoodScreen';
import MealPlannerScreen from './src/screens/MealPlannerScreen';
import ExerciseLogScreen from './src/screens/ExerciseLogScreen';
import BarcodeScannerScreen from './src/screens/BarcodeScannerScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import FeaturesScreen from './src/screens/FeaturesScreen';

// Import theme context
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeTabs() {
  const { theme, isDarkMode } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Food Vault') {
            iconName = focused ? 'fast-food' : 'fast-food-outline';
          } else if (route.name === 'Intake Tracker') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Features') {
            iconName = focused ? 'apps' : 'apps-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        headerShown: false,
        headerStyle: {
          backgroundColor: theme.card,
        },
        headerTintColor: theme.text,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Food Vault" component={FoodVaultScreen} />
      <Tab.Screen name="Intake Tracker" component={IntakeTrackerScreen} />
      <Tab.Screen name="Features" component={FeaturesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MainNavigator() {
  const { theme, isDarkMode } = useTheme();
  
  // Create custom navigation theme based on our theme colors
  const navigationTheme = {
    dark: isDarkMode,
    colors: {
      primary: theme.primary,
      background: theme.background,
      card: theme.card,
      text: theme.text,
      border: theme.border,
      notification: theme.notification,
    },
  };
  
  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack.Navigator>
        <Stack.Screen 
          name="Main" 
          component={HomeTabs} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="FoodDetail" 
          component={FoodDetailScreen} 
          options={{ 
            title: 'Food Details',
            headerStyle: {
              backgroundColor: theme.card,
            },
            headerTintColor: theme.text,
          }} 
        />
        <Stack.Screen 
          name="AddFood" 
          component={AddFoodScreen} 
          options={{ 
            title: 'Add Food',
            headerStyle: {
              backgroundColor: theme.card,
            },
            headerTintColor: theme.text,
          }} 
        />
        <Stack.Screen 
          name="MealPlanner" 
          component={MealPlannerScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ExerciseLog" 
          component={ExerciseLogScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="BarcodeScanner" 
          component={BarcodeScannerScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Notifications" 
          component={NotificationsScreen} 
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainNavigator />
    </ThemeProvider>
  );
}