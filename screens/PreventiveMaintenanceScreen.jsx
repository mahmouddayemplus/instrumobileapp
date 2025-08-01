import React, { useEffect, useState,useLayoutEffect } from "react";

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
import { Ionicons } from "@expo/vector-icons"; // or use Feather, MaterialIcons, etc.

import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  initDb,
  getTasksFromSQLite,
  saveTasksToSQLite,
} from "../helper/database";
import { loadData, updateDetailedTasks } from "../firebase/firebaseConfig"; // Combined imports
import { useNavigation } from "@react-navigation/native";

const PreventiveMaintenanceScreen =   ({ navigation }) => {
  const [tasks, setTasks] = useState();
  const [loading, setLoading] = useState(false);
   const [areaTasks, setAreaTasks] = useState(null);
  //////////////////////////////////////////////////////////
 
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
        console.log("Tasks loaded:xxxxxxxxxxxxxx", cached);
      } else {
        console.log("Failed to fetch or load cached tasks.");
      }
    };

    fetchTasks();
  }, []);
  ////////////////////  
      useLayoutEffect(() => {
        navigation.setOptions({
          title: "Tasks",
          headerRight: () => (
            <TouchableOpacity onPress={handlePress} style={{ marginRight: 15 }}>
              <Ionicons name="refresh" size={24} color="black" />
            </TouchableOpacity>
          ),
        });
      }, [navigation, tasks]);
  //////////////////////// 
 
///////////////////////////////////////////////////////////////////////////
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
  ///////////////////////////////////////////////////////
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate("TaskDetailScreen", { task: item })}
    >
      <Text style={styles.itemText}>{item.area}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>


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
    backgroundColor: "#ffffffff",
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#08ab08ff",
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
