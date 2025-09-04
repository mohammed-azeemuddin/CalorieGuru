import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const DiaryEntryItem = memo(({ entry, onPress, onDelete }) => {
  const { theme } = useTheme();
  // Format timestamp to display time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    return `${hours}:${formattedMinutes} ${ampm}`;
  };

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: theme.card }]} onPress={onPress}>
      <View style={styles.timeContainer}>
        <Text style={[styles.timeText, { color: theme.textSecondary }]}>{entry.timestamp ? formatTime(entry.timestamp) : 'N/A'}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={[styles.foodName, { color: theme.text }]}>{entry.name}</Text>
        <Text style={[styles.servingInfo, { color: theme.textSecondary }]}>
          {entry.quantity > 1 ? `${entry.quantity} servings` : '1 serving'} • {entry.servingSize}
        </Text>
      </View>
      
      <View style={styles.nutritionContainer}>
        <Text style={[styles.calories, { color: theme.primary }]}>{entry.calories} cal</Text>
        <View style={styles.macrosContainer}>
          <Text style={[styles.macroText, { color: theme.textSecondary }]}>P: {entry.protein}g</Text>
          <Text style={[styles.macroText, { color: theme.textSecondary }]}>C: {entry.carbs}g</Text>
          <Text style={[styles.macroText, { color: theme.textSecondary }]}>F: {entry.fat}g</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Ionicons name="trash-outline" size={20} color={theme.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Custom equality check to prevent unnecessary re-renders
  return (
    prevProps.entry.id === nextProps.entry.id &&
    prevProps.entry.calories === nextProps.entry.calories &&
    prevProps.entry.quantity === nextProps.entry.quantity
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  timeContainer: {
    width: 60,
    marginRight: 10,
  },
  timeText: {
    fontSize: 14,
  },
  infoContainer: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
  },
  servingInfo: {
    fontSize: 12,
    marginTop: 2,
  },
  nutritionContainer: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  calories: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  macrosContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  macroText: {
    fontSize: 12,
    marginLeft: 8,
  },
  deleteButton: {
    padding: 5,
  },
});

export default DiaryEntryItem;