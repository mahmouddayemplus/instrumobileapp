import { StyleSheet, Text, View, Button } from "react-native";
import React, { useLayoutEffect, useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { loadData, updateDetailedTasks } from "../firebase/firebaseConfig"; // Combined imports
 import AreaTasksListComponent from '../components/AreaTasksListComponent'
import { Ionicons } from "@expo/vector-icons"; // or use Feather, MaterialIcons, etc.
import { TouchableOpacity } from "react-native";
import { writeAllTasksToFirestore } from "../firebase/fireStoreBulkWrite";
import {demoData} from '../firebase/demoData'
const TaskDetailScreen = () => {
  console.log('============= demoData =============');
  console.log(demoData);
  console.log('====================================');
  const route = useRoute();
  const navigation = useNavigation();
  const [tasks, setTasks] = useState(null);
  const [areaTasks, setAreaTasks] = useState(null);
  const { task } = route.params;
  const taskId = task.id; // Assuming task has an id field

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
      // console.log("Updated tasks loaded:xxxxxxx xxxxx", cached);
    } else {
      console.log("No cached data found after update");
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `${task.section}`,
      headerRight: () => (
        <TouchableOpacity onPress={handlePress} style={{ marginRight: 15 }}>
          <Ionicons name="refresh" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, task]);

 
  useEffect(() => {
    if (tasks && taskId) {
      // console.log("=========  Filtering Tasks  ================");
      // console.log("All Tasks:", tasks);
      // console.log("taskId:", taskId);

      const taskById = tasks.filter((t) => t.sectionId === taskId);

      // console.log("Task found:", taskById);

      if (taskById.length !== 0) {
        setAreaTasks(taskById);
      }
    }
  }, [tasks, taskId]); // only runs when tasks or taskId change




  const shouldWriteData = false; // Toggle manually

  useEffect(() => {
    if (shouldWriteData) {
      // const demoData =  

      writeAllTasksToFirestore(demoData);
    }
  }, [shouldWriteData]);
  // console.log("====================================");
  // console.log(areaTasks);
  // console.log("====================================");

  if (!areaTasks) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 18 }}>Loading...No Tasks Found </Text>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      {/* <Button title="Update" onPress={handlePress} color={"#43ad49ff"}/> */}

      <AreaTasksListComponent data={areaTasks} />
    </View>
  );
};

export default TaskDetailScreen;

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  item: { fontSize: 18, marginVertical: 5 },
});
