import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  TextInput,
  Keyboard,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../constants/color";
import { KeyboardAvoidingView, Platform, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import React, { useState, useLayoutEffect } from "react";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const WeighFeeder = () => {
  const navigation = useNavigation();
  const [truckWeightFull, settruckWeightFull] = useState("");
  const [truckWeightEmpty, settruckWeightEmpty] = useState("");
  const [actualWeight, setActualWeight] = useState("");
  const [totalizer, setTotalizer] = useState("");
  const [oldCorrectionFactor, setOldCorrectionFactor] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Auto-calculate actual weight when truck weights are provided
  const updateActualWeight = (fullWeight, emptyWeight) => {
    if (fullWeight.trim() && emptyWeight.trim()) {
      const full = parseFloat(fullWeight);
      const empty = parseFloat(emptyWeight);
      
      if (!isNaN(full) && !isNaN(empty) && full > empty) {
        const calculatedWeight = full - empty;
        setActualWeight(calculatedWeight.toString());
      } else if (!isNaN(full) && !isNaN(empty)) {
        // Clear actual weight if invalid calculation
        setActualWeight("");
      }
    } else {
      // If either truck weight is cleared, don't auto-clear actual weight
      // This allows manual entry when truck weights are not available
    }
  };

  // Check if actual weight input should be disabled
  const isActualWeightDisabled = truckWeightFull.trim() && truckWeightEmpty.trim();

  const calculateError = () => {
    // Clear previous validation errors
    setValidationError("");
    setError(null);
    setResult(null);

    let weight = 0;
    if (truckWeightFull.trim() && truckWeightEmpty.trim()) {
      const truckWeightWithMaterial = parseFloat(truckWeightFull);
      const truckTare = parseFloat(truckWeightEmpty);

      // Validation: Check if inputs are valid numbers
      if (isNaN(truckWeightWithMaterial) || isNaN(truckTare)) {
        setValidationError("Please enter valid numeric values for truck weights.");
        return;
      }

      // Validation: Full weight must be greater than empty weight
      if (truckWeightWithMaterial <= truckTare) {
        setValidationError("Truck full weight must be greater than truck empty weight. Please check your values.");
        return;
      }

      weight = truckWeightWithMaterial - truckTare;
 
      setActualWeight(weight.toString());
    } else {
      weight = parseFloat(actualWeight);
      
      // Validation: Check if actual weight is provided when truck weights are not
      if (!actualWeight.trim()) {
        setValidationError("Please provide either truck weights (empty & full) or actual weight.");
        return;
      }
      
      if (isNaN(weight)) {
        setValidationError("Please enter a valid numeric value for actual weight.");
        return;
      }
    }

    const total = parseFloat(totalizer);

    // Validation: Check totalizer value
    if (!totalizer.trim() || isNaN(total)) {
      setValidationError("Please enter a valid numeric value for weigh feeder totalizer.");
      return;
    }

    if (total === 0) {
      setValidationError("Weigh feeder totalizer cannot be zero.");
      return;
    }

    if (!isNaN(weight) && !isNaN(total) && total !== 0) {
      const error = (weight / total - 1) * 100;
      setError(error.toFixed(2));
    } else {
      setValidationError("Invalid input values. Please check all fields.");
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
    // Clear previous validation errors
    setValidationError("");
    
    const weight = parseFloat(actualWeight);
    const total = parseFloat(totalizer);
    const factor = parseFloat(oldCorrectionFactor);

    // Validation checks
    if (!actualWeight.trim() || isNaN(weight)) {
      setValidationError("Please enter a valid actual weight value.");
      return;
    }

    if (!totalizer.trim() || isNaN(total)) {
      setValidationError("Please enter a valid weigh feeder totalizer value.");
      return;
    }

    if (!oldCorrectionFactor.trim() || isNaN(factor)) {
      setValidationError("Please enter a valid current correction factor.");
      return;
    }

    if (total === 0) {
      setValidationError("Weigh feeder totalizer cannot be zero.");
      return;
    }

    if (factor === 0) {
      setValidationError("Current correction factor cannot be zero.");
      return;
    }

    if (!isNaN(weight) && !isNaN(total) && !isNaN(factor) && total !== 0 && factor !== 0) {
      const newFactor = (weight / total) * factor;
      setResult(newFactor.toFixed(4));
    } else {
      setValidationError("Invalid input values. Please check all fields.");
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

  const clearAllInputs = () => {
    settruckWeightFull("");
    settruckWeightEmpty("");
    setActualWeight("");
    setTotalizer("");
    setOldCorrectionFactor("");
    setResult(null);
    setError(null);
    setValidationError("");
  };

  return (
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

          {/* Validation Error Card */}
          {validationError && (
            <View style={styles.validationErrorCard}>
              <View style={styles.validationErrorHeader}>
                <Ionicons name="warning" size={20} color="#F44336" />
                <Text style={styles.validationErrorTitle}>Input Validation</Text>
              </View>
              <Text style={styles.validationErrorText}>{validationError}</Text>
            </View>
          )}

          {/* Clear All Button */}
          {/* <View style={styles.clearButtonContainer}>
            <TouchableOpacity style={styles.clearButton} onPress={clearAllInputs}>
              <Ionicons name="refresh-outline" size={20} color="#666" />
              <Text style={styles.clearButtonText}>Clear All Fields</Text>
            </TouchableOpacity>
          </View> */}

          {/* Error Calculation Card */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Error Calculation</Text>
              {/* //capture truck weight empty  */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Truck Empty Weight (kg)</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.inputWithClear,
                      validationError && validationError.includes("truck empty") ? styles.inputError : null
                    ]}
                    keyboardType="decimal-pad"
                    value={truckWeightEmpty}
                    onChangeText={(text) => {
                      settruckWeightEmpty(text);
                      if (validationError) setValidationError("");
                      // Auto-update actual weight
                      updateActualWeight(truckWeightFull, text);
                    }}
                    placeholder="Enter Truck Empty weight"
                    placeholderTextColor="#999"
                  />
                  {truckWeightEmpty.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearIcon}
                      onPress={() => {
                        settruckWeightEmpty("");
                        updateActualWeight(truckWeightFull, "");
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Truck Full Weight (kg)</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.inputWithClear,
                      validationError && validationError.includes("truck full") ? styles.inputError : null
                    ]}
                    keyboardType="decimal-pad"
                    value={truckWeightFull}
                    onChangeText={(text) => {
                      settruckWeightFull(text);
                      if (validationError) setValidationError("");
                      // Auto-update actual weight
                      updateActualWeight(text, truckWeightEmpty);
                    }}
                    placeholder="Enter Truck full weight"
                    placeholderTextColor="#999"
                  />
                  {truckWeightFull.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearIcon}
                      onPress={() => {
                        settruckWeightFull("");
                        updateActualWeight("", truckWeightEmpty);
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
 

              <View style={styles.inputGroup}>
                <View style={styles.inputLabelContainer}>
                  <Text style={styles.inputLabel}>Actual Weight (kg)</Text>
                  {isActualWeightDisabled && (
                    <Text style={styles.autoCalculatedLabel}>Auto-calculated</Text>
                  )}
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.inputWithClear,
                      validationError && validationError.includes("actual weight") ? styles.inputError : null,
                      isActualWeightDisabled ? styles.inputDisabled : null,
                      // { fontSize: 16 } // You can change this value (e.g., 14, 18, 20)
                    ]}
                    keyboardType="decimal-pad"
                    value={actualWeight}
                    onChangeText={(text) => {
                      if (!isActualWeightDisabled) {
                        setActualWeight(text);
                        if (validationError) setValidationError("");
                      }
                    }}
                    placeholder={isActualWeightDisabled ? "Calculated from truck weights" : "Enter actual weight..."}
                    placeholderTextColor={isActualWeightDisabled ? "#ccc" : "#999"}
                  
                    editable={!isActualWeightDisabled}
                  />
                  {actualWeight.length > 0 && !isActualWeightDisabled && (
                    <TouchableOpacity
                      style={styles.clearIcon}
                      onPress={() => setActualWeight("")}
                    >
                      <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weigh Feeder Totalizer</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.inputWithClear,
                      validationError && validationError.includes("totalizer") ? styles.inputError : null
                    ]}
                    keyboardType="decimal-pad"
                    value={totalizer}
                    onChangeText={(text) => {
                      setTotalizer(text);
                      if (validationError) setValidationError("");
                    }}
                    placeholder="Enter totalizer value..."
                    placeholderTextColor="#999"
                  />
                  {totalizer.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearIcon}
                      onPress={() => setTotalizer("")}
                    >
                      <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <TouchableOpacity style={styles.button} onPress={calculateError}>
                <Text style={styles.buttonText}>Calculate Error</Text>
              </TouchableOpacity>

              {/* Secondary Clear Button in Card */}
              <TouchableOpacity style={styles.secondaryButton} onPress={clearAllInputs}>
                <Ionicons name="trash-outline" size={16} color="#666" />
                <Text style={styles.secondaryButtonText}>Reset Fields</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
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
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.inputWithClear,
                    validationError && validationError.includes("correction factor") ? styles.inputError : null
                  ]}
                  keyboardType="decimal-pad"
                  value={oldCorrectionFactor}
                  onChangeText={(text) => {
                    setOldCorrectionFactor(text);
                    if (validationError) setValidationError("");
                  }}
                  onFocus={() => setShowModal(true)} // 👈 trigger modal
                  placeholder="Enter current factor..."
                  placeholderTextColor="#999"
                />
                {oldCorrectionFactor.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearIcon}
                    onPress={() => setOldCorrectionFactor("")}
                  >
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={calculateFactor}>
              <Text style={styles.buttonText}>Calculate New Factor</Text>
            </TouchableOpacity>

            {/* Secondary Clear Button in Card */}
            <TouchableOpacity style={styles.secondaryButton} onPress={clearAllInputs}>
              <Ionicons name="trash-outline" size={16} color="#666" />
              <Text style={styles.secondaryButtonText}>Reset Fields</Text>
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
  validationErrorCard: {
    backgroundColor: "#FFEBEE",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
    marginBottom: 16,
  },
  validationErrorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  validationErrorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F44336",
    marginLeft: 8,
  },
  validationErrorText: {
    fontSize: 14,
    color: "#C62828",
    lineHeight: 20,
  },
  inputError: {
    borderColor: "#F44336",
    borderWidth: 2,
    backgroundColor: "#FFEBEE",
  },
  inputContainer: {
    position: "relative",
    justifyContent: "center",
  },
  inputWithClear: {
    borderWidth: 2,
    borderColor: "#E1E5E9",
    borderRadius: 12,
    padding: 16,
    paddingRight: 45, // Make room for clear button
    fontSize: 18,
    backgroundColor: "#FAFBFC",
    color: "#333",
    fontWeight: "500",
  },
  clearIcon: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
    padding: 4,
  },
  inputDisabled: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E0E0E0",
    color: "#999",
  },
  inputLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  autoCalculatedLabel: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  clearButtonContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E1E5E9",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  clearButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E1E5E9",
    marginTop: 12,
  },
  secondaryButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
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
