import React, { useState, useLayoutEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../constants/color";

function millivoltToTemperature_K(mv) {
  // Coefficients for Type K thermocouple (NIST ITS-90)
  // Piecewise equations based on mV range
  let coeffs;

  if (mv >= -5.891 && mv < 0.0) {
    // Range: -270°C to 0°C
    coeffs = [
      0.0, 2.5173462e1, -1.1662878, -1.0833638, -8.977354e-1, -3.7342377e-1,
      -8.6632643e-2, -1.0450598e-2, -5.1920577e-4,
    ];
  } else if (mv >= 0.0 && mv <= 20.644) {
    // Range: 0°C to 500°C
    coeffs = [
      0.0, 2.508355e1, 7.860106e-2, -2.503131e-1, 8.31527e-2, -1.228034e-2,
      9.804036e-4, -4.41303e-5, 1.057734e-6, -1.052755e-8,
    ];
  } else if (mv > 20.644 && mv <= 54.886) {
    // Range: 500°C to 1372°C
    coeffs = [
      -1.318058e2, 4.830222e1, -1.646031, 5.464731e-2, -9.650715e-4,
      8.802193e-6, -3.11081e-8,
    ];
  } else {
    return NaN; // Out of supported range
  }

  let t = 0;
  for (let i = 0; i < coeffs.length; i++) {
    t += coeffs[i] * Math.pow(mv, i);
  }

  return t; // Temperature in °C
}

const Thermocouple = () => {
  const navigation = useNavigation();
  const [input, setInput] = useState("0");
  const [result, setResult] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Type K Thermocouple",
      headerStyle: {
        backgroundColor: colors.primary || '#34C759',
      },
      headerTintColor: '#fff',
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
            <Ionicons name="pulse" size={24} color="#fff" />
          </View>
        </View>
      ),
    });
  }, [navigation]);

  const handleInputChange = (text) => {
    setInput(text);
    const value = parseFloat(text);
    if (!isNaN(value)) {
      const T = millivoltToTemperature_K(value);
      setResult(isNaN(T) ? "Invalid" : T.toFixed(2));
    } else {
      setResult(null);
    }
  };

  const getTemperatureColor = (temp) => {
    if (isNaN(temp) || temp === "Invalid") return "#F44336";
    const temperature = parseFloat(temp);
    if (temperature < 0) return "#2196F3"; // Blue for cold
    if (temperature > 5000) return "#FF5722"; // Orange for hot
    return "#4CAF50"; // Green for normal
  };

  const getTemperatureStatus = (temp) => {
    if (isNaN(temp) || temp === "Invalid") return "Invalid Input";
    const temperature = parseFloat(temp);
    if (temperature < 0) return "Cold";
    if (temperature > 500) return "Hot";
    return "Normal";
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary || '#34C759'} />
        
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Input Card */}
          <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <Ionicons name="create" size={20} color={colors.primary || '#34C759'} />
              <Text style={styles.inputLabel}>Input Millivolt Value</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                placeholder="0.000"
                placeholderTextColor="#999"
                value={input}
                onChangeText={handleInputChange}
              />
              <Text style={styles.mvUnit}>mV</Text>
            </View>
          </View>

          {/* Result Card */}
          {result !== null && (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View style={styles.resultTitleContainer}>
                  <Ionicons name="thermometer-outline" size={20} color={colors.primary || '#34C759'} />
                  <Text style={styles.resultTitle}>Temperature Result</Text>
                </View>
  
              </View>
              
              <View style={styles.temperatureDisplay}>
                <Text style={styles.temperatureLabel}>Calculated Temperature</Text>
                <View style={styles.temperatureValueContainer}>
                  <Text style={[styles.temperatureValue, { color: getTemperatureColor(result) }]}>
                    {result}
                  </Text>
                  <Text style={styles.temperatureUnit}>°C</Text>
                </View>
              </View>

              <View style={[styles.temperatureInfo, { borderLeftColor: getTemperatureColor(result) }]}>
                <Text style={styles.temperatureInfoText}>
                  {result === "Invalid" 
                    ? "❌ Millivolt value is outside supported range (-5.891 to 54.886 mV)"
                    : parseFloat(result) < 0 
                
                  }
                </Text>
              </View>
            </View>
          )}

          {/* Range Info Card */}
          <View style={styles.rangeCard}>
            <View style={styles.rangeHeader}>
              <Ionicons name="analytics" size={20} color={colors.primary || '#34C759'} />
              <Text style={styles.rangeTitle}>Operating Range</Text>
            </View>
            <View style={styles.rangeGrid}>
              <View style={styles.rangeItem}>
                <View style={styles.rangeIconContainer}>
                  <Ionicons name="snow" size={24} color="#2196F3" />
                </View>
                <Text style={styles.rangeLabel}>Minimum</Text>
                <Text style={styles.rangeValue}>-5.891 mV</Text>
                <Text style={styles.rangeTemp}>-270°C</Text>
              </View>
              <View style={styles.rangeItem}>
                <View style={styles.rangeIconContainer}>
                  <Ionicons name="flame" size={24} color="#FF5722" />
                </View>
                <Text style={styles.rangeLabel}>Maximum</Text>
                <Text style={styles.rangeValue}>54.886 mV</Text>
                <Text style={styles.rangeTemp}>1372°C</Text>
              </View>
            </View>
          </View>

          {/* Reference Values Card */}
          <View style={styles.referenceCard}>
            <View style={styles.referenceHeader}>
              <Ionicons name="list" size={20} color={colors.primary || '#34C759'} />
              <Text style={styles.referenceTitle}>Reference Values</Text>
            </View>
            <View style={styles.referenceGrid}>
              <View style={styles.referenceItem}>
                <View style={styles.refIconContainer}>
                  <Ionicons name="water" size={16} color="#2196F3" />
                </View>
                <Text style={styles.refTemp}>0°C</Text>
                <Text style={styles.refMv}>0.000 mV</Text>
              </View>
              <View style={styles.referenceItem}>
                <View style={styles.refIconContainer}>
                  <Ionicons name="thermometer" size={16} color="#4CAF50" />
                </View>
                <Text style={styles.refTemp}>100°C</Text>
                <Text style={styles.refMv}>4.096 mV</Text>
              </View>
              <View style={styles.referenceItem}>
                <View style={styles.refIconContainer}>
                  <Ionicons name="sunny" size={16} color="#FF9800" />
                </View>
                <Text style={styles.refTemp}>200°C</Text>
                <Text style={styles.refMv}>8.138 mV</Text>
              </View>
              <View style={styles.referenceItem}>
                <View style={styles.refIconContainer}>
                  <Ionicons name="flame" size={16} color="#FF5722" />
                </View>
                <Text style={styles.refTemp}>500°C</Text>
                <Text style={styles.refMv}>20.644 mV</Text>
              </View>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Type K Thermocouple</Text>
            <Text style={styles.infoText}>
              Type K thermocouples use Chromel (Ni-Cr) and Alumel (Ni-Al) alloys. 
              They provide accurate temperature measurements from -270°C to 1372°C 
              using NIST ITS-90 standard equations.
            </Text>
            <View style={styles.specsContainer}>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Temperature Range</Text>
                <Text style={styles.specValue}>-270°C to 1372°C</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Accuracy</Text>
                <Text style={styles.specValue}>±1.1°C to ±2.2°C</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default Thermocouple;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || "#F8F9FA",
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  headerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  inputCard: {
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
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: "#E1E5E9",
    borderRadius: 12,
    backgroundColor: '#FAFBFC',
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    fontSize: 24,
    color: "#333",
    textAlign: 'center',
    fontWeight: "600",
  },
  mvUnit: {
    fontSize: 24,
    color: '#666',
    marginLeft: 8,
    fontWeight: "500",
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginLeft: 8,
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
  temperatureDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  temperatureLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  temperatureValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  temperatureValue: {
    fontSize: 48,
    fontWeight: "700",
  },
  temperatureUnit: {
    fontSize: 24,
    fontWeight: "600",
    color: "#666",
    marginLeft: 8,
  },
  temperatureInfo: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  temperatureInfoText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  rangeCard: {
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
  rangeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'center',
  },
  rangeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  rangeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  rangeIconContainer: {
    marginBottom: 8,
  },
  rangeLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  rangeValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  rangeTemp: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  referenceCard: {
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
  referenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'center',
  },
  referenceTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  referenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  referenceItem: {
    width: '48%',
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  refIconContainer: {
    marginBottom: 6,
  },
  refTemp: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  refMv: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  infoCard: {
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
  infoTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
  specsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specItem: {
    flex: 1,
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  specValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});
