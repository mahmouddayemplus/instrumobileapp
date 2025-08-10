import React, { useState, useLayoutEffect } from "react";
import Slider from "@react-native-community/slider"; // make sure installed

import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../constants/color";
import { useNavigation } from "@react-navigation/native";

function resistanceToTemperature_PT100(R) {
  const R0 = 100;
  const A = 3.9083e-3;
  const B = -5.775e-7;

  const discriminant = Math.pow(A, 2) - 4 * B * (1 - R / R0);
  if (discriminant < 0) return NaN;

  const T = (-A + Math.sqrt(discriminant)) / (2 * B);
  return T;
}

const PT100Calculator = () => {
  const [input, setInput] = useState("100");
  const [result, setResult] = useState(null);
  const navigation = useNavigation();
  const SCALE_STEPS = 6; // number of intervals (ticks = SCALE_STEPS + 1)
  const MAX_OHM = 300;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "PT100",
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
            <Ionicons name="thermometer" size={24} color="#fff" />
          </View>
        </View>
      ),
    });
  }, [navigation]);

  const handleInputChange = (text) => {
    setInput(text);
    const value = parseFloat(text);
    if (!isNaN(value)) {
      const T = resistanceToTemperature_PT100(value);
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
    if (temperature > 50) return "Hot";
    return "Normal";
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary || "#34C759"}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        // showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        scrollEventThrottle={16}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          {/* Input Card */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Resistance Value</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                placeholder="resistance..."
                placeholderTextColor="#999"
                value={input}
                onChangeText={handleInputChange}
              />
              <Text style={styles.ohmUnit}>Ω</Text>
            </View>
            <View pointerEvents="box-none">
              <Slider
                style={{ marginTop: 16 }}
                minimumValue={0}
                maximumValue={MAX_OHM}
                step={0.001}
                value={parseFloat(input) || 0}
                onSlidingComplete={(value) => {
                  const textValue = value.toFixed(3);
                  setInput(textValue);
                  const T = resistanceToTemperature_PT100(value);
                  setResult(isNaN(T) ? "Invalid" : T.toFixed(2));
                }}
                minimumTrackTintColor={colors.primary || "#34C759"}
                maximumTrackTintColor="#ccc"
              />
            </View>

            {/* Static ruler below the slider */}
            <View style={styles.rulerContainer}>
              {Array.from({ length: SCALE_STEPS + 1 }, (_, i) => {
                const val = (MAX_OHM / SCALE_STEPS) * i;
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
              <Text style={styles.resultTitle}>Temperature</Text>
            </View>

            <View style={styles.temperatureDisplay}>
              <Text style={styles.temperatureLabel}>
                Calculated Temperature:
              </Text>
              <Text
                style={[
                  styles.temperatureValue,
                  { color: getTemperatureColor(result) },
                ]}
              >
                {result} °C
              </Text>
            </View>

            <View style={styles.temperatureInfo}>
              <Text style={styles.temperatureInfoText}>
                {result === "Invalid"
                  ? "❌ Invalid resistance value entered"
                  : parseFloat(result) < 0
                  ? "❄️ Temperature is below freezing point"
                  : parseFloat(result) > 50
                  ? "🔥 Temperature is above normal range"
                  : "✅ Temperature is within normal range"}
              </Text>
            </View>
          </View>
        )}

        {/* Reference Values Card */}
        <View style={styles.referenceCard}>
          <Text style={styles.referenceTitle}>Common Reference Values</Text>
          <View style={styles.referenceGrid}>
            <View style={styles.referenceItem}>
              <Text style={styles.refTemp}>0°C</Text>
              <Text style={styles.refResistance}>100.00 Ω</Text>
            </View>
            <View style={styles.referenceItem}>
              <Text style={styles.refTemp}>25°C</Text>
              <Text style={styles.refResistance}>109.73 Ω</Text>
            </View>
            <View style={styles.referenceItem}>
              <Text style={styles.refTemp}>50°C</Text>
              <Text style={styles.refResistance}>119.40 Ω</Text>
            </View>
            <View style={styles.referenceItem}>
              <Text style={styles.refTemp}>100°C</Text>
              <Text style={styles.refResistance}>138.51 Ω</Text>
            </View>
          </View>
        </View>

        {/* PT100 Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>PT100 Sensor</Text>
          <Text style={styles.infoText}>
            PT100 is a platinum resistance temperature sensor with 100Ω
            resistance at 0°C. It provides accurate temperature measurements
            across a wide range.
          </Text>
          <View style={styles.specsContainer}>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Base Resistance</Text>
              <Text style={styles.specValue}>100 Ω at 0°C</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Temperature Coefficient</Text>
              <Text style={styles.specValue}>0.385 Ω/°C</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PT100Calculator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || "#F8F9FA",
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
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
  inputLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
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
  ohmUnit: {
    fontSize: 24,
    color: "#666",
    marginLeft: 8,
    fontWeight: "500",
  },
  rulerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 0,
    marginRight: 1,
    marginTop: 12,
  },
  tickContainer: {
    alignItems: "center",
    width: 40,
  },
  tick: {
    width: 2,
    height: 12,
    backgroundColor: "#666",
    marginBottom: 4,
  },
  tickLabel: {
    fontSize: 12,
    color: "#333",
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
  temperatureDisplay: {
    alignItems: "center",
    marginBottom: 16,
  },
  temperatureLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  temperatureValue: {
    fontSize: 48,
    fontWeight: "700",
  },
  temperatureInfo: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#E1E5E9",
  },
  temperatureInfoText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
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
  referenceTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
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
  refTemp: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  refResistance: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
});
