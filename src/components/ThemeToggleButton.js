import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ThemeToggleButton = () => {
  const { isDarkMode, toggleTheme, theme } = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: theme.card }]} 
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <View style={styles.buttonContent}>
        <Ionicons 
          name={isDarkMode ? 'sunny' : 'moon'} 
          size={20} 
          color={theme.primary} 
        />
        <Text style={[styles.buttonText, { color: theme.text }]}>
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginVertical: 10,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default ThemeToggleButton;