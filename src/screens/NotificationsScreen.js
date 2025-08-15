import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import {
  requestNotificationsPermissions,
  scheduleMealReminder,
  scheduleWaterReminder,
  scheduleDailySummary,
  scheduleExerciseReminder,
  cancelMealReminder,
  cancelWaterReminder,
  cancelDailySummary,
  cancelExerciseReminder,
  getActiveNotifications,
} from '../utils/NotificationsManager';

const NotificationsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [hasPermission, setHasPermission] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    mealReminders: {
      enabled: false,
      breakfast: { enabled: false, time: new Date(new Date().setHours(8, 0, 0, 0)) },
      lunch: { enabled: false, time: new Date(new Date().setHours(13, 0, 0, 0)) },
      dinner: { enabled: false, time: new Date(new Date().setHours(19, 0, 0, 0)) },
      snack: { enabled: false, time: new Date(new Date().setHours(16, 0, 0, 0)) },
    },
    waterReminders: {
      enabled: false,
      interval: 60, // minutes
    },
    dailySummary: {
      enabled: false,
      time: new Date(new Date().setHours(21, 0, 0, 0)),
    },
    exerciseReminders: {
      enabled: false,
      days: [1, 3, 5], // Monday, Wednesday, Friday
      time: new Date(new Date().setHours(18, 0, 0, 0)),
    },
  });
  
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentTimePickerFor, setCurrentTimePickerFor] = useState(null);
  
  // Check notification permissions and load saved settings
  useEffect(() => {
    const checkPermissionsAndLoadSettings = async () => {
      const permissionGranted = await requestNotificationsPermissions();
      setHasPermission(permissionGranted);
      
      if (permissionGranted) {
        await loadNotificationSettings();
      }
    };
    
    checkPermissionsAndLoadSettings();
  }, []);
  
  const loadNotificationSettings = async () => {
    try {
      // Load saved notification settings
      const settingsString = await AsyncStorage.getItem('notificationSettings');
      
      if (settingsString) {
        const savedSettings = JSON.parse(settingsString);
        
        // Convert time strings back to Date objects
        if (savedSettings.mealReminders) {
          for (const meal of Object.keys(savedSettings.mealReminders)) {
            if (meal !== 'enabled' && savedSettings.mealReminders[meal].time) {
              savedSettings.mealReminders[meal].time = new Date(savedSettings.mealReminders[meal].time);
            }
          }
        }
        
        if (savedSettings.dailySummary && savedSettings.dailySummary.time) {
          savedSettings.dailySummary.time = new Date(savedSettings.dailySummary.time);
        }
        
        if (savedSettings.exerciseReminders && savedSettings.exerciseReminders.time) {
          savedSettings.exerciseReminders.time = new Date(savedSettings.exerciseReminders.time);
        }
        
        setNotificationSettings(savedSettings);
      }
      
      // Check active notifications to update UI
      const activeNotifications = await getActiveNotifications();
      console.log('Active notifications:', activeNotifications);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };
  
  const saveNotificationSettings = async (settings) => {
    try {
      // Convert Date objects to strings for storage
      const settingsToSave = JSON.parse(JSON.stringify(settings));
      
      if (settingsToSave.mealReminders) {
        for (const meal of Object.keys(settingsToSave.mealReminders)) {
          if (meal !== 'enabled' && settingsToSave.mealReminders[meal].time) {
            settingsToSave.mealReminders[meal].time = settingsToSave.mealReminders[meal].time.toISOString();
          }
        }
      }
      
      if (settingsToSave.dailySummary && settingsToSave.dailySummary.time) {
        settingsToSave.dailySummary.time = settingsToSave.dailySummary.time.toISOString();
      }
      
      if (settingsToSave.exerciseReminders && settingsToSave.exerciseReminders.time) {
        settingsToSave.exerciseReminders.time = settingsToSave.exerciseReminders.time.toISOString();
      }
      
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settingsToSave));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };
  
  const toggleMealReminders = async (value) => {
    const updatedSettings = { ...notificationSettings };
    updatedSettings.mealReminders.enabled = value;
    
    // If turning off, cancel all meal reminders
    if (!value) {
      await cancelMealReminder('breakfast');
      await cancelMealReminder('lunch');
      await cancelMealReminder('dinner');
      await cancelMealReminder('snack');
      
      // Also disable individual meal toggles
      updatedSettings.mealReminders.breakfast.enabled = false;
      updatedSettings.mealReminders.lunch.enabled = false;
      updatedSettings.mealReminders.dinner.enabled = false;
      updatedSettings.mealReminders.snack.enabled = false;
    }
    
    setNotificationSettings(updatedSettings);
    await saveNotificationSettings(updatedSettings);
  };
  
  const toggleMealReminder = async (meal, value) => {
    const updatedSettings = { ...notificationSettings };
    updatedSettings.mealReminders[meal].enabled = value;
    
    // Schedule or cancel the specific meal reminder
    if (value) {
      const time = updatedSettings.mealReminders[meal].time;
      await scheduleMealReminder(meal, time.getHours(), time.getMinutes());
    } else {
      await cancelMealReminder(meal);
    }
    
    setNotificationSettings(updatedSettings);
    await saveNotificationSettings(updatedSettings);
  };
  
  const toggleWaterReminders = async (value) => {
    const updatedSettings = { ...notificationSettings };
    updatedSettings.waterReminders.enabled = value;
    
    // Schedule or cancel water reminders
    if (value) {
      await scheduleWaterReminder(updatedSettings.waterReminders.interval);
    } else {
      await cancelWaterReminder();
    }
    
    setNotificationSettings(updatedSettings);
    await saveNotificationSettings(updatedSettings);
  };
  
  const updateWaterInterval = async (interval) => {
    const updatedSettings = { ...notificationSettings };
    updatedSettings.waterReminders.interval = interval;
    
    // If enabled, reschedule with new interval
    if (updatedSettings.waterReminders.enabled) {
      await cancelWaterReminder();
      await scheduleWaterReminder(interval);
    }
    
    setNotificationSettings(updatedSettings);
    await saveNotificationSettings(updatedSettings);
  };
  
  const toggleDailySummary = async (value) => {
    const updatedSettings = { ...notificationSettings };
    updatedSettings.dailySummary.enabled = value;
    
    // Schedule or cancel daily summary
    if (value) {
      const time = updatedSettings.dailySummary.time;
      await scheduleDailySummary(time.getHours(), time.getMinutes());
    } else {
      await cancelDailySummary();
    }
    
    setNotificationSettings(updatedSettings);
    await saveNotificationSettings(updatedSettings);
  };
  
  const toggleExerciseReminders = async (value) => {
    const updatedSettings = { ...notificationSettings };
    updatedSettings.exerciseReminders.enabled = value;
    
    // Schedule or cancel exercise reminders
    if (value) {
      const { days, time } = updatedSettings.exerciseReminders;
      await scheduleExerciseReminder(days, time.getHours(), time.getMinutes());
    } else {
      await cancelExerciseReminder();
    }
    
    setNotificationSettings(updatedSettings);
    await saveNotificationSettings(updatedSettings);
  };
  
  const toggleExerciseDay = async (day) => {
    const updatedSettings = { ...notificationSettings };
    const currentDays = [...updatedSettings.exerciseReminders.days];
    
    // Toggle the day
    if (currentDays.includes(day)) {
      updatedSettings.exerciseReminders.days = currentDays.filter(d => d !== day);
    } else {
      updatedSettings.exerciseReminders.days = [...currentDays, day].sort();
    }
    
    // If enabled, reschedule with new days
    if (updatedSettings.exerciseReminders.enabled) {
      await cancelExerciseReminder();
      const { days, time } = updatedSettings.exerciseReminders;
      await scheduleExerciseReminder(days, time.getHours(), time.getMinutes());
    }
    
    setNotificationSettings(updatedSettings);
    await saveNotificationSettings(updatedSettings);
  };
  
  const showTimePickerFor = (type, meal = null) => {
    setCurrentTimePickerFor({ type, meal });
    setShowTimePicker(true);
  };
  
  const handleTimeChange = async (event, selectedTime) => {
    setShowTimePicker(false);
    
    if (selectedTime && currentTimePickerFor) {
      const { type, meal } = currentTimePickerFor;
      const updatedSettings = { ...notificationSettings };
      
      if (type === 'meal' && meal) {
        updatedSettings.mealReminders[meal].time = selectedTime;
        
        // If this meal reminder is enabled, reschedule it
        if (updatedSettings.mealReminders.enabled && updatedSettings.mealReminders[meal].enabled) {
          await cancelMealReminder(meal);
          await scheduleMealReminder(meal, selectedTime.getHours(), selectedTime.getMinutes());
        }
      } else if (type === 'dailySummary') {
        updatedSettings.dailySummary.time = selectedTime;
        
        // If daily summary is enabled, reschedule it
        if (updatedSettings.dailySummary.enabled) {
          await cancelDailySummary();
          await scheduleDailySummary(selectedTime.getHours(), selectedTime.getMinutes());
        }
      } else if (type === 'exercise') {
        updatedSettings.exerciseReminders.time = selectedTime;
        
        // If exercise reminders are enabled, reschedule them
        if (updatedSettings.exerciseReminders.enabled) {
          await cancelExerciseReminder();
          const { days } = updatedSettings.exerciseReminders;
          await scheduleExerciseReminder(days, selectedTime.getHours(), selectedTime.getMinutes());
        }
      }
      
      setNotificationSettings(updatedSettings);
      await saveNotificationSettings(updatedSettings);
    }
    
    setCurrentTimePickerFor(null);
  };
  
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getDayName = (day) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day];
  };
  
  if (!hasPermission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding: 15}}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{paddingRight:8}}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={{fontSize:18, fontWeight:'bold', color: theme.text}}>Notifications</Text>
          <View style={{width:24}} />
        </View>
        <View style={[styles.permissionContainer, { backgroundColor: theme.card }]}>
          <Ionicons name="notifications-off" size={48} color={theme.textSecondary} />
          <Text style={[styles.permissionTitle, { color: theme.text }]}>
            Notification Permission Required
          </Text>
          <Text style={[styles.permissionText, { color: theme.textSecondary }]}>
            Please enable notifications in your device settings to use this feature.
          </Text>
          <TouchableOpacity 
            style={[styles.permissionButton, { backgroundColor: theme.primary }]}
            onPress={async () => {
              const granted = await requestNotificationsPermissions();
              setHasPermission(granted);
            }}
          >
            <Text style={styles.permissionButtonText}>Request Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding: 15}}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{paddingRight:8}}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={{fontSize:18, fontWeight:'bold', color: theme.text}}>Notifications</Text>
        <View style={{width:24}} />
      </View>
      <ScrollView>
        {/* Meal Reminders Section */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="restaurant" size={24} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Meal Reminders</Text>
            </View>
            <Switch
              value={notificationSettings.mealReminders.enabled}
              onValueChange={toggleMealReminders}
              trackColor={{ false: theme.border, true: theme.primaryLight }}
              thumbColor={notificationSettings.mealReminders.enabled ? theme.primary : '#f4f3f4'}
            />
          </View>
          
          {notificationSettings.mealReminders.enabled && (
            <View style={styles.sectionContent}>
              <View style={styles.reminderItem}>
                <View style={styles.reminderInfo}>
                  <Text style={[styles.reminderTitle, { color: theme.text }]}>Breakfast</Text>
                  <TouchableOpacity 
                    onPress={() => showTimePickerFor('meal', 'breakfast')}
                    style={styles.timeSelector}
                  >
                    <Text style={[styles.timeText, { color: theme.primary }]}>
                      {formatTime(notificationSettings.mealReminders.breakfast.time)}
                    </Text>
                    <Ionicons name="time" size={16} color={theme.primary} />
                  </TouchableOpacity>
                </View>
                <Switch
                  value={notificationSettings.mealReminders.breakfast.enabled}
                  onValueChange={(value) => toggleMealReminder('breakfast', value)}
                  trackColor={{ false: theme.border, true: theme.primaryLight }}
                  thumbColor={notificationSettings.mealReminders.breakfast.enabled ? theme.primary : '#f4f3f4'}
                  disabled={!notificationSettings.mealReminders.enabled}
                />
              </View>
              
              <View style={styles.reminderItem}>
                <View style={styles.reminderInfo}>
                  <Text style={[styles.reminderTitle, { color: theme.text }]}>Lunch</Text>
                  <TouchableOpacity 
                    onPress={() => showTimePickerFor('meal', 'lunch')}
                    style={styles.timeSelector}
                  >
                    <Text style={[styles.timeText, { color: theme.primary }]}>
                      {formatTime(notificationSettings.mealReminders.lunch.time)}
                    </Text>
                    <Ionicons name="time" size={16} color={theme.primary} />
                  </TouchableOpacity>
                </View>
                <Switch
                  value={notificationSettings.mealReminders.lunch.enabled}
                  onValueChange={(value) => toggleMealReminder('lunch', value)}
                  trackColor={{ false: theme.border, true: theme.primaryLight }}
                  thumbColor={notificationSettings.mealReminders.lunch.enabled ? theme.primary : '#f4f3f4'}
                  disabled={!notificationSettings.mealReminders.enabled}
                />
              </View>
              
              <View style={styles.reminderItem}>
                <View style={styles.reminderInfo}>
                  <Text style={[styles.reminderTitle, { color: theme.text }]}>Dinner</Text>
                  <TouchableOpacity 
                    onPress={() => showTimePickerFor('meal', 'dinner')}
                    style={styles.timeSelector}
                  >
                    <Text style={[styles.timeText, { color: theme.primary }]}>
                      {formatTime(notificationSettings.mealReminders.dinner.time)}
                    </Text>
                    <Ionicons name="time" size={16} color={theme.primary} />
                  </TouchableOpacity>
                </View>
                <Switch
                  value={notificationSettings.mealReminders.dinner.enabled}
                  onValueChange={(value) => toggleMealReminder('dinner', value)}
                  trackColor={{ false: theme.border, true: theme.primaryLight }}
                  thumbColor={notificationSettings.mealReminders.dinner.enabled ? theme.primary : '#f4f3f4'}
                  disabled={!notificationSettings.mealReminders.enabled}
                />
              </View>
              
              <View style={styles.reminderItem}>
                <View style={styles.reminderInfo}>
                  <Text style={[styles.reminderTitle, { color: theme.text }]}>Snack</Text>
                  <TouchableOpacity 
                    onPress={() => showTimePickerFor('meal', 'snack')}
                    style={styles.timeSelector}
                  >
                    <Text style={[styles.timeText, { color: theme.primary }]}>
                      {formatTime(notificationSettings.mealReminders.snack.time)}
                    </Text>
                    <Ionicons name="time" size={16} color={theme.primary} />
                  </TouchableOpacity>
                </View>
                <Switch
                  value={notificationSettings.mealReminders.snack.enabled}
                  onValueChange={(value) => toggleMealReminder('snack', value)}
                  trackColor={{ false: theme.border, true: theme.primaryLight }}
                  thumbColor={notificationSettings.mealReminders.snack.enabled ? theme.primary : '#f4f3f4'}
                  disabled={!notificationSettings.mealReminders.enabled}
                />
              </View>
            </View>
          )}
        </View>
        
        {/* Water Reminders Section */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="water" size={24} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Water Reminders</Text>
            </View>
            <Switch
              value={notificationSettings.waterReminders.enabled}
              onValueChange={toggleWaterReminders}
              trackColor={{ false: theme.border, true: theme.primaryLight }}
              thumbColor={notificationSettings.waterReminders.enabled ? theme.primary : '#f4f3f4'}
            />
          </View>
          
          {notificationSettings.waterReminders.enabled && (
            <View style={styles.sectionContent}>
              <Text style={[styles.intervalLabel, { color: theme.text }]}>
                Remind me every {notificationSettings.waterReminders.interval} minutes
              </Text>
              
              <View style={styles.intervalButtons}>
                {[30, 60, 90, 120].map((interval) => (
                  <TouchableOpacity
                    key={interval}
                    style={[
                      styles.intervalButton,
                      notificationSettings.waterReminders.interval === interval && {
                        backgroundColor: theme.primaryLight,
                        borderColor: theme.primary,
                      },
                      { borderColor: theme.border }
                    ]}
                    onPress={() => updateWaterInterval(interval)}
                  >
                    <Text
                      style={[
                        styles.intervalButtonText,
                        { color: notificationSettings.waterReminders.interval === interval ? theme.primary : theme.text }
                      ]}
                    >
                      {interval} min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
        
        {/* Daily Summary Section */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="stats-chart" size={24} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Summary</Text>
            </View>
            <Switch
              value={notificationSettings.dailySummary.enabled}
              onValueChange={toggleDailySummary}
              trackColor={{ false: theme.border, true: theme.primaryLight }}
              thumbColor={notificationSettings.dailySummary.enabled ? theme.primary : '#f4f3f4'}
            />
          </View>
          
          {notificationSettings.dailySummary.enabled && (
            <View style={styles.sectionContent}>
              <View style={styles.reminderItem}>
                <Text style={[styles.reminderTitle, { color: theme.text }]}>Summary Time</Text>
                <TouchableOpacity 
                  onPress={() => showTimePickerFor('dailySummary')}
                  style={styles.timeSelector}
                >
                  <Text style={[styles.timeText, { color: theme.primary }]}>
                    {formatTime(notificationSettings.dailySummary.time)}
                  </Text>
                  <Ionicons name="time" size={16} color={theme.primary} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        
        {/* Exercise Reminders Section */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="fitness" size={24} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Exercise Reminders</Text>
            </View>
            <Switch
              value={notificationSettings.exerciseReminders.enabled}
              onValueChange={toggleExerciseReminders}
              trackColor={{ false: theme.border, true: theme.primaryLight }}
              thumbColor={notificationSettings.exerciseReminders.enabled ? theme.primary : '#f4f3f4'}
            />
          </View>
          
          {notificationSettings.exerciseReminders.enabled && (
            <View style={styles.sectionContent}>
              <View style={styles.reminderItem}>
                <Text style={[styles.reminderTitle, { color: theme.text }]}>Reminder Time</Text>
                <TouchableOpacity 
                  onPress={() => showTimePickerFor('exercise')}
                  style={styles.timeSelector}
                >
                  <Text style={[styles.timeText, { color: theme.primary }]}>
                    {formatTime(notificationSettings.exerciseReminders.time)}
                  </Text>
                  <Ionicons name="time" size={16} color={theme.primary} />
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.daysLabel, { color: theme.text }]}>Reminder Days</Text>
              
              <View style={styles.daysContainer}>
                {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      notificationSettings.exerciseReminders.days.includes(day) && {
                        backgroundColor: theme.primaryLight,
                        borderColor: theme.primary,
                      },
                      { borderColor: theme.border }
                    ]}
                    onPress={() => toggleExerciseDay(day)}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        { color: notificationSettings.exerciseReminders.days.includes(day) ? theme.primary : theme.text }
                      ]}
                    >
                      {getDayName(day)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      
      {showTimePicker && Platform.OS === 'ios' && (
        <View style={[styles.timePickerContainer, { backgroundColor: theme.card }]}>
          <View style={styles.timePickerHeader}>
            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
              <Text style={[styles.timePickerCancel, { color: theme.danger }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleTimeChange(null, currentTimePickerFor?.time)}>
              <Text style={[styles.timePickerDone, { color: theme.primary }]}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={
              currentTimePickerFor?.type === 'meal' && currentTimePickerFor?.meal
                ? notificationSettings.mealReminders[currentTimePickerFor.meal].time
                : currentTimePickerFor?.type === 'dailySummary'
                ? notificationSettings.dailySummary.time
                : notificationSettings.exerciseReminders.time
            }
            mode="time"
            display="spinner"
            onChange={handleTimeChange}
          />
        </View>
      )}
      
      {showTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={
            currentTimePickerFor?.type === 'meal' && currentTimePickerFor?.meal
              ? notificationSettings.mealReminders[currentTimePickerFor.meal].time
              : currentTimePickerFor?.type === 'dailySummary'
              ? notificationSettings.dailySummary.time
              : notificationSettings.exerciseReminders.time
          }
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  section: {
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  sectionContent: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 14,
    marginBottom: 5,
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 5,
  },
  intervalLabel: {
    fontSize: 14,
    marginBottom: 10,
  },
  intervalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  intervalButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intervalButtonText: {
    fontSize: 14,
  },
  daysLabel: {
    fontSize: 14,
    marginTop: 15,
    marginBottom: 10,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  dayButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '13%',
  },
  dayButtonText: {
    fontSize: 12,
  },
  timePickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  timePickerCancel: {
    fontSize: 16,
  },
  timePickerDone: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default NotificationsScreen;