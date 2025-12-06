import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, SafeAreaView, TouchableWithoutFeedback, Keyboard, Platform, ScrollView, Alert } from 'react-native'
import React, { useState } from 'react'
import { Picker } from '@react-native-picker/picker'
import DateTimePicker from '@react-native-community/datetimepicker'
import { db } from '../firebase/firebaseConfig'
import { collection, doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSelector } from "react-redux";

const GasAnalyzerCalibration = () => {
    const [selectedLocation, setSelectedLocation] = useState('kiln inlet')
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const user = useSelector((state) => state.auth.user);
     


    // State for Kiln Inlet measurements
    const [o2Setpoint, setO2Setpoint] = useState('')
    const [o2Reading, setO2Reading] = useState('')
    const [coSetpoint, setCoSetpoint] = useState('')
    const [coReading, setCoReading] = useState('')
    const [so2Setpoint, setSo2Setpoint] = useState('')
    const [so2Reading, setSo2Reading] = useState('')
    const [noxSetpoint, setNoxSetpoint] = useState('')
    const [noxReading, setNoxReading] = useState('')

    const locationOptions = [
        { label: 'Kiln Inlet', value: 'kiln inlet' },
        { label: 'PC', value: 'pc' },
        { label: 'String A', value: 'string a' },
        { label: 'String B', value: 'string b' }
    ]

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false)
        if (selectedDate) {
            setSelectedDate(selectedDate)
            console.log('Selected Date:', selectedDate.toLocaleDateString())
        }
    }

  const uploadDataToFirebase = async () => {
    try {
      setIsUploading(true);
      
      // Check if user is logged in
      if (!user) {
        Alert.alert('Error', 'Please login to save data');
        return;
      }

      // Validate required fields
      if (!o2Setpoint || !o2Reading || !coSetpoint || !coReading) {
        Alert.alert('Error', 'Please fill in all O2 and CO fields');
        return;
      }

      if (selectedLocation === 'kiln inlet') {
        if (!so2Setpoint || !so2Reading || !noxSetpoint || !noxReading) {
          Alert.alert('Error', 'Please fill in all fields for Kiln Inlet');
          return;
        }
      }

      // Convert location to document name format
      const getDocumentName = (location) => {
        switch (location) {
          case 'kiln inlet': return 'kiln inlet';
          case 'pc': return 'pc';
          case 'string a': return 'stringA';
          case 'string b': return 'stringB';
          default: return location;
        }
      };

      const documentName = getDocumentName(selectedLocation);

      // Prepare data object
      const dataObject = {
        user: user.displayName || user.email || 'Unknown User',
        date: selectedDate.toLocaleDateString(),
        'O2-reading': parseFloat(o2Reading),
        'O2-setpoint': parseFloat(o2Setpoint),
        'CO-reading': parseFloat(coReading),
        'CO-setpoint': parseFloat(coSetpoint),
      };

      // Add additional fields for kiln inlet
      if (selectedLocation === 'kiln inlet') {
        dataObject['NOx-reading'] = parseFloat(noxReading);
        dataObject['NOx-setpoint'] = parseFloat(noxSetpoint);
        dataObject['SOx-reading'] = parseFloat(so2Reading);
        dataObject['SOx-setpoint'] = parseFloat(so2Setpoint);
      }

      // Reference to the document
      const docRef = doc(db, 'gasanalyzers', documentName);
      
      // Check if document exists
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // Document exists, add to existing array
        await updateDoc(docRef, {
          data: arrayUnion(dataObject)
        });
      } else {
        // Document doesn't exist, create it with the first entry
        await setDoc(docRef, {
          data: [dataObject]
        });
      }

      Alert.alert('Success', 'Data uploaded successfully!');
      console.log('Data uploaded successfully:', dataObject);
      
      // Optionally clear the form after successful upload
      setO2Setpoint('');
      setO2Reading('');
      setCoSetpoint('');
      setCoReading('');
      if (selectedLocation === 'kiln inlet') {
        setSo2Setpoint('');
        setSo2Reading('');
        setNoxSetpoint('');
        setNoxReading('');
      }
      
    } catch (error) {
      console.error('Error uploading data:', error);
      Alert.alert('Error', 'Failed to upload data. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.container}>
                            {/* Date Picker Section */}
                            <View style={styles.dropdownContainer}>
                                <Text style={styles.label}>Select Date:</Text>
                                <TouchableOpacity
                                    style={styles.datePickerButton}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text style={styles.dateText}>
                                        {selectedDate.toLocaleDateString()}
                                    </Text>
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={selectedDate}
                                        mode="date"
                                        display="default"
                                        onChange={handleDateChange}
                                    />
                                )}
                            </View>

                            <View style={styles.dropdownContainer}>
                                <Text style={styles.label}>Select Gas Analyser:</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={selectedLocation}
                                        onValueChange={(itemValue) => setSelectedLocation(itemValue)}
                                        style={styles.picker}
                                    >
                                        {locationOptions.map((option) => (
                                            <Picker.Item
                                                key={option.value}
                                                label={option.label}
                                                value={option.value}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </View>

                            <View style={styles.content}>
                                <Text style={styles.title}>Gas Analyzer Calibration</Text>

                                {selectedLocation === 'kiln inlet' ? (
                                    // Kiln Inlet - O2, CO, SO2, NOx
                                    <View style={styles.measurementsContainer}>
                                        <View style={styles.gasSection}>
                                            <Text style={styles.gasTitle}>O₂ (Oxygen)</Text>
                                            <View style={styles.inputRow}>
                                                <View style={styles.inputGroup}>
                                                    <Text style={styles.inputLabel}>Setpoint</Text>
                                                    <TextInput
                                                        style={styles.input}
                                                        value={o2Setpoint}
                                                        onChangeText={setO2Setpoint}
                                                        placeholder="Enter setpoint"
                                                        keyboardType="numeric"
                                                    />
                                                </View>
                                                <View style={styles.inputGroup}>
                                                    <Text style={styles.inputLabel}>Analyzer Reading</Text>
                                                    <TextInput
                                                        style={styles.input}
                                                        value={o2Reading}
                                                        onChangeText={setO2Reading}
                                                        placeholder="Enter reading"
                                                        keyboardType="numeric"
                                                    />
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.gasSection}>
                                            <Text style={styles.gasTitle}>CO (Carbon Monoxide)</Text>
                                            <View style={styles.inputRow}>
                                                <View style={styles.inputGroup}>
                                                    <Text style={styles.inputLabel}>Setpoint</Text>
                                                    <TextInput
                                                        style={styles.input}
                                                        value={coSetpoint}
                                                        onChangeText={setCoSetpoint}
                                                        placeholder="Enter setpoint"
                                                        keyboardType="numeric"
                                                    />
                                                </View>
                                                <View style={styles.inputGroup}>
                                                    <Text style={styles.inputLabel}>Analyzer Reading</Text>
                                                    <TextInput
                                                        style={styles.input}
                                                        value={coReading}
                                                        onChangeText={setCoReading}
                                                        placeholder="Enter reading"
                                                        keyboardType="numeric"
                                                    />
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.gasSection}>
                                            <Text style={styles.gasTitle}>SO₂ (Sulfur Dioxide)</Text>
                                            <View style={styles.inputRow}>
                                                <View style={styles.inputGroup}>
                                                    <Text style={styles.inputLabel}>Setpoint</Text>
                                                    <TextInput
                                                        style={styles.input}
                                                        value={so2Setpoint}
                                                        onChangeText={setSo2Setpoint}
                                                        placeholder="Enter setpoint"
                                                        keyboardType="numeric"
                                                    />
                                                </View>
                                                <View style={styles.inputGroup}>
                                                    <Text style={styles.inputLabel}>Analyzer Reading</Text>
                                                    <TextInput
                                                        style={styles.input}
                                                        value={so2Reading}
                                                        onChangeText={setSo2Reading}
                                                        placeholder="Enter reading"
                                                        keyboardType="numeric"
                                                    />
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.gasSection}>
                                            <Text style={styles.gasTitle}>NOₓ (Nitrogen Oxides)</Text>
                                            <View style={styles.inputRow}>
                                                <View style={styles.inputGroup}>
                                                    <Text style={styles.inputLabel}>Setpoint</Text>
                                                    <TextInput
                                                        style={styles.input}
                                                        value={noxSetpoint}
                                                        onChangeText={setNoxSetpoint}
                                                        placeholder="Enter setpoint"
                                                        keyboardType="numeric"
                                                    />
                                                </View>
                                                <View style={styles.inputGroup}>
                                                    <Text style={styles.inputLabel}>Analyzer Reading</Text>
                                                    <TextInput
                                                        style={styles.input}
                                                        value={noxReading}
                                                        onChangeText={setNoxReading}
                                                        placeholder="Enter reading"
                                                        keyboardType="numeric"
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                ) : (
                                    // Other locations - O2, CO only
                                    <View style={styles.measurementsContainer}>
                                        <View style={styles.gasSection}>
                                            <Text style={styles.gasTitle}>O₂ (Oxygen)</Text>
                                            <View style={styles.inputRow}>
                                                <View style={styles.inputGroup}>
                                                    <Text style={styles.inputLabel}>Setpoint</Text>
                                                    <TextInput
                                                        style={styles.input}
                                                        value={o2Setpoint}
                                                        onChangeText={setO2Setpoint}
                                                        placeholder="Enter setpoint"
                                                        keyboardType="numeric"
                                                    />
                                                </View>
                                                <View style={styles.inputGroup}>
                                                    <Text style={styles.inputLabel}>Analyzer Reading</Text>
                                                    <TextInput
                                                        style={styles.input}
                                                        value={o2Reading}
                                                        onChangeText={setO2Reading}
                                                        placeholder="Enter reading"
                                                        keyboardType="numeric"
                                                    />
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.gasSection}>
                                            <Text style={styles.gasTitle}>CO (Carbon Monoxide)</Text>
                                            <View style={styles.inputRow}>
                                                <View style={styles.inputGroup}>
                                                    <Text style={styles.inputLabel}>Setpoint</Text>
                                                    <TextInput
                                                        style={styles.input}
                                                        value={coSetpoint}
                                                        onChangeText={setCoSetpoint}
                                                        placeholder="Enter setpoint"
                                                        keyboardType="numeric"
                                                    />
                                                </View>
                                                <View style={styles.inputGroup}>
                                                    <Text style={styles.inputLabel}>Analyzer Reading</Text>
                                                    <TextInput
                                                        style={styles.input}
                                                        value={coReading}
                                                        onChangeText={setCoReading}
                                                        placeholder="Enter reading"
                                                        keyboardType="numeric"
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                )}

                                <Text style={styles.selectedText}>
                                    Selected Location: {locationOptions.find(opt => opt.value === selectedLocation)?.label}
                                </Text>

                                <TouchableOpacity
                                    style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
                                    onPress={uploadDataToFirebase}
                                    disabled={isUploading}
                                >
                                    <Text style={styles.uploadButtonText}>
                                        {isUploading ? 'Uploading...' : 'Save'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    dropdownContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        backgroundColor: '#fff',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    content: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    selectedText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
        fontStyle: 'italic',
    },
    datePickerButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 12,
        backgroundColor: '#fff',
    },
    dateText: {
        fontSize: 16,
        color: '#333',
    },
    measurementsContainer: {
        marginBottom: 20,
    },
    gasSection: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    gasTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#495057',
        marginBottom: 12,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    inputGroup: {
        flex: 1,
        marginHorizontal: 4,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6c757d',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 6,
        padding: 10,
        backgroundColor: '#fff',
        fontSize: 16,
        color: '#495057',
    },
    uploadButton: {
        backgroundColor: '#28a745',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 20,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    uploadButtonDisabled: {
        backgroundColor: '#6c757d',
        opacity: 0.7,
    },
})

export default GasAnalyzerCalibration