import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import DateTimePicker from "@react-native-community/datetimepicker";

const auth = getAuth();
const db = getFirestore();

export default function OvertimeList({reload}) {
  const [overtimes, setOvertimes] = useState([]);
  const [totalHours, setTotalHours] = useState(0);

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState(startOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [showPicker, setShowPicker] = useState({ type: null, visible: false });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "overtime"), where("uid", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let temp = [];
      let sum = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const date = new Date(data.date);

        if (date >= startDate && date <= endDate) {
          const hours = Number(data.hours);
          temp.push({
            id: doc.id,
            date,
            hours,
            reason: data.reason,
          });
          sum += hours;
        }
      });

      temp.sort((a, b) => b.date - a.date);
      setOvertimes(temp);
      setTotalHours(sum);
    });

    return () => unsubscribe();
  }, [startDate, endDate,reload]);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.row}>
        <Text style={styles.date}>{item.date.toDateString()}</Text>
        <Text style={styles.hours}>{item.hours} h</Text>
      </View>
      <Text style={styles.reason}>{item.reason}</Text>
    </View>
  );

  const showDatePicker = (type) => setShowPicker({ type, visible: true });

  const onChangeDate = (event, selectedDate) => {
    setShowPicker({ type: null, visible: false });
    if (!selectedDate) return;

    if (showPicker.type === "start") setStartDate(selectedDate);
    else if (showPicker.type === "end") setEndDate(selectedDate);
  };

  return (
    <View style={styles.container}>
      {/* Filter */}
      <View style={styles.filter}>
        <TouchableOpacity style={styles.dateButton} onPress={() => showDatePicker("start")}>
          <Text style={styles.dateText}>{startDate.toDateString()}</Text>
        </TouchableOpacity>
           <Text style={styles.total}>Total: {totalHours} h</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => showDatePicker("end")}>
          <Text style={styles.dateText}>{endDate.toDateString()}</Text>
        </TouchableOpacity>
      </View>

   

      <FlatList
        data={overtimes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      {showPicker.visible && (
        <DateTimePicker
          value={showPicker.type === "start" ? startDate : endDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#F7F7F7" },
  filter: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  dateButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 1,
  },
  dateText: { fontSize: 12, color: "#333" },
  total: { fontSize: 14, fontWeight: "600", marginBottom: 8, color: "#34C759" },
  item: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 1,
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  date: { fontWeight: "500", fontSize: 12, color: "#333" },
  hours: { fontSize: 12, color: "#34C759", fontWeight: "600" },
  reason: { fontSize: 11, color: "#555" },
});
