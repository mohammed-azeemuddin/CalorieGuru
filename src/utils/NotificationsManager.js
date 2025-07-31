import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Notification types
export const NOTIFICATION_TYPES = {
  MEAL_REMINDER: 'meal_reminder',
  WATER_REMINDER: 'water_reminder',
  DAILY_SUMMARY: 'daily_summary',
  EXERCISE_REMINDER: 'exercise_reminder',
};

// Request permissions for notifications
export const requestNotificationsPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }
  
  return true;
};

// Schedule a meal reminder notification
export const scheduleMealReminder = async (mealType, hour, minute) => {
  const hasPermission = await requestNotificationsPermissions();
  if (!hasPermission) return null;
  
  // Cancel any existing notification for this meal type
  await cancelMealReminder(mealType);
  
  // Create notification content based on meal type
  let title = 'Meal Reminder';
  let body = 'Time to eat!';
  
  switch (mealType.toLowerCase()) {
    case 'breakfast':
      title = 'Breakfast Reminder';
      body = 'Time for breakfast! Start your day with a healthy meal.';
      break;
    case 'lunch':
      title = 'Lunch Reminder';
      body = 'Time for lunch! Don\'t forget to log your meal.';
      break;
    case 'dinner':
      title = 'Dinner Reminder';
      body = 'Time for dinner! Enjoy your evening meal.';
      break;
    case 'snack':
      title = 'Snack Reminder';
      body = 'Time for a healthy snack!';
      break;
  }
  
  // Schedule the notification to repeat daily
  const trigger = {
    hour,
    minute,
    repeats: true,
  };
  
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { type: NOTIFICATION_TYPES.MEAL_REMINDER, mealType },
    },
    trigger,
  });
  
  // Save the notification identifier for later management
  await saveNotificationIdentifier(NOTIFICATION_TYPES.MEAL_REMINDER, mealType, identifier);
  
  return identifier;
};

// Schedule a water intake reminder
export const scheduleWaterReminder = async (interval) => {
  const hasPermission = await requestNotificationsPermissions();
  if (!hasPermission) return null;
  
  // Cancel any existing water reminders
  await cancelWaterReminder();
  
  // Schedule the notification to repeat at the specified interval (in minutes)
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Water Reminder',
      body: 'Time to drink water! Stay hydrated throughout the day.',
      data: { type: NOTIFICATION_TYPES.WATER_REMINDER },
    },
    trigger: {
      seconds: interval * 60, // Convert minutes to seconds
      repeats: true,
    },
  });
  
  // Save the notification identifier
  await saveNotificationIdentifier(NOTIFICATION_TYPES.WATER_REMINDER, 'water', identifier);
  
  return identifier;
};

// Schedule a daily progress summary notification
export const scheduleDailySummary = async (hour, minute) => {
  const hasPermission = await requestNotificationsPermissions();
  if (!hasPermission) return null;
  
  // Cancel any existing daily summary notification
  await cancelDailySummary();
  
  // Schedule the notification to repeat daily
  const trigger = {
    hour,
    minute,
    repeats: true,
  };
  
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Daily Summary',
      body: 'Check out your nutrition and activity summary for today!',
      data: { type: NOTIFICATION_TYPES.DAILY_SUMMARY },
    },
    trigger,
  });
  
  // Save the notification identifier
  await saveNotificationIdentifier(NOTIFICATION_TYPES.DAILY_SUMMARY, 'summary', identifier);
  
  return identifier;
};

// Schedule an exercise reminder
export const scheduleExerciseReminder = async (days, hour, minute) => {
  const hasPermission = await requestNotificationsPermissions();
  if (!hasPermission) return null;
  
  // Cancel any existing exercise reminders
  await cancelExerciseReminder();
  
  // Create an array of identifiers for each day
  const identifiers = [];
  
  // Schedule a notification for each selected day
  // days is an array of weekday indices (0 = Sunday, 1 = Monday, etc.)
  for (const weekday of days) {
    const trigger = {
      weekday, // 1-7 representing Monday-Sunday
      hour,
      minute,
      repeats: true,
    };
    
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Exercise Reminder',
        body: 'Time for your workout! Stay active and healthy.',
        data: { type: NOTIFICATION_TYPES.EXERCISE_REMINDER, weekday },
      },
      trigger,
    });
    
    identifiers.push(identifier);
  }
  
  // Save all identifiers
  await saveNotificationIdentifier(NOTIFICATION_TYPES.EXERCISE_REMINDER, 'exercise', identifiers);
  
  return identifiers;
};

