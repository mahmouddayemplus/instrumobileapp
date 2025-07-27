import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig"; // adjust the path as needed
import { useEffect } from "react";

const PreventiveMaintenanceScreen = () => {
  useEffect(() => {
    const fetchPmTasks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "pmTasks"));
        querySnapshot.forEach((doc) => {
          console.log(doc.id, " => ", doc.data() );
        });
      } catch (error) {
        console.error("Error fetching pmTasks:", error);
      }
    };

    fetchPmTasks();
  }, []);
  return (
    <SafeAreaView>
      <Text>PreventiveMaintenanceScreenxxxx</Text>
    </SafeAreaView>
  )
}

export default PreventiveMaintenanceScreen

const styles = StyleSheet.create({})