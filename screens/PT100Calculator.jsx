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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>PT100 Calculator</Text>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder=" Resistance"
            value={input}
            onChangeText={handleInputChange}
          />
          <Text style={styles.ohmUnit}>Ω</Text>
        </View>

        {result !== null && (
          <Text style={styles.result}>{result} °C</Text>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default PT100Calculator;

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
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border || '#D1D1D6',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    alignSelf: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    fontSize: 26,
    color: colors.text || '#1C1C1E',
    textAlign: 'center',
    fontWeight:"bold",
  },
  ohmUnit: {
    fontSize: 26,
    color: '#999',
    marginLeft: 8,
  },
});