// Cancel a meal reminder notification
export const cancelMealReminder = async (mealType) => {
  const identifiers = await getNotificationIdentifiers(NOTIFICATION_TYPES.MEAL_REMINDER, mealType);
  
  if (identifiers) {
    if (Array.isArray(identifiers)) {
      for (const id of identifiers) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
    } else {
      await Notifications.cancelScheduledNotificationAsync(identifiers);
    }
    
    await removeNotificationIdentifier(NOTIFICATION_TYPES.MEAL_REMINDER, mealType);
  }
};

// Cancel water reminder notifications
export const cancelWaterReminder = async () => {
  const identifiers = await getNotificationIdentifiers(NOTIFICATION_TYPES.WATER_REMINDER, 'water');
  
  if (identifiers) {
    if (Array.isArray(identifiers)) {
      for (const id of identifiers) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
    } else {
      await Notifications.cancelScheduledNotificationAsync(identifiers);
    }
    
    await removeNotificationIdentifier(NOTIFICATION_TYPES.WATER_REMINDER, 'water');
  }
};

// Cancel daily summary notification
export const cancelDailySummary = async () => {
  const identifiers = await getNotificationIdentifiers(NOTIFICATION_TYPES.DAILY_SUMMARY, 'summary');
  
  if (identifiers) {
    if (Array.isArray(identifiers)) {
      for (const id of identifiers) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
    } else {
      await Notifications.cancelScheduledNotificationAsync(identifiers);
    }
    
    await removeNotificationIdentifier(NOTIFICATION_TYPES.DAILY_SUMMARY, 'summary');
  }
};

// Cancel exercise reminder notifications
export const cancelExerciseReminder = async () => {
  const identifiers = await getNotificationIdentifiers(NOTIFICATION_TYPES.EXERCISE_REMINDER, 'exercise');
  
  if (identifiers) {
    if (Array.isArray(identifiers)) {
      for (const id of identifiers) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
    } else {
      await Notifications.cancelScheduledNotificationAsync(identifiers);
    }
    
    await removeNotificationIdentifier(NOTIFICATION_TYPES.EXERCISE_REMINDER, 'exercise');
  }
};

// Cancel all notifications
export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.removeItem('notificationIdentifiers');
};

// Helper function to save notification identifiers
const saveNotificationIdentifier = async (type, key, identifier) => {
  try {
    // Get existing identifiers
    const identifiersString = await AsyncStorage.getItem('notificationIdentifiers');
    let identifiers = {};
    
    if (identifiersString) {
      identifiers = JSON.parse(identifiersString);
    }
    
    // Add or update the identifier
    if (!identifiers[type]) {
      identifiers[type] = {};
    }
    
    identifiers[type][key] = identifier;
    
    // Save updated identifiers
    await AsyncStorage.setItem('notificationIdentifiers', JSON.stringify(identifiers));
  } catch (error) {
    console.error('Error saving notification identifier:', error);
  }
};

// Helper function to get notification identifiers
const getNotificationIdentifiers = async (type, key) => {
  try {
    const identifiersString = await AsyncStorage.getItem('notificationIdentifiers');
    
    if (identifiersString) {
      const identifiers = JSON.parse(identifiersString);
      
      if (identifiers[type] && identifiers[type][key]) {
        return identifiers[type][key];
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting notification identifiers:', error);
    return null;
  }
};

// Helper function to remove notification identifiers
const removeNotificationIdentifier = async (type, key) => {
  try {
    const identifiersString = await AsyncStorage.getItem('notificationIdentifiers');
    
    if (identifiersString) {
      const identifiers = JSON.parse(identifiersString);
      
      if (identifiers[type] && identifiers[type][key]) {
        delete identifiers[type][key];
        
        // If no more keys in this type, remove the type
        if (Object.keys(identifiers[type]).length === 0) {
          delete identifiers[type];
        }
        
        await AsyncStorage.setItem('notificationIdentifiers', JSON.stringify(identifiers));
      }
    }
  } catch (error) {
    console.error('Error removing notification identifier:', error);
  }
};

// Get all active notifications
export const getActiveNotifications = async () => {
  try {
    const identifiersString = await AsyncStorage.getItem('notificationIdentifiers');
    
    if (identifiersString) {
      return JSON.parse(identifiersString);
    }
    
    return {};
  } catch (error) {
    console.error('Error getting active notifications:', error);
    return {};
  }
};