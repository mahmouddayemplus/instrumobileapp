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
import { TouchableOpacity } from "react-native";

const WeighFeeder = () => {
  const [actualWeight, setActualWeight] = useState("");
  const [totalizer, setTotalizer] = useState("");
  const [oldCorrectionFactor, setOldCorrectionFactor] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const calculateError = () => {
    const weight = parseFloat(actualWeight);
    const total = parseFloat(totalizer);

    if (!isNaN(weight) && !isNaN(total) && total !== 0) {
      const error = (weight / total - 1) * 100;
      setError(error.toFixed(2));
    } else {
      setResult("Invalid input");
    }
  };
  const calculateFactor = () => {
    const weight = parseFloat(actualWeight);
    const total = parseFloat(totalizer);
    const factor = parseFloat(oldCorrectionFactor);

    if (!isNaN(error) && !isNaN(weight) && !isNaN(total) && factor !== 0) {
 
      const newFactor = (weight / total ) * factor;
      setResult(newFactor.toFixed(4));
   
    } else {
      setResult("Invalid input");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
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
          {error !== null && (
            <>
              <Text style={styles.resultText}>Error: {error}%</Text>
              {/* <Text style={styles.resultText}>Result: {result}</Text> */}
            </>
          )}
          <View style={{ marginTop: 10, marginBottom: 10 }}>
            <TouchableOpacity style={styles.button} onPress={calculateError}>
              <Text style={styles.buttonText}>Calculate Error</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.errorContainer}>
          <View style={styles.inputContainer}>
            <View style={styles.row}>
              <Text style={styles.label}>Correction factor D02:</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={oldCorrectionFactor}
                onChangeText={setOldCorrectionFactor}
              />
            </View>
          </View>
          {result !== null && (
            <>
              <Text style={styles.resultText}>New Factor: {result} </Text>
              {/* <Text style={styles.resultText}>Result: {result}</Text> */}
            </>
          )}
          <View style={{ marginTop: 10, marginBottom: 10 }}>
            <TouchableOpacity style={styles.button} onPress={calculateFactor}>
              <Text style={styles.buttonText}>Calculate New Factor</Text>
            </TouchableOpacity>
          </View>
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
  errorContainer: {
    elevation: 2,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.primary || "#34C759",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 5,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
