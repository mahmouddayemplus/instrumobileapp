import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { getFirestore, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// import {db} from '../firebase/firebaseConfig'
 
const auth = getAuth();
const db = getFirestore();
export default function OvertimeList() {
  const [overtimes, setOvertimes] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  console.log('====================================');
  console.log(db);
  console.log('====================================');

  useEffect(() => {
    async function fetchOvertimes() {
      const user = auth.currentUser;
      if (!user) return;
  

      const q = query(
        collection(db, "overtime"),
        where("uid", "==", user.uid) 
       
      );
 
      const snapshot = await getDocs(q);
      let temp = [];
      let sum = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
 
        temp.push({
          id: doc.id,
          date: data.date,
          hours: Number(data.hours),
          reason: data.reason,
        });
        sum += Number(data.hours);
      });
      temp.sort((a, b) => new Date(b.date) - new Date(a.date)); // descending

      setOvertimes(temp);
      setTotalHours(sum);
    }

    fetchOvertimes();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.date}>{new Date(item.date).toDateString()}</Text>
      <Text style={styles.hours}>{item.hours} h</Text>
      <Text style={styles.reason}>{item.reason}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={overtimes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <Text style={styles.total}>Total Hours: {totalHours}</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F8F9FA" },
  item: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  date: { fontWeight: "600", fontSize: 16, marginBottom: 4 },
  hours: { fontSize: 14, marginBottom: 4, color: "#34C759" },
  reason: { fontSize: 14, color: "#555" },
  total: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
});
