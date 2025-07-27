import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import ToolComponent from "../components/ToolComponent";

const ToolsScreen = () => {
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
