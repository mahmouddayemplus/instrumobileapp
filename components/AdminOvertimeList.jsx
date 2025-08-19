import React, { useEffect, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import { getFirestore, collection, getDocs, query } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { BarChart } from "react-native-chart-kit";
import { colors } from "../constants/color";

const db = getFirestore();
const screenWidth = Dimensions.get("window").width - 32;

export default function AdminOvertimeList() {
  const [date, setDate] = useState(new Date());
  const today = new Date(date.getTime() + 3 * 60 * 60 * 1000);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState(startOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [showPicker, setShowPicker] = useState({ type: null, visible: false });
  const [loading, setLoading] = useState(true);
  const [usersData, setUsersData] = useState([]);

  const navigation = useNavigation();

  const showDatePicker = (type) => setShowPicker({ type, visible: true });
  const onChangeDate = (event, selectedDate) => {
    setShowPicker({ type: null, visible: false });
    if (!selectedDate) return;
    showPicker.type === "start" ? setStartDate(selectedDate) : setEndDate(selectedDate);
  };

  const fetchUsersOvertime = async () => {
    try {
      setLoading(true);
      const usersSnapshot = await getDocs(collection(db, "users"));
      const overtimeSnapshot = await getDocs(query(collection(db, "overtime")));
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setHours(23, 59, 59, 999);

      let temp = [];

      for (const userDoc of usersSnapshot.docs) {
        const user = userDoc.data();

        // Filter overtime for this user & date range
        const userOvertimes = overtimeSnapshot.docs
          .map((doc) => {
            const d = doc.data();
            const overtimeDate = d.date?.toDate ? d.date.toDate() : new Date(d.date);
            return { id: doc.id, ...d, date: overtimeDate };
          })
          .filter(
            (ot) => ot.uid === user.uid && ot.date >= startDate && ot.date <= adjustedEndDate
          );

        const totalHours = userOvertimes.reduce((sum, ot) => sum + Number(ot.hours || 0), 0);

        temp.push({
          uid: user.uid,
          name: user.displayName || user.email,
          companyId: user.companyId,
          totalHours,
          overtimes: userOvertimes,
        });
      }

      // Only users with overtime > 0
      temp = temp.filter((u) => u.totalHours > 0);
      temp.sort((a, b) => b.totalHours - a.totalHours);
      setUsersData(temp);
    } catch (err) {
      console.error("Error fetching users overtime:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersOvertime();
  }, [startDate, endDate]);

  const barData = {
    labels: usersData.map((u) => u.companyId),
    datasets: [{ data: usersData.map((u) => u.totalHours) }],
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        navigation.navigate("OvertimeDetails", {
          uid: item.uid,
          name: item.name,
          companyId: item.companyId,
          overtimes: item.overtimes,
        })
      }
    >
      <Text style={styles.cell}>{item.companyId}</Text>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={[styles.cell, styles.hours]}>{item.totalHours} h</Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.cell, styles.headerText]}>ID</Text>
      <Text style={[styles.cell, styles.headerText]}>Name</Text>
      <Text style={[styles.cell, styles.headerText, styles.hours]}>Total Hours</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary || "#34C759"} />
        <Text style={{ marginTop: 10, color: "#333" }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={styles.filter}>
        <TouchableOpacity style={styles.dateButton} onPress={() => showDatePicker("start")}>
          <Text style={styles.dateText}>{startDate.toDateString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateButton} onPress={() => showDatePicker("end")}>
          <Text style={styles.dateText}>{endDate.toDateString()}</Text>
        </TouchableOpacity>
      </View>

      <BarChart
        data={barData}
        width={screenWidth}
        height={250}
        yAxisSuffix="h"
        fromZero
        showValuesOnTopOfBars
        chartConfig={{
          backgroundColor: "#fff",
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 1,
          barPercentage: 0.4,
          color: (opacity = 1) => `rgba(52,199,89, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
          propsForLabels: { fontSize: 10, fontWeight: "500" },
        }}
        style={{ marginVertical: 8, borderRadius: 16,padding:6, }}
        verticalLabelRotation={45}
      />

      <FlatList
        data={usersData}
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
  item: { flexDirection: "row", justifyContent: "space-between", padding: 12, backgroundColor: "#fff", marginBottom: 8, borderRadius: 10, elevation: 2 },
  cell: { flex: 1, fontSize: 14, fontWeight: "500" },
  hours: { color: "#34C759", fontWeight: "600", textAlign: "right" },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 12, backgroundColor: "#eee", marginBottom: 8, borderRadius: 10 },
  headerText: { fontWeight: "700", color: "#333" },
  dateText: { fontSize: 12, color: "#333" },
  filter: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  dateButton: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "#fff", borderRadius: 8, elevation: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
});
