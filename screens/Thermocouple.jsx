import React, { useState, useLayoutEffect } from "react";
import Slider from "@react-native-community/slider"; // make sure installed

import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Switch,
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
function temperatureToMillivolt_K(temp) {
  let coeffs;

  if (temp >= -270 && temp < 0) {
    // Range: -270°C to 0°C
    coeffs = [
      0.0, 3.9450128025e-2, 2.3622373598e-5, -3.2858906784e-7, -4.9904828777e-9,
      -6.7509059173e-11, -5.7410327428e-13, -3.1088872894e-15,
      -1.0451609365e-17, -1.9889266878e-20, -1.6322697486e-23,
    ];
  } else if (temp >= 0 && temp <= 1372) {
    // Range: 0°C to 1372°C
    coeffs = [
      -1.7600413686e-2, 3.8921204975e-2, 1.8558770032e-5, -9.9457592874e-8,
      3.1840945719e-10, -5.6072844889e-13, 5.6075059059e-16, -3.2020720003e-19,
      9.7151147152e-23, -1.2104721275e-26,
    ];
  } else {
    return NaN; // Out of range
  }

  let mv = 0;
  for (let i = 0; i < coeffs.length; i++) {
    mv += coeffs[i] * Math.pow(temp, i);
  }

  return mv; // in millivolts
}

const Thermocouple = () => {
  const navigation = useNavigation();
  const [input, setInput] = useState("0");
  const [result, setResult] = useState(null);
  const [isReverse, setIsReverse] = useState(false); // false = Ω -> °C, true = °C -> Ω
  const unitOutLabel = !isReverse ? "°C" : "mV";
  const inputLabel = isReverse ? "Temperature" : "milliVolt";
  const unitLabel = isReverse ? "°C" : "mV";
  const resultTitle = isReverse ? "milliVolt" : "Temperature";
  // const minMv = -5.891;
  const minMv = 0;
  const maxMv = 54.886;
  const minTemp = 0;
  // const minTemp = -270;
  const maxTemp = 1372;
  const SCALE_STEPS = 6;

  const minimumValue = !isReverse ? minMv : minTemp;
  const maximumValue = !isReverse ? maxMv : maxTemp;
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Type K Thermocouple",
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
      if (!isReverse) {
        // Ω -> °C
        const T = millivoltToTemperature_K(value);
        setResult(isNaN(T) ? "Invalid" : T.toFixed(2));
      } else {
        // °C -> Ω
        const mv = temperatureToMillivolt_K(value);
        setResult(isNaN(mv) ? "I nvalid" : mv.toFixed(3));
      }
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
 
  const toggleReverse = () => {
    const currentValue = parseFloat(input);

    if (!isNaN(currentValue)) {
      if (!isReverse) {
        // Switching from mv → °C to °C → mv
        const newTemp = Math.round(millivoltToTemperature_K(currentValue));
        if (!isNaN(newTemp)) {
          const newMv = temperatureToMillivolt_K(newTemp);
          setIsReverse(true);
          setInput(newTemp.toFixed(2));
          setResult(newMv.toFixed(3));
          return;
        }
      } else {
        // Switching from °C → mv to mv → °C
        const newMv = Math.round(temperatureToMillivolt_K(currentValue));
        const newT = millivoltToTemperature_K(newMv);
        if (!isNaN(newT)) {
          setIsReverse(false);
          setInput(newMv.toFixed(2));
          setResult(newT.toFixed(2));
          return;
        }
      }
    }

    // Fallback if conversion fails or invalid input
    setIsReverse(!isReverse);
    setInput("");
    setResult(null);
  };

  const onSliderComplete = (value) => {
    const txt = value.toFixed(3);
    if (!isReverse) {
      // slider is mv

      setInput(txt);
      const T = millivoltToTemperature_K(value);
      setResult(isNaN(T) ? "Invalid" : T.toFixed(1));
    } else {
      // slider is temperature

      setInput(txt);
      const mv = temperatureToMillivolt_K(value);
      setResult(isNaN(mv) ? "Invalid" : mv.toFixed(3));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary || "#34C759"}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>
            {isReverse ? "°C → mv" : "mv → °C"}
          </Text>
          <Switch
            value={isReverse}
            onValueChange={toggleReverse}
            trackColor={{ true: colors.primary || "#34C759", false: "#ccc" }}
            thumbColor={isReverse ? "#fff" : "#fff"}
          />
        </View>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {/* Input Card */}
          <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <Ionicons
                name="create"
                size={20}
                color={colors.primary || "#34C759"}
              />
              <Text style={styles.inputLabel}>Input {inputLabel}</Text>
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
              <Text style={styles.mvUnit}>{unitLabel}</Text>
            </View>
            <Slider
              style={{ marginTop: 16 }}
              minimumValue={minimumValue}
              maximumValue={maximumValue}
              step={0.001}
              value={parseFloat(input) || 0}
              onSlidingComplete={onSliderComplete}
              minimumTrackTintColor={colors.primary || "#34C759"}
              maximumTrackTintColor="#ccc"
            />
            <View style={styles.rulerContainer}>
              {Array.from({ length: SCALE_STEPS + 1 }, (_, i) => {
                const val = (maximumValue / SCALE_STEPS) * i;
                return (
                  <View key={i} style={styles.tickContainer}>
                    <View style={styles.tick} />
                    <Text style={styles.tickLabel}>{Math.round(val)}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </TouchableWithoutFeedback>
        {/* Result Card */}
        {result !== null && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={styles.resultTitleContainer}>
                <Ionicons
                  name="thermometer-outline"
                  size={20}
                  color={colors.primary || "#34C759"}
                />
                <Text style={styles.resultTitle}>{resultTitle} Result</Text>
              </View>
            </View>

            <View style={styles.temperatureDisplay}>
              <Text style={styles.temperatureLabel}>
                Calculated {resultTitle}
              </Text>
              <View style={styles.temperatureValueContainer}>
                <Text
                  style={[
                    styles.temperatureValue,
                    { color: getTemperatureColor(result) },
                  ]}
                >
                  {result}
                </Text>
                <Text style={styles.temperatureUnit}>{unitOutLabel}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Range Info Card */}
        <View style={styles.rangeCard}>
          <View style={styles.rangeHeader}>
            <Ionicons
              name="analytics"
              size={20}
              color={colors.primary || "#34C759"}
            />
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
            <Ionicons
              name="list"
              size={20}
              color={colors.primary || "#34C759"}
            />
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
  );
};

export default Thermocouple;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || "#F8F9FA",
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E1E5E9",
    borderRadius: 12,
    backgroundColor: "#FAFBFC",
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    fontSize: 24,
    color: "#333",
    textAlign: "center",
    fontWeight: "600",
  },
  mvUnit: {
    fontSize: 24,
    color: "#666",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  resultTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
    marginBottom: 16,
  },
  temperatureLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  temperatureValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    justifyContent: "center",
  },
  rangeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  rangeGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rangeItem: {
    flex: 1,
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    justifyContent: "center",
  },
  referenceTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  referenceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  referenceItem: {
    width: "48%",
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
  },
  specItem: {
    flex: 1,
    alignItems: "center",
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
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 8,
    paddingRight: 4,
  },
  switchText: {
    marginRight: 12,
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  rulerContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 0,
    marginRight: 1,
    marginTop: 12,
  },
  tickContainer: {
    alignItems: "center",
    width: 27,
  },
  tick: {
    width: 1,
    height: 12,
    backgroundColor: "#666",
    marginBottom: 4,
  },
  tickLabel: {
    fontSize: 8,
    color: "#333",
  },
});
