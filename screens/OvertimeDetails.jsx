import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors } from "../constants/color";

export default function OvertimeDetails({ route }) {
  const { name, companyId, overtimes } = route.params;

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState(startOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [showPicker, setShowPicker] = useState({ type: null, visible: false });
  const [filteredData, setFilteredData] = useState(overtimes);

  const showDatePicker = (type) => setShowPicker({ type, visible: true });
  const onChangeDate = (event, selectedDate) => {
    setShowPicker({ type: null, visible: false });
    if (!selectedDate) return;

    showPicker.type === "start"
      ? setStartDate(selectedDate)
      : setEndDate(selectedDate);
  };

  useEffect(() => {
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    const filtered = overtimes.filter(
      (item) => item.date >= startDate && item.date <= adjustedEndDate
    );

    setFilteredData(filtered);
  }, [startDate, endDate, overtimes]);

  const totalHours = filteredData.reduce(
    (sum, item) => sum + Number(item.hours || 0),
    0
  );

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemheader}>
        <Text style={styles.cell}>{item.date.toDateString()}</Text>
        <Text style={[styles.cell, styles.hours]}>{item.hours} h</Text>
      </View>
      <View>
        <Text style={styles.cell}>{item.reason}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Filter */}
      <View style={styles.filter}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => showDatePicker("start")}
        >
          <Text style={styles.dateText}>{startDate.toDateString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => showDatePicker("end")}
        >
          <Text style={styles.dateText}>{endDate.toDateString()}</Text>
        </TouchableOpacity>
      </View>

      {/* Total */}
      <View style={styles.totalBox}>
       
          <Text style={styles.totalText}>{name}</Text>
          <Text style={styles.totalText}>Id: {companyId}</Text>
      
     
          <Text style={styles.totalText}>Total : {totalHours} h</Text>
     
      </View>

      {/* List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ paddingTop: 8 }}
      />

      {/* Date Picker */}
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
  item: {
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 8,
    borderRadius: 10,
    elevation: 2,
  },
  cell: { flex: 1, fontSize: 14, fontWeight: "500" },
  hours: { color: "#34C759", fontWeight: "600", textAlign: "right" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#eee",
    marginBottom: 8,
    borderRadius: 10,
  },
  headerText: { fontWeight: "700", color: "#333" },

  totalBox: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#34C75920",
    borderRadius: 10,
    marginBottom: 12,
    justifyContent:"space-between"
  },
  totalText: { fontSize: 16, fontWeight: "700", color: "#34C759" },
  filter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dateButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 1,
  },
  dateText: { fontSize: 12, color: "#333" },
  itemheader: {
    flex: 1,
    flexDirection: "row",
  },
});
