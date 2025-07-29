import { StyleSheet, Text, View, Button } from "react-native";
import React, { useLayoutEffect, useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { loadData, updateDetailedTasks } from "../firebase/firebaseConfig"; // Combined imports

const TaskDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [tasks, setTasks] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
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
    };

    fetchTasks();
  }, []);

  const handlePress = async () => {
    await updateDetailedTasks();
    const cached = await loadData("cached_tasks");

    if (cached) {
      setTasks(cached);
      console.log("Updated tasks loaded:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", cached);
    } else {
      console.log("No cached data found after update");
    }
  };

  const { task } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({ title: `${task.section}` });
  }, [navigation, task]);

  if (!tasks) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 18 }}>Loading... </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button title="Update" onPress={handlePress} />
      <Text style={styles.title}>Task Details</Text>
      <Text style={styles.item}>Section: {task.section}</Text>
      <Text style={styles.item}>ID: {task.id}</Text>
      {/* Add more fields as needed */}
    </View>
  );
};

export default TaskDetailScreen;

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  item: { fontSize: 18, marginVertical: 5 },
});
