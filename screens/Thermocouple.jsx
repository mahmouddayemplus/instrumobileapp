import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
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
  const [input, setInput] = useState("0");
  const [result, setResult] = useState(null);

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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
   

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder="millivolt"
            value={input}
            onChangeText={handleInputChange}
          />
          <Text style={styles.ohmUnit}>mv</Text>
        </View>
        <Text style={{ fontSize: 12 }}>
          Hint : Min. mv = -6.458 at -270 °C ,max. mv = 54.886 at 1372 °C{" "}
        </Text>
        <Text style={styles.hint}>
          Uses standard Type K thermocouple equation (NIST ITS-90) for accurate temperature conversion.
        </Text>

        {result !== null && <Text style={styles.result}>{result} °C</Text>}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default Thermocouple;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background || "#F9F9F9",
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  result: {
    fontSize: 26,
    fontWeight: "500",
    textAlign: "center",
    color: colors.primary || "#34C759",
    backgroundColor: "#eafbee",
    paddingVertical: 20,
    borderRadius: 12,
    marginTop: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border || "#D1D1D6",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    alignSelf: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    fontSize: 26,
    color: colors.text || "#1C1C1E",
    textAlign: "center",
    fontWeight: "bold",
  },
  ohmUnit: {
    fontSize: 26,
    color: "#999",
    marginLeft: 8,
  },
  hint:{
    fontSize:12
  }
});
