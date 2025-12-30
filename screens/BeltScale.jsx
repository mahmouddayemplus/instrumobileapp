import { View, Text, StyleSheet } from "react-native";
import React, { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { colors } from "../constants/color";

export default function BeltScale() {
  const [selectedBelt, setSelectedBelt] = useState("211BC3");

  const handleValueChange = (itemValue) => {
    setSelectedBelt(itemValue);
    console.log("Selected:", itemValue);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Belt Scale:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedBelt}
          onValueChange={handleValueChange}
          style={styles.picker}
        >
          <Picker.Item label="211BC3" value="211BC3" />
          <Picker.Item label="221BC4" value="221BC4" />
          <Picker.Item label="K21BC3" value="K21BC3" />
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background || "#fff",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.text || "#000",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border || "#ccc",
    borderRadius: 8,
    backgroundColor: colors.card || "#f5f5f5",
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    height: 50,
  },
});