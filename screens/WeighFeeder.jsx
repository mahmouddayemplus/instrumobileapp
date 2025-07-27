import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  SafeAreaView,
  TextInput,
  Keyboard,
  ScrollView,
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
      const newFactor = (weight / total) * factor;
      setResult(newFactor.toFixed(4));
    } else {
      setResult("Invalid input");
    }
  };
  const getErrorColor = (value) => {
    const err = parseFloat(value);
    if (err >= -0.5 && err <= 0.5) return "green";
    if ((err > 0.5 && err <= 2.5) || (err < -0.5 && err >= -2.5))
      return "orange";
    return "red";
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.card}>
            <Text style={styles.label}>Actual weight (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={actualWeight}
              onChangeText={setActualWeight}
            />

            <Text style={styles.label}>Weigh feeder totalizer</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={totalizer}
              onChangeText={setTotalizer}
            />

            <TouchableOpacity style={styles.button} onPress={calculateError}>
              <Text style={styles.buttonText}>Calculate Error</Text>
            </TouchableOpacity>
            {error !== null && (
              <>
                <Text
                  style={[styles.resultText, { color: getErrorColor(error) }]}
                >
                  Error: {error}%
                </Text>
              </>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Correction factor D02</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={oldCorrectionFactor}
              onChangeText={setOldCorrectionFactor}
            />

            <TouchableOpacity style={styles.button} onPress={calculateFactor}>
              <Text style={styles.buttonText}>Calculate New Factor</Text>
            </TouchableOpacity>

            {result !== null && (
              <Text style={styles.resultText}>New Factor: {result}</Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default WeighFeeder;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || "#F9F9F9",
  },
  scroll: {
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: colors.primaryDark || "#333",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: colors.primary || "#34C759",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resultText: {
    marginTop: 16,
    fontSize: 20,
    textAlign: "center",
    color: colors.primaryDark || "#1B5E20",
    fontWeight: "bold",
  },
});
