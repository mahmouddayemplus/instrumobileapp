import React, { useEffect, useState } from "react";

import { colors } from "../constants/color";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  initDb,
  getTasksFromSQLite,
  saveTasksToSQLite,
} from "../helper/database";

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
    console.log(stored);
    console.log("====================================");
  };

  const updateFromFirestore = async () => {
    setLoading(true);
    try {
      await initDb(true);

      const querySnapshot = await getDocs(collection(db, "PMTasks"));
      const tasks = [];
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });

      for (const task of tasks) {
        await saveTasksToSQLite(task.id, task.section, task.order);
      }

      await loadTasksFromDb();

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
      onPress={() => navigation.navigate("TaskDetailScreen", { task: item })}
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
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </SafeAreaView>
  );
};

export default PreventiveMaintenanceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f7f9fc",
  },
  button: {
    backgroundColor: colors.primary || "#2e86de",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  column: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  item: {
    backgroundColor: "#ffffff",
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    minHeight: 100,
    justifyContent: "center",
  },
  itemText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
});
