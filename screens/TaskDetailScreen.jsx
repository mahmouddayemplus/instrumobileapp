import { StyleSheet, Text, View, Button } from "react-native";
import React, { useLayoutEffect, useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { loadData } from "../firebase/firebaseConfig";
const TaskDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [tasks, setTasks] = useState();

  useEffect(() => {
    const fetchCachedTasks = async () => {
      const cached = await loadData("cached_tasks");
      if (cached) {
        setTasks(cached); // set state with tasks
        console.log("========= mohamed ===============");
        console.log(tasks );
        console.log("====================================");
      } else {
        console.log("No cached data found");
      }
    };

    fetchCachedTasks();
  }, []);
  // your helper
  async function handlePress() {
    const cached = await loadData("cached_tasks");
    if (cached) {
      setTasks(cached); // set state with tasks
      console.log("========= Eyad Ammar Mazen===============");
      console.log(tasks );
      console.log("====================================");
    } else {
      console.log("No cached data found");
    }
  }
  const { task } = route.params;
  useLayoutEffect(() => {
    navigation.setOptions({ title: ` ${task.section}` });
  }, [navigation, task]);

  return (
    <View style={styles.container}>
      <Button title="update" onPress={handlePress} />
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
