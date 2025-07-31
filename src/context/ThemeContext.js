import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define color schemes
const lightTheme = {
  primary: '#4A90E2', // Blue primary color
  secondary: '#50C878', // Emerald green
  background: '#F5F7FA',
  card: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666', // Added for secondary text
  border: '#E1E1E1',
  notification: '#FF6B6B',
  success: '#28A745',
  warning: '#FFC107',
  danger: '#DC3545',
  info: '#17A2B8', // Added for info color
  tabBarActive: '#4A90E2',
  tabBarInactive: '#8E8E93',
};

const darkTheme = {
  primary: '#5C9CE6', // Lighter blue for dark mode
  secondary: '#66D28E', // Lighter green for dark mode
  background: '#121212',
  card: '#1E1E1E',
  text: '#F5F5F5',
  textSecondary: '#BBBBBB', // Added for secondary text with better visibility in dark mode
  border: '#2C2C2C',
  notification: '#FF8585',
  success: '#4CD964',
  warning: '#FFCC00',
  danger: '#FF453A',
  info: '#5BC0DE', // Added for info color
  tabBarActive: '#5C9CE6',
  tabBarInactive: '#AAAAAA', // Lightened for better visibility
};

// Create the context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const deviceColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(deviceColorScheme === 'dark');
  
  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('themePreference');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    };
    
    loadThemePreference();
  }, []);
  
  // Save theme preference when it changes
  useEffect(() => {
    const saveThemePreference = async () => {
      try {
        await AsyncStorage.setItem('themePreference', isDarkMode ? 'dark' : 'light');
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    };
    
    saveThemePreference();
  }, [isDarkMode]);
  
  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };
  
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};