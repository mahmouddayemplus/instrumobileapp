import { StyleSheet, Text, View, Button, SafeAreaView, ActivityIndicator } from "react-native";
import React, { useLayoutEffect, useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { loadData, updateDetailedTasks } from "../firebase/firebaseConfig"; // Combined imports
import AreaTasksListComponent from '../components/AreaTasksListComponent'
import { Ionicons } from "@expo/vector-icons"; // or use Feather, MaterialIcons, etc.
import { TouchableOpacity } from "react-native";
import { writeAllTasksToFirestore } from "../firebase/fireStoreBulkWrite";
import { demoData } from '../firebase/demoData'
import { colors } from "../constants/color";

const TaskDetailScreen = () => {
  console.log('============= demoData =============');
  console.log(demoData);
  console.log('====================================');
  const route = useRoute();
  const navigation = useNavigation();
  const [tasks, setTasks] = useState(null);
  const [areaTasks, setAreaTasks] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { task } = route.params;
  const taskId = task.id; // Assuming task has an id field

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        let cached = await loadData("cached_tasks");

        if (!cached) {
          console.log("No cached data found, fetching from Firestore...");
          await updateDetailedTasks(); // Fetch from Firestore and store in AsyncStorage
          cached = await loadData("cached_tasks"); // Load again after update
        }

        if (cached) {
          setTasks(cached);
          console.log("Tasks loaded:", cached);
        } else {
          console.log("Failed to fetch or load cached tasks.");
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handlePress = async () => {
    setIsRefreshing(true);
    try {
      await updateDetailedTasks();
      const cached = await loadData("cached_tasks");

      if (cached) {
        setTasks(cached);
        console.log("Updated tasks loaded successfully");
      } else {
        console.log("No cached data found after update");
      }
    } catch (error) {
      console.error("Error updating tasks:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `${task.area}`,
      headerStyle: {
        backgroundColor: colors.primary || '#34C759',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: '600',
        fontSize: 18,
      },
      headerRight: () => (
        <TouchableOpacity 
          onPress={handlePress} 
          style={styles.refreshButton}
          disabled={isRefreshing}
        >
          <Ionicons 
            name="refresh" 
            size={24} 
            color="#fff" 
            style={isRefreshing ? styles.rotating : null}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, task, isRefreshing]);

  useEffect(() => {
    if (tasks && taskId) {
      console.log("=========  Filtering Tasks  ================");
      console.log("All Tasks:", tasks);
      console.log("taskId:", taskId);

      const taskById = tasks.filter((t) => t.sectionId === taskId);

      console.log("Task found:", taskById);

      if (taskById.length !== 0) {
        setAreaTasks(taskById);
      }
    }
  }, [tasks, taskId]); // only runs when tasks or taskId change

  const shouldWriteData = false; // Toggle manually

  useEffect(() => {
    if (shouldWriteData) {
      writeAllTasksToFirestore(demoData);
    }
  }, [shouldWriteData]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={colors.primary || '#34C759'} />
          <Text style={styles.loadingText}>Loading tasks...</Text>
          <Text style={styles.loadingSubtext}>Please wait while we fetch your data</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!areaTasks || areaTasks.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <View style={styles.emptyContent}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="document-outline" size={64} color="#ccc" />
          </View>
          <Text style={styles.emptyTitle}>No Tasks Found</Text>
          <Text style={styles.emptySubtext}>
            There are no tasks available for this area at the moment.
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handlePress}
            disabled={isRefreshing}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <View style={styles.areaIconContainer}>
            <Ionicons name="location" size={24} color="#fff" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.areaTitle}>{task.area}</Text>
            <Text style={styles.taskCount}>
              {areaTasks.length} task{areaTasks.length !== 1 ? 's' : ''} available
            </Text>
          </View>
        </View>
      </View>

      {/* Tasks Section */}
      <View style={styles.tasksSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Tasks</Text>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>{areaTasks.length}</Text>
          </View>
        </View>
        
        <AreaTasksListComponent data={areaTasks} />
      </View>

      {/* Refresh Status */}
      {isRefreshing && (
        <View style={styles.refreshStatus}>
          <ActivityIndicator size="small" color={colors.primary || '#34C759'} />
          <Text style={styles.refreshStatusText}>Updating tasks...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default TaskDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background || "#F8F9FA",
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background || "#F8F9FA",
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary || '#34C759',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  headerSection: {
    backgroundColor: colors.primary || '#34C759',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  areaIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  areaTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  taskCount: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  tasksSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  sectionBadge: {
    backgroundColor: colors.primary || '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 32,
    alignItems: 'center',
  },
  sectionBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  refreshStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 16,
  },
  refreshStatusText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  refreshButton: {
    marginRight: 15,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  rotating: {
    transform: [{ rotate: '360deg' }],
  },
});
