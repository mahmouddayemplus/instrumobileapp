import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  TextInput,
  Keyboard,
  ScrollView,
  StatusBar,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getFirestore, collection, doc, updateDoc, arrayUnion, getDoc, setDoc } from "firebase/firestore";
import { useSelector } from "react-redux";

import { colors } from "../constants/color";
import React, { useState, useLayoutEffect } from "react";
import { TouchableOpacity } from "react-native";
import { Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";

const PackerScreen = () => {
  const user = useSelector((state) => state.auth.user);
  // console.log(user.companyId ,displayName)

  const [actualWeight, setActualWeight] = useState("");
  const [totalizer, setTotalizer] = useState("");
  const [oldCorrectionFactor, setOldCorrectionFactor] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [inputError, setInputError] = useState(false);
  const { height } = Dimensions.get("window");
  const navigation = useNavigation();

  // Packer filter states
  const [selectedPacker, setSelectedPacker] = useState("Packer-1");
  const [showPackerDropdown, setShowPackerDropdown] = useState(false);
  const packerOptions = ["Packer-1", "Packer-2", "Packer-3", "Packer-4", "Ventocheck-Packer-1", "Ventocheck-Packer-2", "Ventocheck-Packer-3", "Ventocheck-Packer-4"];

  // Spout input states for regular packers
  const [spoutValues, setSpoutValues] = useState({
    spout1: "",
    spout2: "",
    spout3: "",
    spout4: "",
    spout5: "",
    spout6: "",
    spout7: "",
    spout8: "",
  });

  // Trial input states for Ventocheck packers
  const [trialValues, setTrialValues] = useState({
    trial1: "",
    trial2: "",
    trial3: "",
  });

  // Loading state for saving data
  const [isSaving, setIsSaving] = useState(false);

  // Function to handle packer selection
  const handlePackerSelection = (packer) => {
    setSelectedPacker(packer);
    setShowPackerDropdown(false);
    // Clear spout values when changing packer
    setSpoutValues({
      spout1: "",
      spout2: "",
      spout3: "",
      spout4: "",
      spout5: "",
      spout6: "",
      spout7: "",
      spout8: "",
    });
    // Clear trial values when changing packer
    setTrialValues({
      trial1: "",
      trial2: "",
      trial3: "",
    });
  };

  // Function to handle spout input changes
  const handleSpoutChange = (spoutKey, value) => {
    // Allow only numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");
    // Prevent multiple decimal points
    const parts = numericValue.split('.');
    const formattedValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;

    setSpoutValues(prev => ({
      ...prev,
      [spoutKey]: formattedValue
    }));
  };

  // Function to handle trial input changes
  const handleTrialChange = (trialKey, value) => {
    // Allow only numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");
    // Prevent multiple decimal points
    const parts = numericValue.split('.');
    const formattedValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;

    setTrialValues(prev => ({
      ...prev,
      [trialKey]: formattedValue
    }));
  };

  // Function to calculate error for each spout
  const calculateSpoutError = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue === 0) return "";
    return ((50 / numValue) - 1) * 100;
  };

  // Function to save calibration data to Firestore
  const saveCalibrationData = async () => {
    try {
      setIsSaving(true);

      // Determine which data to use based on selected packer
      const isVentocheck = selectedPacker.includes("Ventocheck");
      const dataToSave = isVentocheck ? trialValues : spoutValues;

      // Check if there's any data to save
      const hasData = Object.values(dataToSave).some(value => value.trim() !== "");

      if (!hasData) {
        Alert.alert("No Data", "Please enter at least one value before saving.");
        setIsSaving(false);
        return;
      }

      // Prepare the calibration data
      const calibrationData = [];

      Object.entries(dataToSave).forEach(([key, value]) => {
        if (value.trim() !== "") {
          const numValue = parseFloat(value);
          const error = calculateSpoutError(value);

          calibrationData.push({
            input: numValue,
            error: parseFloat(error.toFixed(2)),
            // timestamp: new Date().toISOString(),
          });
        }
      });

      if (calibrationData.length === 0) {
        Alert.alert("No Valid Data", "Please enter valid numeric values.");
        setIsSaving(false);
        return;
      }

      // Get Firestore instance
      const db = getFirestore();
      const packerDocRef = doc(db, "packers_calibration", selectedPacker);

      // Check if document exists
      const docSnap = await getDoc(packerDocRef);

      if (docSnap.exists()) {
        // Document exists, update it by adding new calibration data
        await updateDoc(packerDocRef, {
          calibrations: arrayUnion({
            data: calibrationData,
            user_id: user.companyId,
            user_name: user.displayName,
            created_at: new Date().toISOString(),


          })
        });
      } else {
        // Document doesn't exist, create it
        await setDoc(packerDocRef, {
          packer_name: selectedPacker,
          calibrations: [{
            data: calibrationData,
            created_at: new Date().toISOString(),
            user_id: user.companyId,
            user_name: user.displayName,
          }]
        });
      }

      Alert.alert(
        "Success",
        `Calibration data saved successfully for ${selectedPacker}!\n\nSaved ${calibrationData.length} measurements.`,
        [
          {
            text: "OK",
            onPress: () => {
              // Clear the inputs after successful save
              if (isVentocheck) {
                setTrialValues({
                  trial1: "",
                  trial2: "",
                  trial3: "",
                });
              } else {
                setSpoutValues({
                  spout1: "",
                  spout2: "",
                  spout3: "",
                  spout4: "",
                  spout5: "",
                  spout6: "",
                  spout7: "",
                  spout8: "",
                });
              }
            }
          }
        ]
      );

    } catch (error) {
      console.error("Error saving calibration data:", error);
      Alert.alert("Error", "Failed to save calibration data. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  ///
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Packer|VentoCheck",
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

  ///

  const handleTotalizerChange = (text) => {
    // Remove any non-numeric characters and commas
    const numericText = text.replace(/[^0-9]/g, "");

    // Limit to 5 digits
    if (numericText.length <= 5) {
      // Format with comma after first 2 digits
      let formattedText = numericText;
      if (numericText.length >= 3) {
        formattedText = numericText.slice(0, 2) + "," + numericText.slice(2);
      }

      setTotalizer(formattedText);
      setInputError(false);
    }
  };

  const validateInput = () => {
    // Remove comma for validation
    const numericValue = totalizer.replace(/,/g, "");
    if (numericValue.length !== 5) {
      setInputError(true);
      return false;
    }
    setInputError(false);
    return true;
  };

  const calculateError = () => {
    if (!validateInput()) {
      return;
    }

    const weight = 50000;
    // Remove comma before parsing
    const total = parseFloat(totalizer.replace(/,/g, ""));

    if (!isNaN(weight) && !isNaN(total) && total !== 0) {
      const error = (weight / total - 1) * 100;
      setError(error.toFixed(2));
    } else {
      setResult("Invalid input");
    }
  };

  const calculateFactor = () => {
    const weight = 50000;

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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >


      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor={colors.primary || '#34C759'} />

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            bounces={true}
            alwaysBounceVertical={false}
          >
            {/* Header Section */}

            {/* Navigation Button */}
            <View style={styles.navigationContainer}>
              <TouchableOpacity
                style={styles.navigationButton}
                onPress={() => navigation.navigate('PackersHistory')}
              >
                <Ionicons name="time" size={20} color="#fff" />
                <Text style={styles.navigationButtonText}>View History</Text>
              </TouchableOpacity>
            </View>

            {/* Packer Filter Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Select Machine</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowPackerDropdown(true)}
              >
                <Text style={styles.dropdownText}>{selectedPacker}</Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Spout Inputs Card - Only show for regular packers */}
            {selectedPacker && !selectedPacker.includes("Ventocheck") && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Spout Calibration</Text>
                <Text style={styles.subtitle}>Test Weight: 50 grams</Text>

                {Object.keys(spoutValues).map((spoutKey, index) => {
                  const spoutNumber = index + 1;
                  const value = spoutValues[spoutKey];
                  const error = calculateSpoutError(value);

                  return (
                    <View key={spoutKey} style={styles.spoutRow}>
                      <View style={styles.spoutLabelContainer}>
                        <Text style={styles.spoutLabel}>Spout{spoutNumber}</Text>
                      </View>
                      <View style={styles.spoutInputContainer}>
                        <TextInput
                          style={styles.spoutInput}
                          keyboardType="numeric"
                          value={value}
                          onChangeText={(text) => handleSpoutChange(spoutKey, text)}
                          placeholder="0.0"
                          placeholderTextColor="#999"
                        />
                      </View>
                      <View style={styles.errorContainer}>
                        <Text style={[
                          styles.errorText,
                          { color: error !== "" ? getErrorColor(error.toFixed(2)) : "#999" }
                        ]}>
                          {error !== "" ? `${error.toFixed(2)}%` : "—"}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Trial Inputs Card - Only show for Ventocheck packers */}
            {selectedPacker && selectedPacker.includes("Ventocheck") && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Trial Calibration</Text>
                <Text style={styles.subtitle}>Test Weight: 50 grams</Text>

                {Object.keys(trialValues).map((trialKey, index) => {
                  const trialNumber = index + 1;
                  const value = trialValues[trialKey];
                  const error = calculateSpoutError(value);

                  return (
                    <View key={trialKey} style={styles.spoutRow}>
                      <View style={styles.spoutLabelContainer}>
                        <Text style={styles.spoutLabel}>Trial-{trialNumber}</Text>
                      </View>
                      <View style={styles.spoutInputContainer}>
                        <TextInput
                          style={styles.spoutInput}
                          keyboardType="numeric"
                          value={value}
                          onChangeText={(text) => handleTrialChange(trialKey, text)}
                          placeholder="0.0"
                          placeholderTextColor="#999"
                        />
                      </View>
                      <View style={styles.errorContainer}>
                        <Text style={[
                          styles.errorText,
                          { color: error !== "" ? getErrorColor(error.toFixed(2)) : "#999" }
                        ]}>
                          {error !== "" ? `${error.toFixed(2)}%` : "—"}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Save Button - Show when there's data to save */}
            {selectedPacker && (
              <View style={styles.saveButtonContainer}>
                <TouchableOpacity
                  style={[styles.saveButton, isSaving && styles.disabledButton]}
                  onPress={saveCalibrationData}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <View style={styles.loadingContainer}>
                      <Text style={styles.saveButtonText}>Saving...</Text>
                    </View>
                  ) : (
                    <>
                      <Ionicons name="cloud-upload" size={20} color="#fff" style={styles.buttonIcon} />
                      <Text style={styles.saveButtonText}>Save to Cloud</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Test Weight Card */}
            {/* <View style={styles.card_top}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Test Weight</Text>
              <View style={styles.weightDisplay}>
                <Text style={styles.weightValue}>50,000</Text>
                <Text style={styles.weightUnit}>grams</Text>
              </View>
            </View>
          </View>

          {/* Input Card */}
            {/* <View style={styles.card}>
            {error !== null && (
              <View style={styles.errorSection}>
                <View style={styles.errorHeader}>
                  <Text style={styles.errorTitle}>Calculated Error</Text>
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
              </View> */}
            {/* )}

            <TextInput
              style={[styles.input, inputError && styles.inputErrorBorder]}
              keyboardType="numeric"
              value={totalizer}
              onChangeText={handleTotalizerChange}
              placeholder="XX,XXX"
              placeholderTextColor="#999"
              maxLength={6}
            />

            {inputError && (
              <View style={styles.inputError}>
                <Text style={styles.inputErrorText}>
                  Please enter exactly 5 digits.
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.button} onPress={calculateError}>
              <Text style={styles.buttonText}>Calculate Error</Text>
            </TouchableOpacity>
          </View> */}
          </ScrollView>

          {/* Packer Dropdown Modal */}
          <Modal
            visible={showPackerDropdown}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowPackerDropdown(false)}
          >
            <TouchableWithoutFeedback onPress={() => setShowPackerDropdown(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.dropdownModal}>
                  <Text style={styles.modalTitle}>Select Packer</Text>
                  {packerOptions.map((packer, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dropdownOption,
                        selectedPacker === packer && styles.selectedOption
                      ]}
                      onPress={() => handlePackerSelection(packer)}
                    >
                      <Text style={[
                        styles.optionText,
                        selectedPacker === packer && styles.selectedOptionText
                      ]}>
                        {packer}
                      </Text>
                      {selectedPacker === packer && (
                        <Ionicons name="checkmark" size={20} color={colors.primary || "#34C759"} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    // alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "baseline",
    flex: 1,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 16,
  },
  weightDisplay: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
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
    marginLeft: 20,
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
  card_top: {
    flexDirection: "row",
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
  error: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "baseline",
  },
  errorSection: {
    marginBottom: 20,
  },
  errorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  inputError: {
    marginTop: 10,
    alignItems: "center",
  },
  inputErrorText: {
    color: "#F44336",
    fontSize: 14,
  },
  inputErrorBorder: {
    borderColor: "#F44336",
    borderWidth: 2,
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
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E1E5E9",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#FAFBFC",
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownModal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    margin: 20,
    minWidth: 250,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  dropdownOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 5,
  },
  selectedOption: {
    backgroundColor: "#E8F5E8",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  selectedOptionText: {
    color: colors.primary || "#34C759",
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    fontStyle: "italic",
  },
  spoutRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
  },
  spoutLabelContainer: {
    flex: 1,
    marginRight: 12,
  },
  spoutLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  spoutInputContainer: {
    flex: 2,
    marginRight: 12,
  },
  spoutInput: {
    borderWidth: 1,
    borderColor: "#E1E5E9",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FAFBFC",
    textAlign: "center",
    color: "#333",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    fontWeight: "600",
  },
  saveButtonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: colors.primary || "#34C759",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary || "#34C759",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: "#ccc",
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  navigationContainer: {
    marginBottom: 16,
  },
  navigationButton: {
    backgroundColor: colors.primary || "#34C759",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary || "#34C759",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  navigationButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
});
