import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  initDb,
  getTasksFromSQLite,
  saveTasksToSQLite,
} from "../helper/database"; // update path

const PreventiveMaintenanceScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initDb()
      .then(() => loadTasksFromDb())
      .catch((e) => console.error("DB init error", e));
  }, []);

  const loadTasksFromDb = async () => {
    const stored = await getTasksFromSQLite();
    setTasks(stored);
    console.log("========== loadTasksFromDb  ==============");
    console.log(tasks);
    console.log("====================================");
  };

  const updateFromFirestore = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "pmTasks"));
      const tasks = [];
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });

      
      tasks.forEach(async (task) => {
        await saveTasksToSQLite(task.id, task.section, task.order);
      });
      await loadTasksFromDb();
      console.log("=========== updateFromFirestore ================");
      console.log(tasks);
      console.log("====================================");

      Alert.alert("Success", "Task list updated");
    } catch (err) {
      Alert.alert("Error", "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate("TaskDetail", { task: item })}
    >
      <Text style={styles.itemText}>{item.section}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={updateFromFirestore}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Updating..." : "Update Task List"}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </SafeAreaView>
  );
};

export default PreventiveMaintenanceScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  button: {
    backgroundColor: "#3478f6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  item: {
    backgroundColor: "#eee",
    padding: 16,
    marginVertical: 4,
    borderRadius: 8,
  },
  itemText: { fontSize: 16 },
});
