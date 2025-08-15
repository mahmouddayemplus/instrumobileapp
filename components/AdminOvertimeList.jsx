import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Dimensions,
} from "react-native";
import { getFirestore, collection, getDocs, query } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { BarChart } from "react-native-chart-kit";
import PieChart from "react-native-pie-chart";

const db = getFirestore();
const screenWidth = Dimensions.get("window").width - 32;

export default function AdminOvertimeList() {
  const [usersData, setUsersData] = useState([]);
  const [chartType, setChartType] = useState("bar");
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

        const userOvertimes = overtimeSnapshot.docs.filter(
          (doc) => doc.data().uid === user.uid
        );

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
  }, []);

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
  useEffect(() => {
  setUsersData([
    { uid: "1", name: "User 1", companyId: "C1", totalHours: 12 },
    { uid: "2", name: "User 2", companyId: "C2", totalHours: 8 },
    { uid: "3", name: "User 3", companyId: "C3", totalHours: 15 },
  ]);
}, []);

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
    <View style={[styles.item, styles.header]}>
      <Text style={[styles.cell, styles.headerText]}>ID</Text>
      <Text style={[styles.cell, styles.headerText]}>Name</Text>
      <Text style={[styles.cell, styles.headerText]}>Total Hours</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={styles.switchContainer}>
        <Text>Bar Chart</Text>
        <Switch value={chartType === "pie"} onValueChange={toggleChart} />
        <Text>Pie Chart</Text>
      </View>

      {chartType === "pie" ? (
        pieValues.length > 0 ? (
          <View style={{ alignItems: "center", marginVertical: 20 }}>
            <PieChart
              widthAndHeight={250}
              series={pieValues}
              sliceColor={pieColors}
              coverRadius={0.45}
              coverFill={"#FFF"}
            />
            <View style={{ marginTop: 10 }}>
              {filteredUsers.map((u, i) => (
                <Text key={i} style={{ fontSize: 12 }}>
                  <Text style={{ color: pieColors[i] }}>■ </Text>
                  {u.companyId} - {u.totalHours}h
                </Text>
              ))}
            </View>
          </View>
        ) : (
          <Text style={{ textAlign: "center", marginTop: 20 }}>No data</Text>
        )
      ) : (
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
            color: (opacity = 1) => `rgba(52,199,89, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
          }}
          style={{ marginVertical: 8, borderRadius: 16 }}
          verticalLabelRotation={90}
        />
      )}

      <FlatList
        data={usersData}
        keyExtractor={(item) => item.uid}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ paddingTop: 8 }}
      />
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
  hours: { color: "#34C759", fontWeight: "600", textAlign: "right" },
  header: { backgroundColor: "#F0F0F0", marginBottom: 4 },
  headerText: { fontWeight: "700", color: "#333" },
});
