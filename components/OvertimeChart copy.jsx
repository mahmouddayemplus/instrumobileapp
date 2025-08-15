// import { View, Dimensions } from "react-native";
// import { BarChart } from "react-native-chart-kit";

// const screenWidth = Dimensions.get("window").width - 32; // padding

// export default function OvertimeChart({ usersData }) {
//   const labels = usersData.map((user) => user.name);
//   const data = usersData.map((user) => user.totalHours);

//   return (
//     <View>
//       <BarChart
//         data={{
//           labels,
//           datasets: [{ data }],
//         }}
//         width={screenWidth}
//         height={220}
//         yAxisSuffix="h"
//         chartConfig={{
//           backgroundColor: "#fff",
//           backgroundGradientFrom: "#fff",
//           backgroundGradientTo: "#fff",
//           decimalPlaces: 1,
//           color: (opacity = 1) => `rgba(52,199,89, ${opacity})`,
//           labelColor: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
//           style: { borderRadius: 16 },
//         }}
//         style={{ marginVertical: 8, borderRadius: 16 }}
//       />
//     </View>
//   );
// }
