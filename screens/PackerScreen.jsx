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
import { Dimensions } from "react-native";

const PackerScreen = () => {
  const [actualWeight, setActualWeight] = useState("");
  const [totalizer, setTotalizer] = useState("");
  const [oldCorrectionFactor, setOldCorrectionFactor] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const { height } = Dimensions.get("window");

  const calculateError = () => {
    const weight = 50000;
    const total = parseFloat(totalizer);

    if (!isNaN(weight) && !isNaN(total) && total !== 0) {
      const error = (weight / total - 1) * 100;
      setError(error.toFixed(2));
    } else {
      setResult("Invalid input");
    }
  };

  const calculateFactor = () => {
    const weight = 50000;
    console.log("====================================");
    console.log("xxxxxxxxxxxxxxxxx");
    console.log("====================================");

    const total = parseFloat(totalizer);
    const factor = parseFloat(oldCorrectionFactor);
    console.log("====================================");
    console.log(total);
    console.log("====================================");

    if (!isNaN(error) && !isNaN(weight) && !isNaN(total) && factor !== 0) {
      const newFactor = (weight / total) * factor;
      setResult(newFactor.toFixed(4));
    } else {
      setResult("Invalid input");
    }
  };
  const getErrorColor = (value) => {
    const err = parseFloat(value);
    if (err >= -0.5 && err <= 0.5) return "#4CAF50";
    if ((err > 0.5 && err <= 2.5) || (err < -0.5 && err >= -2.5))
      return "#FF9800";
    return "#F44336";
  };

  const getErrorStatus = (value) => {
    const err = parseFloat(value);
    if (err >= -0.5 && err <= 0.5) return "Excellent";
    if ((err > 0.5 && err <= 2.5) || (err < -0.5 && err >= -2.5))
      return "Warning";
    return "Critical";
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={[styles.scroll]}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { minHeight: height }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}

          {/* Test Weight Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Test Weight</Text>
              <View style={styles.weightDisplay}>
                <Text style={styles.weightValue}>50,000</Text>
                <Text style={styles.weightUnit}>grams</Text>
              </View>
            </View>
          </View>

          {/* Input Card */}
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Packer Weight</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={totalizer}
              onChangeText={setTotalizer}
              placeholder="Enter packer weight..."
              placeholderTextColor="#999"
            />

            <TouchableOpacity style={styles.button} onPress={calculateError}>
              <Text style={styles.buttonText}>Calculate Error</Text>
            </TouchableOpacity>
          </View>

          {/* Result Card */}
          {error !== null && (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>Error Analysis</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getErrorColor(error) },
                  ]}
                >
                  <Text style={styles.statusText}>{getErrorStatus(error)}</Text>
                </View>
              </View>

              <View style={styles.errorDisplay}>
                <Text style={styles.errorLabel}>Error Percentage:</Text>
                <Text
                  style={[styles.errorValue, { color: getErrorColor(error) }]}
                >
                  {error}%
                </Text>
              </View>

              <View style={styles.errorInfo}>
                <Text style={styles.errorInfoText}>
                  {parseFloat(error) >= -0.5 && parseFloat(error) <= 0.5
                    ? "✅ Weight is within acceptable range"
                    : (parseFloat(error) > 0.5 && parseFloat(error) <= 2.5) ||
                      (parseFloat(error) < -0.5 && parseFloat(error) >= -2.5)
                    ? "⚠️ Weight deviation detected - consider calibration"
                    : "❌ Significant weight error - immediate calibration required"}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default PackerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || "#F8F9FA",
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 24,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primaryDark || "#1A1A1A",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 16,
  },
  weightDisplay: {
    alignItems: "center",
  },
  weightValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary || "#34C759",
    marginBottom: 4,
  },
  weightUnit: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  input: {
    borderWidth: 2,
    borderColor: "#E1E5E9",
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    backgroundColor: "#FAFBFC",
    textAlign: "center",
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.primary || "#34C759",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: colors.primary || "#34C759",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  resultCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  errorDisplay: {
    alignItems: "center",
    marginBottom: 16,
  },
  errorLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  errorValue: {
    fontSize: 36,
    fontWeight: "700",
  },
  errorInfo: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#E1E5E9",
  },
  errorInfoText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
});
