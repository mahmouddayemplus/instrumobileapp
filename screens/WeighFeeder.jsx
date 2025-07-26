import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  SafeAreaView,
  TextInput,
  Keyboard,
  Button,
} from "react-native";
import { colors } from "../constants/color";
import React, { useState } from "react";

const WeighFeeder = () => {
  const [actualWeight, setActualWeight] = useState("");
  const [totalizer, setTotalizer] = useState("");
  const [correctionFactor, setCorrectionFactor] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const calculateFactor = () => {
    const weight = parseFloat(actualWeight);
    const total = parseFloat(totalizer);
    const factor = parseFloat(correctionFactor);

    if (!isNaN(weight) && !isNaN(total) && total !== 0) {
      const error = (weight / total - 1) * 100;
      setError(error.toFixed(2));
      const corrected = (weight / total) * factor;
      setResult(corrected.toFixed(4));
    } else {
      setResult("Invalid input");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        {result !== null && (
          <>
            <Text style={styles.resultText}>Error: {error}%</Text>
            <Text style={styles.resultText}>Result: {result}</Text>
          </>
        )}
        <View style={styles.errorContainer}>
          <View style={styles.inputContainer}>
            <View style={styles.row}>
              <Text style={styles.label}>Actual weight (kg):</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={actualWeight}
                onChangeText={setActualWeight}
              />
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Weigh feeder totalizer:</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={totalizer}
                onChangeText={setTotalizer}
              />
            </View>
          </View>
          <View style={{ marginTop: 10, marginBottom: 10 }}>
            <Button
              title="Calculate Error"
              color={colors.primaryDark}
              onPress={calculateFactor}
            />
          </View>
        </View>
        <View style={{ marginTop: 10, marginBottom: 10 }}>
          <Button
            title="Calculate Error"
            color={colors.primary}
            onPress={calculateFactor}
          />
        </View>
        <View style={styles.correctionFactor}>
          <Text style={styles.label}>Correction factor D02:</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            value={correctionFactor}
            onChangeText={setCorrectionFactor}
          />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default WeighFeeder;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background || "#F9F9F9",
  },
  resultText: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    color: colors.primaryDark || "#333",
  },
  row: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: "#444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    
  },
  correctionFactor: {
    flexDirection: "row",
    alignContent: "space-between",

    alignItems: "baseline",
    elevation: 2,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    alignSelf: "center",
  },
  errorContainer:{
    elevation: 2,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    
  },
  button:{
    borderRadius: 8,
  }
});
