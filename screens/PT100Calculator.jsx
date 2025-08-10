import React, { useState, useLayoutEffect, useEffect } from "react";
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
  Switch,
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

function temperatureToResistance_PT100(T) {
  // Inverse (simple polynomial): R = R0 * (1 + A*T + B*T^2)
  const R0 = 100;
  const A = 3.9083e-3;
  const B = -5.775e-7;
  return R0 * (1 + A * T + B * T * T);
}

const PT100Calculator = () => {
  const [input, setInput] = useState("100"); // editable field (either Ω or °C depending on mode)
  const [result, setResult] = useState(null); // computed other value
  const [isReverse, setIsReverse] = useState(false); // false = Ω -> °C, true = °C -> Ω
  const [debouncedInput, setDebouncedInput] = useState("100");

  const navigation = useNavigation();
   
  const SCALE_STEPS = 6; // number of ticks
  const MAX_OHM = 300;
  const TEMP_MIN = -200;
  const TEMP_MAX = 500;

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

  // helper: clamp
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  // update result whenever input changes (mode-aware)
  const handleInputChange = (text) => {
    console.log('====================================');
    console.log(isReverse);
    console.log('====================================');
    setInput(text);
    const value = parseFloat(text);
    if (!isNaN(value)) {
      if (!isReverse) {
        // Ω -> °C
        const T = resistanceToTemperature_PT100(value);
        setResult(isNaN(T) ? "Invalid" : T.toFixed(2));
      } else {
        // °C -> Ω
        const R = temperatureToResistance_PT100(value);
        setResult(isNaN(R) ? "Invalid" : R.toFixed(3));
      }
    } else {
      setResult(null);
    }
  };

  // slider change handler (live)
  const onSliderChange = (value) => {
    // if (!isReverse) {
    //   // slider is resistance
    //   const txt = value.toFixed(3);
    //   setInput(txt);
    //   const T = resistanceToTemperature_PT100(value);
    //   setResult(isNaN(T) ? "Invalid" : T.toFixed(2));
    // } else {
    //   // slider is temperature
    //   const txt = value.toFixed(2);
    //   setInput(txt);
    //   const R = temperatureToResistance_PT100(value);
    //   setResult(isNaN(R) ? "Invalid" : R.toFixed(3));
    // }
  };

  // toggle mode and try to preserve meaning by swapping values where possible
  const toggleReverse = () => {
    const currentValue = parseFloat(input);

    if (!isNaN(currentValue)) {
      if (!isReverse) {
        // Switching from Ω → °C to °C → Ω
        const newTemp = resistanceToTemperature_PT100(currentValue);
        if (!isNaN(newTemp)) {
          const newR = temperatureToResistance_PT100(newTemp);
          setIsReverse(true);
          setInput(newTemp.toFixed(2));
          setResult(newR.toFixed(3));
          return;
        }
      } else {
        // Switching from °C → Ω to Ω → °C
        const newR = temperatureToResistance_PT100(currentValue);
        const newT = resistanceToTemperature_PT100(newR);
        if (!isNaN(newT)) {
          setIsReverse(false);
          setInput(newR.toFixed(3));
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

  // compute slider min/max/step depending on mode
  const sliderMin = isReverse ? TEMP_MIN : 0;
  const sliderMax = isReverse ? TEMP_MAX : MAX_OHM;
  const sliderStep = isReverse ? 0.1 : 0.001;

  // initialize result from initial input
  useEffect(() => {
    handleInputChange(input);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inputLabel = isReverse ? "Temperature" : "Resistance Value";
  const unitLabel = isReverse ? "°C" : "Ω";
  const resultTitle = isReverse ? "Resistance" : "Temperature";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary || "#34C759"}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        scrollEventThrottle={16}
      >
        {/* mode switch row */}
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>
            {isReverse ? "°C → Ω" : "Ω → °C"}
          </Text>
          <Switch
            value={isReverse}
            onValueChange={toggleReverse}
            trackColor={{ true: colors.primary || "#34C759", false: "#ccc" }}
            thumbColor={isReverse ? "#fff" : "#fff"}
          />
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          {/* Input Card */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>{inputLabel}</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                placeholder={isReverse ? "temperature..." : "resistance..."}
                placeholderTextColor="#999"
                value={input}
                onChangeText={handleInputChange}
              />
              <Text style={styles.ohmUnit}>{unitLabel}</Text>
            </View>

            <View pointerEvents="box-none">
              <Slider
                style={{ marginTop: 16 }}
                minimumValue={sliderMin}
                maximumValue={sliderMax}
                step={sliderStep}
                value={clamp(
                  parseFloat(input) || sliderMin,
                  sliderMin,
                  sliderMax
                )}
                onValueChange={onSliderChange}
                minimumTrackTintColor={colors.primary || "#34C759"}
                maximumTrackTintColor="#ccc"
              />
            </View>

            {/* Ruler below slider - updates labels according to mode */}
            <View style={styles.rulerContainer}>
              {Array.from({ length: SCALE_STEPS + 1 }, (_, i) => {
                const val =
                  sliderMin + ((sliderMax - sliderMin) / SCALE_STEPS) * i;
                // formatting
                const label = isReverse ? val.toFixed(0) : Math.round(val);
                return (
                  <View key={i} style={styles.tickContainer}>
                    <View style={styles.tick} />
                    <Text style={styles.tickLabel}>{label}</Text>
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
              <Text style={styles.resultTitle}>{resultTitle}</Text>
            </View>

            <View style={styles.temperatureDisplay}>
              <Text style={styles.temperatureLabel}>
                {isReverse
                  ? "Calculated Resistance:"
                  : "Calculated Temperature:"}
              </Text>
              <Text
                style={[
                  styles.temperatureValue,
                  { color: !isReverse ? getTemperatureColor(result) : "#333" },
                ]}
              >
                {result} {isReverse ? "Ω" : "°C"}
              </Text>
            </View>

            <View style={styles.temperatureInfo}>
              <Text style={styles.temperatureInfoText}>
                {!isReverse
                  ? result === "Invalid"
                    ? "❌ Invalid resistance value entered"
                    : parseFloat(result) < 0
                    ? "❄️ Temperature is below freezing point"
                    : parseFloat(result) > 50
                    ? "🔥 Temperature is above normal range"
                    : "✅ Temperature is within normal range"
                  : "🔎 Result is the computed resistance for the entered temperature."}
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

// keep your original getTemperatureColor / getTemperatureStatus functions here
const getTemperatureColor = (temp) => {
  if (isNaN(Number(temp)) || temp === "Invalid") return "#F44336";
  const temperature = parseFloat(temp);
  if (temperature < 0) return "#2196F3";
  if (temperature > 5000) return "#FF5722";
  return "#4CAF50";
};

const getTemperatureStatus = (temp) => {
  if (isNaN(Number(temp)) || temp === "Invalid") return "Invalid Input";
  const temperature = parseFloat(temp);
  if (temperature < 0) return "Cold";
  if (temperature > 50) return "Hot";
  return "Normal";
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
