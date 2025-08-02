import { StyleSheet, Text, View ,Alert} from "react-native";
import React, { use, useLayoutEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import ToolComponent from "../components/ToolComponent";
import { useSelector } from "react-redux";
import { logout, saveUser } from "../store/authSlice";
import { useDispatch } from "react-redux";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getUser, removeUser } from "../helper/authStorage";
const ToolsScreen = ({ navigation }) => {
  const user = useSelector((state) => state.auth.user);
  console.log('====================================');
  console.log(user);
  console.log('====================================');
  const dispatch = useDispatch();
 useLayoutEffect(() => {
  navigation.setOptions({
    title: "Tools",
    headerTitleStyle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#2e7d32", // custom color
    },
    headerRight: () => (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginRight: 10 }}>
        <Text style={{ fontSize: 14, color: "#333" }}>
          Welcome {user?.displayName || ""}
        </Text>
        <MaterialCommunityIcons
          name="logout"
          size={24}
          color="#2e7d32"
          onPress={() => {
            Alert.alert(
              "Confirm Logout",
              "Are you sure you want to log out?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Logout",
                  style: "destructive",
                  onPress: async () => {
                    dispatch(logout());
                    await removeUser();
                  },
                },
              ],
              { cancelable: true }
            );
          }}
        />
      </View>
    ),
  });
}, [navigation, user]);

  return (
    <SafeAreaView>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <ToolComponent
          iconName="thermometer"
          titleLine1="PT100"
          titleLine2="Calculator"
          screenName="PT100Calculator"
        />
        <ToolComponent
          iconName="pulse"
          titleLine1="Thermocouple-k Type"
          titleLine2="Calculator"
          screenName="Thermocouple"
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <ToolComponent
          iconName="funnel"
          titleLine1="Pressure"
          titleLine2="Converter"
          screenName="PressureConverter"
        />

        <ToolComponent
          iconName="calculator"
          titleLine1="Weigh Feeder"
          titleLine2="Correction Factor"
          screenName="WeighFeeder"
        />
      </View>
      {/* <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <ToolComponent
          iconName="bar-chart"
          titleLine1="4-20 mA"
          titleLine2="scaler"
          screenName="BooksScreen"
        />

        <ToolComponent
          iconName="flash"
          titleLine1="3PH-Motor Current"
          titleLine2="Calculator"
          screenName="ProfileScreen"
        />
      </View> */}
    </SafeAreaView>
  );
};

export default ToolsScreen;

const styles = StyleSheet.create({});
