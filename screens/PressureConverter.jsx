import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { colors } from "../constants/color";

const units = {
  Pa: 1,
  kPa: 1000,
  MPa: 1_000_000,
  bar: 100_000,
  mbar: 100,
  atm: 101_325,
  mmHg: 133.322,
  inHg: 3386.39,
  mmH2O: 9.80665,
  inchH2O: 249.0889,
  torr: 133.322,
  psi: 6894.76,
};

const unitList = Object.keys(units);

const PressureConverter = () => {
  const [inputValue, setInputValue] = useState('');
  const [inputUnit, setInputUnit] = useState('Pa');
  const [outputUnit, setOutputUnit] = useState('bar');
  const [convertedValue, setConvertedValue] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [isSelectingInputUnit, setIsSelectingInputUnit] = useState(true);

  const convertPressure = (value, fromUnit, toUnit) => {
    if (!value || isNaN(value)) return '';
    const valueInPa = parseFloat(value) * units[fromUnit];
    const converted = valueInPa / units[toUnit];
    return converted.toFixed(4);
  };

  const handleConversion = (value, from = inputUnit, to = outputUnit) => {
    setConvertedValue(convertPressure(value, from, to));
  };

  const openUnitModal = (isInput) => {
    setIsSelectingInputUnit(isInput);
    setModalVisible(true);
  };

  const handleUnitSelect = (unit) => {
    if (isSelectingInputUnit) {
      setInputUnit(unit);
      handleConversion(inputValue, unit, outputUnit);
    } else {
      setOutputUnit(unit);
      handleConversion(inputValue, inputUnit, unit);
    }
    setModalVisible(false);
  };

  const getUnitDescription = (unit) => {
    const descriptions = {
      Pa: 'Pascal',
      kPa: 'Kilopascal',
      MPa: 'Megapascal',
      bar: 'Bar',
      mbar: 'Millibar',
      atm: 'Atmosphere',
      mmHg: 'Millimeter of Mercury',
      inHg: 'Inch of Mercury',
      mmH2O: 'Millimeter of Water',
      inchH2O: 'Inch of Water',
      torr: 'Torr',
      psi: 'Pound per Square Inch',
    };
    return descriptions[unit] || unit;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Input Card */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Pressure Value</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter pressure value..."
                placeholderTextColor="#999"
                value={inputValue}
                onChangeText={(text) => {
                  setInputValue(text);
                  handleConversion(text);
                }}
              />
            </View>
          </View>

          {/* Unit Selection Card */}
          <View style={styles.unitCard}>
            <Text style={styles.unitCardTitle}>Unit Selection</Text>
            <View style={styles.unitSelectorRow}>
              <TouchableOpacity
                style={styles.unitButton}
                onPress={() => openUnitModal(true)}
              >
                <Text style={styles.unitButtonLabel}>From</Text>
                <Text style={styles.unitButtonValue}>{inputUnit}</Text>
                <Text style={styles.unitButtonDesc}>{getUnitDescription(inputUnit)}</Text>
              </TouchableOpacity>

              <View style={styles.arrowContainer}>
                <Text style={styles.arrow}>→</Text>
              </View>

              <TouchableOpacity
                style={styles.unitButton}
                onPress={() => openUnitModal(false)}
              >
                <Text style={styles.unitButtonLabel}>To</Text>
                <Text style={styles.unitButtonValue}>{outputUnit}</Text>
                <Text style={styles.unitButtonDesc}>{getUnitDescription(outputUnit)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Result Card */}
          {convertedValue && (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>Converted Pressure</Text>
                <View style={styles.resultBadge}>
                  <Text style={styles.resultBadgeText}>Result</Text>
                </View>
              </View>
              
              <View style={styles.resultDisplay}>
                <Text style={styles.resultLabel}>Pressure Value:</Text>
                <Text style={styles.resultValue}>
                  {convertedValue} {outputUnit}
                </Text>
              </View>

              <View style={styles.resultInfo}>
                <Text style={styles.resultInfoText}>
                  💡 {inputValue} {inputUnit} = {convertedValue} {outputUnit}
                </Text>
              </View>
            </View>
          )}

          {/* Common Conversions Card */}
          <View style={styles.conversionsCard}>
            <Text style={styles.conversionsTitle}>Common Pressure Conversions</Text>
            <View style={styles.conversionsGrid}>
              <View style={styles.conversionItem}>
                <Text style={styles.conversionLabel}>1 atm</Text>
                <Text style={styles.conversionValue}>101.325 kPa</Text>
              </View>
              <View style={styles.conversionItem}>
                <Text style={styles.conversionLabel}>1 bar</Text>
                <Text style={styles.conversionValue}>100 kPa</Text>
              </View>
              <View style={styles.conversionItem}>
                <Text style={styles.conversionLabel}>1 psi</Text>
                <Text style={styles.conversionValue}>6.895 kPa</Text>
              </View>
              <View style={styles.conversionItem}>
                <Text style={styles.conversionLabel}>1 mmHg</Text>
                <Text style={styles.conversionValue}>133.322 Pa</Text>
              </View>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Pressure Units</Text>
            <Text style={styles.infoText}>
              Pressure is the force applied perpendicular to the surface of an object per unit area. 
              Different industries use various pressure units based on their specific requirements.
            </Text>
            <View style={styles.specsContainer}>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>SI Unit</Text>
                <Text style={styles.specValue}>Pascal (Pa)</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Common Units</Text>
                <Text style={styles.specValue}>Bar, PSI, atm</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Unit Selection Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Select {isSelectingInputUnit ? 'Input' : 'Output'} Unit
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={unitList}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => handleUnitSelect(item)}
                  >
                    <Text style={styles.modalItemUnit}>{item}</Text>
                    <Text style={styles.modalItemDesc}>{getUnitDescription(item)}</Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default PressureConverter;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || "#F8F9FA",
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
  inputLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  inputWrapper: {
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
    fontSize: 24,
    color: "#333",
    textAlign: 'center',
    fontWeight: "600",
  },
  unitCard: {
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
  unitCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  unitSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unitButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E1E5E9',
  },
  unitButtonLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  unitButtonValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  unitButtonDesc: {
    fontSize: 10,
    color: "#666",
    textAlign: 'center',
  },
  arrowContainer: {
    paddingHorizontal: 16,
  },
  arrow: {
    fontSize: 24,
    color: "#666",
    fontWeight: "600",
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
  resultTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  resultBadge: {
    backgroundColor: colors.primary || "#34C759",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  resultBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  resultDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resultLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.primary || "#34C759",
  },
  resultInfo: {
    backgroundColor: "#F0F8FF",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary || "#34C759",
  },
  resultInfoText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  conversionsCard: {
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
  conversionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    textAlign: 'center',
  },
  conversionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  conversionItem: {
    width: '48%',
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  conversionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  conversionValue: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    maxHeight: '70%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  modalItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemUnit: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalItemDesc: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    textAlign: 'right',
  },
});
