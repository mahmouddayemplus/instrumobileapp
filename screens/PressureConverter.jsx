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
} from 'react-native';

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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Pressure Converter</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter pressure"
        value={inputValue}
        onChangeText={(text) => {
          setInputValue(text);
          handleConversion(text);
        }}
      />

      <View style={styles.unitSelectorRow}>
        <TouchableOpacity
          style={styles.unitButton}
          onPress={() => openUnitModal(true)}
        >
          <Text>From: {inputUnit}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.unitButton}
          onPress={() => openUnitModal(false)}
        >
          <Text>To: {outputUnit}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.result}>
        Result: {convertedValue} {outputUnit}
      </Text>

      {/* Unit Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Select {isSelectingInputUnit ? 'Input' : 'Output'} Unit
            </Text>
            <FlatList
              data={unitList}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleUnitSelect(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PressureConverter;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    fontSize: 18,
    borderRadius: 8,
    marginBottom: 20,
  },
  unitSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  unitButton: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  result: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
  },
});
