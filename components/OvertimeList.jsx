import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import DateTimePicker from "@react-native-community/datetimepicker";

const auth = getAuth();
const db = getFirestore();

export default function OvertimeList() {
  const [overtimes, setOvertimes] = useState([]);
  const [filteredOvertimes, setFilteredOvertimes] = useState([]);
  const [totalHours, setTotalHours] = useState(0);

  // Set default start date = first day of current month
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [showPicker, setShowPicker] = useState({ show: false, mode: "start" });

  useEffect(() => {
    async function fetchOvertimes() {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, "overtime"), where("uid", "==", user.uid));
      const snapshot = await getDocs(q);
      let temp = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        temp.push({
          id: doc.id,
          date: new Date(data.date),
          hours: Number(data.hours),
          reason: data.reason,
        });
      });

      temp.sort((a, b) => b.date - a.date);
      setOvertimes(temp);
    }

    fetchOvertimes();
  }, []);

  // Filter overtime based on startDate and endDate
  useEffect(() => {
    const filtered = overtimes.filter(
      (item) => item.date >= startDate && item.date <= endDate
    );
    setFilteredOvertimes(filtered);
    setTotalHours(filtered.reduce((sum, item) => sum + item.hours, 0));
  }, [startDate, endDate, overtimes]);

  const showDatePicker = (mode) => {
    setShowPicker({ show: true, mode });
  };

  const onChangeDate = (event, selectedDate) => {
    setShowPicker({ ...showPicker, show: false });
    if (!selectedDate) return;

    if (showPicker.mode === "start") setStartDate(selectedDate);
    else setEndDate(selectedDate);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.row}>
        <Text style={styles.date}>{item.date.toDateString()}</Text>
        <Text style={styles.hours}>{item.hours} h</Text>
      </View>
      <Text style={styles.reason}>{item.reason}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Filter Section */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => showDatePicker("start")}
        >
          <Text style={styles.dateText}>
            {startDate ? startDate.toDateString() : "Start Date"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => showDatePicker("end")}
        >
          <Text style={styles.dateText}>
            {endDate ? endDate.toDateString() : "End Date"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.total}>Total Hours: {totalHours}</Text>

      <FlatList
        data={filteredOvertimes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {showPicker.show && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F4F6F8" },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E1E5E9",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  dateText: { fontSize: 14, color: "#333" },
  total: { fontSize: 20, fontWeight: "700", marginBottom: 12, color: "#222" },
  item: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  date: { fontWeight: "600", fontSize: 16, color: "#333" },
  hours: { fontWeight: "700", fontSize: 16, color: "#34C759" },
  reason: { fontSize: 14, color: "#555", lineHeight: 20 },
});
