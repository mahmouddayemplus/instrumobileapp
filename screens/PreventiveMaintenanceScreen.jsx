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
      console.log("Updated tasks loaded:xxxxxxx xxxxx", cached);
    } else {
      console.log("No cached data found after update");
    }
  };
  ///////////////////////////////////////////////////////
  const renderItem = ({ item }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => navigation.navigate("TaskDetailScreen", { task: item })}
  >
    <Text style={styles.cardTitle}>{item.area}</Text>
  </TouchableOpacity>
);

 return (
  <SafeAreaView style={styles.container}>
    {loading ? (
      <ActivityIndicator size="large" color={colors.primary || "#2e86de"} />
    ) : (
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
      />
    )}
  </SafeAreaView>
);
};

export default PreventiveMaintenanceScreen;

const CARD_WIDTH = (Dimensions.get("window").width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  listContainer: {
    paddingBottom: 100,
    paddingTop: 10,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e1e1e",
    textAlign: "center",
  },
});
