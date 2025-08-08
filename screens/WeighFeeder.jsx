import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  SafeAreaView,
  TextInput,
  Keyboard,
  ScrollView,
  StatusBar,
} from "react-native";
import { colors } from "../constants/color";
import { KeyboardAvoidingView, Platform, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import React, { useState, useLayoutEffect } from "react";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const WeighFeeder = () => {
  const navigation = useNavigation();
  const [actualWeight, setActualWeight] = useState("");
  const [totalizer, setTotalizer] = useState("");
  const [oldCorrectionFactor, setOldCorrectionFactor] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
  //

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Weigh Feeder Error",
      headerStyle: {
        backgroundColor: colors.primary || "#34C759",
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontSize: 18,
        fontWeight: "600",
      },
      headerLeft: () => (
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.headerIconContainer}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerIconContainer}>
            <Ionicons name="calculator" size={24} color="#fff" />
          </View>
        </View>
      ),
    });
  }, [navigation]);
  //

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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={colors.primary || "#34C759"}
          />

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            bounces={true}
            alwaysBounceVertical={false}
          >
            {/* Header Section */}

            {/* Error Calculation Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Error Calculation</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Actual Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  value={actualWeight}
                  onChangeText={setActualWeight}
                  placeholder="Enter actual weight..."
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weigh Feeder Totalizer</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  value={totalizer}
                  onChangeText={setTotalizer}
                  placeholder="Enter totalizer value..."
                  placeholderTextColor="#999"
                />
              </View>

              <TouchableOpacity style={styles.button} onPress={calculateError}>
                <Text style={styles.buttonText}>Calculate Error</Text>
              </TouchableOpacity>
            </View>

            {/* Error Result Card */}
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
                    <Text style={styles.statusText}>
                      {getErrorStatus(error)}
                    </Text>
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
                      ? "✅ Weigh feeder is within acceptable range"
                      : (parseFloat(error) > 0.5 && parseFloat(error) <= 2.5) ||
                        (parseFloat(error) < -0.5 && parseFloat(error) >= -2.5)
                      ? "⚠️ Weight deviation detected - consider apply correction factor"
                      : "❌ Significant weight error  "}
                  </Text>
                </View>
              </View>
            )}

            {/* Correction Factor Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Correction Factor Calculation
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Current Correction Factor (D02)
                </Text>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  value={oldCorrectionFactor}
                  onChangeText={setOldCorrectionFactor}
                  onFocus={() => setShowModal(true)} // 👈 trigger modal
                  placeholder="Enter current factor..."
                  placeholderTextColor="#999"
                />
              </View>

              <TouchableOpacity style={styles.button} onPress={calculateFactor}>
                <Text style={styles.buttonText}>Calculate New Factor</Text>
              </TouchableOpacity>
            </View>

            {/* Factor Result Card */}
            {result !== null && result !== "Invalid input" && (
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>New Correction Factor</Text>
                  <View style={styles.factorBadge}>
                    <Text style={styles.factorBadgeText}>D02</Text>
                  </View>
                </View>

                <View style={styles.factorDisplay}>
                  <Text style={styles.factorLabel}>Updated Factor:</Text>
                  <Text style={styles.factorValue}>{result}</Text>
                </View>

                <View style={styles.factorInfo}>
                  <Text style={styles.factorInfoText}>
                    💡 Apply this new correction factor to improve weigh feeder
                    accuracy
                  </Text>
                </View>
              </View>
            )}

            {/* Invalid Input Message */}
            {result === "Invalid input" && (
              <View style={styles.errorMessageCard}>
                <Text style={styles.errorMessageText}>
                  ⚠️ Please enter valid numeric values for all fields
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
        <Modal visible={showModal} animationType="slide" transparent={true}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.inputLabel}>Current Correction Factor</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  value={oldCorrectionFactor}
                  onChangeText={setOldCorrectionFactor}
                  autoFocus
                />
                <TouchableOpacity
                  style={[styles.button, { marginTop: 20 }]}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.buttonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
 
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default WeighFeeder;

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
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: "#E1E5E9",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    backgroundColor: "#FAFBFC",
    color: "#333",
    fontWeight: "500",
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
    fontSize: 16,
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
  factorBadge: {
    backgroundColor: colors.primary || "#34C759",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  factorBadgeText: {
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
  factorDisplay: {
    alignItems: "center",
    marginBottom: 16,
  },
  factorLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  factorValue: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.primary || "#34C759",
  },
  factorInfo: {
    backgroundColor: "#F0F8FF",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary || "#34C759",
  },
  factorInfoText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  errorMessageCard: {
    backgroundColor: "#FFF3E0",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
    marginBottom: 16,
  },
  errorMessageText: {
    fontSize: 14,
    color: "#E65100",
    fontWeight: "500",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 15,
  },
  headerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "85%",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
});
