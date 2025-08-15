import React, { useEffect, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Dimensions,
  Platform,
} from "react-native";
import { getFirestore, collection, getDocs, query } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { BarChart } from "react-native-chart-kit";
import PieChart from "react-native-pie-chart";

const db = getFirestore();
const screenWidth = Dimensions.get("window").width - 32;

export default function AdminOvertimeList() {
  const [date, setDate] = useState(new Date());

  const today = new Date(date.getTime() + 3 * 60 * 60 * 1000);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState(startOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [showPicker, setShowPicker] = useState({ type: null, visible: false });
  const END_DATE_GRACE_MINUTES = 15;

  const [usersData, setUsersData] = useState([]);
  const [chartType, setChartType] = useState("bar");
  const showDatePicker = (type) => setShowPicker({ type, visible: true });
  const onChangeDate = (event, selectedDate) => {
    setShowPicker({ type: null, visible: false });
    if (!selectedDate) return;

    if (showPicker.type === "start") setStartDate(selectedDate);
    else if (showPicker.type === "end") setEndDate(selectedDate);
  };

  const navigation = useNavigation();

  const fetchUsersOvertime = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      let temp = [];

      for (const userDoc of usersSnapshot.docs) {
        const user = userDoc.data();

        const overtimeSnapshot = await getDocs(
          query(collection(db, "overtime"))
        );
        const adjustedEndDate = new Date(endDate);
        adjustedEndDate.setHours(23, 59, 59, 999);
        // Filter by user ID and date range
        const userOvertimes = overtimeSnapshot.docs.filter((doc) => {
          const data = doc.data();
          if (data.uid !== user.uid) return false;

          // Convert Firestore timestamp to JS Date
          const overtimeDate = data.date?.toDate
            ? data.date.toDate()
            : new Date(data.date);

          return overtimeDate >= startDate && overtimeDate <= adjustedEndDate;
        });

        const totalHours = userOvertimes.reduce(
          (sum, doc) => sum + Number(doc.data().hours),
          0
        );

        temp.push({
          uid: user.uid,
          name: user.displayName || user.email,
          companyId: user.companyId,
          totalHours,
        });
      }

      temp.sort((a, b) => b.totalHours - a.totalHours);
      setUsersData(temp);
    } catch (err) {
      console.error("Error fetching users overtime:", err);
    }
  };

  useEffect(() => {
    fetchUsersOvertime();
  }, [startDate, endDate]);

  const toggleChart = () => {
    setChartType((prev) => (prev === "bar" ? "pie" : "bar"));
  };

  const filteredUsers = usersData.filter((u) => u.totalHours > 0);

  // Bar Chart Data
  const barData = {
    labels: filteredUsers.map((u) => u.companyId),
    datasets: [{ data: filteredUsers.map((u) => u.totalHours) }],
  };

  // Pie Chart Data

  const pieValues = filteredUsers.map((u) => u.totalHours);
  const pieColors = filteredUsers.map(
    (_, index) => `hsl(${(index * 360) / filteredUsers.length}, 70%, 50%)`
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate("OvertimeDetails", { uid: item.uid })}
    >
      <Text style={styles.cell}>{item.companyId}</Text>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={[styles.cell, styles.hours]}>{item.totalHours} h</Text>
    </TouchableOpacity>
  );
  const renderHeader = () => (
    <View style={[styles.header]}>
      <Text style={[styles.cell, styles.headerText]}>ID</Text>
      <Text style={[styles.cell, styles.headerText]}>Name</Text>
      <Text style={[styles.cell, styles.headerText, styles.hours]}>
        Total Hours
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
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

      <BarChart
        data={barData}
        width={screenWidth}
        height={300}
        yAxisSuffix="h"
        fromZero
        showValuesOnTopOfBars
        chartConfig={{
          backgroundColor: "#fff",
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 1,
          barPercentage: 0.4, // lower value = narrower bars (default ~0.8)

          color: (opacity = 1) => `rgba(52,199,89, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
          propsForLabels: {
            // control label font
            fontSize: 10, // change this to your desired size
            fontWeight: "500",
          },
        }}
        style={{ marginVertical: 8, borderRadius: 16 }}
        verticalLabelRotation={90}
      />

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.uid}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ paddingTop: 8 }}
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
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
    borderRadius: 10,
    elevation: 2,
  },
  cell: { flex: 1, fontSize: 14, fontWeight: "500" },
  hours: {
    color: "#34C759",
    fontWeight: "600",
    textAlign: "right", // Works for both header & rows
  },
  header: {
    backgroundColor: "#444",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
    borderRadius: 10,
    elevation: 2,
  },
  headerText: { fontWeight: "700", color: "#333" },

  dateText: { fontSize: 12, color: "#333" },
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
});
