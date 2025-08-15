// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   Switch,
//   Dimensions,
//   ScrollView,
// } from "react-native";
// import { getFirestore, collection, getDocs, query } from "firebase/firestore";
// import { useNavigation } from "@react-navigation/native";
// import { BarChart, PieChart } from "react-native-chart-kit";

// const db = getFirestore();
// const screenWidth = Dimensions.get("window").width - 32;
// console.log("screenWidth:", screenWidth);

// export default function AdminOvertimeList() {
//   const [usersData, setUsersData] = useState([]);
//   const [chartType, setChartType] = useState("bar"); // "bar" or "pie"
//   const navigation = useNavigation();

//   const fetchUsersOvertime = async () => {
//     try {
//       const usersSnapshot = await getDocs(collection(db, "users"));
//       let temp = [];

//       for (const userDoc of usersSnapshot.docs) {
//         const user = userDoc.data();
//         const overtimeSnapshot = await getDocs(
//           query(collection(db, "overtime"))
//         );

//         const userOvertimes = overtimeSnapshot.docs.filter(
//           (doc) => doc.data().uid === user.uid
//         );

//         const totalHours = userOvertimes.reduce(
//           (sum, doc) => sum + Number(doc.data().hours),
//           0
//         );

//         temp.push({
//           uid: user.uid,
//           companyId: user.companyId,
//           totalHours,
//         });
//       }

//       setUsersData(temp);
//     } catch (err) {
//       console.error("Error fetching users overtime:", err);
//     }
//   };

//   useEffect(() => {
//     fetchUsersOvertime();
//   }, []);

//   const renderItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.item}
//       onPress={() => navigation.navigate("OvertimeDetails", { uid: item.uid })}
//     >
//       <Text style={styles.name}>{item.companyId}</Text>
//       <Text style={styles.hours}>{item.totalHours} h</Text>
//     </TouchableOpacity>
//   );

//   const toggleChart = () => {
//     setChartType((prev) => (prev === "bar" ? "pie" : "bar"));
//   };
//  const dummyPieData = [
//     { name: "Company A", population: 40, color: "#FF6384", legendFontColor: "#333", legendFontSize: 12 },
//     { name: "Company B", population: 25, color: "#36A2EB", legendFontColor: "#333", legendFontSize: 12 },
//     { name: "Company C", population: 35, color: "#FFCE56", legendFontColor: "#333", legendFontSize: 12 },
//   ];
//   // Chart data
//   const filteredUsers = usersData.filter((u) => u.totalHours > 0);

//   const barData = {
//     labels: filteredUsers.map((u) => u.companyId),
//     datasets: [{ data: filteredUsers.map((u) => u.totalHours) }],
//   };
//   // Utility to generate a safe color in hex
   
// //   const pieData = usersData
// //     .filter((u) => u.totalHours > 0) // remove zero values
// //     .map((u, index) => ({
// //       name: u.companyId || "Unknown",
// //       population: u.totalHours,
// //       color: `hsl(${(index * 360) / usersData.length}, 70%, 50%)` || "#34C759", // fallback color
// //       legendFontColor: "#333",
// //       legendFontSize: 12,
// //     }));
//   return (
//     <View contentContainerStyle={{ padding: 16 }}>
//       <View style={styles.switchContainer}>
//         <Text>Bar Chart</Text>
//         <Switch value={chartType === "pie"} onValueChange={toggleChart} />
//         <Text>Pie Chart</Text>
//       </View>

//       {chartType === "pie" ? (
//         dummyPieData.length > 0 ? (
//           <PieChart
//             data={dummyPieData}
//             width={screenWidth}
//             height={300}
//             accessor="population"
//             backgroundColor="transparent"
//             paddingLeft="16"
//             absolute
//           />
//         ) : (
//           <Text style={{ textAlign: "center", marginTop: 20 }}>No data</Text>
//         )
//       ) : (
//         <BarChart
//           data={barData}
//           width={screenWidth}
//           height={300}
//           yAxisSuffix="h"
//           fromZero
//           showValuesOnTopOfBars
//           chartConfig={{
//             backgroundColor: "#fff",
//             backgroundGradientFrom: "#fff",
//             backgroundGradientTo: "#fff",
//             decimalPlaces: 1,
//             color: (opacity = 1) => `rgba(52,199,89, ${opacity})`,
//             labelColor: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
//             style: { borderRadius: 16 },
//           }}
//           style={{ marginVertical: 8, borderRadius: 16 }}
//           verticalLabelRotation={90}
//         />
//       )}

//       {/* <FlatList
//         data={usersData}
//         keyExtractor={(item) => item.uid}
//         renderItem={renderItem}
//         style={{ marginTop: 16 }}
//       /> */}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   item: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     padding: 12,
//     backgroundColor: "#fff",
//     marginBottom: 8,
//     borderRadius: 10,
//     elevation: 1,
//   },
//   name: { fontSize: 14, fontWeight: "600" },
//   hours: { fontSize: 14, color: "#34C759", fontWeight: "600" },
//   switchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 12,
//   },
// });
