import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, SafeAreaView, TouchableWithoutFeedback, Keyboard, Platform, ScrollView, Alert, Modal, FlatList, ActivityIndicator } from 'react-native'
import React, { useState, useLayoutEffect } from 'react'
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from "../constants/color";
import DateTimePicker from '@react-native-community/datetimepicker'
import { db } from '../firebase/firebaseConfig'
import { collection, doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSelector } from "react-redux";
import { formatDate } from '../utils/dateUtils';

const GasAnalyzerCalibration = () => {
    const navigation = useNavigation();
    const [selectedLocation, setSelectedLocation] = useState('kiln inlet')
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showLocationPicker, setShowLocationPicker] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [historyRecords, setHistoryRecords] = useState([])
    const [loadingHistory, setLoadingHistory] = useState(false)
    const user = useSelector((state) => state.auth.user);



    // State for Kiln Inlet measurements
    const [o2Setpoint, setO2Setpoint] = useState('20')
    const [o2Reading, setO2Reading] = useState('')
    const [coSetpoint, setCoSetpoint] = useState('2.4')
    const [coReading, setCoReading] = useState('')
    const [so2Setpoint, setSo2Setpoint] = useState('8000')
    const [so2Reading, setSo2Reading] = useState('')
    const [noxSetpoint, setNoxSetpoint] = useState('3200')
    const [noxReading, setNoxReading] = useState('')

    const locationOptions = [
        { label: 'Kiln Inlet', value: 'kiln inlet' },
        { label: 'PC', value: 'pc' },
        { label: 'String A', value: 'string a' },
        { label: 'String B', value: 'string b' }
    ]

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => {
                        setModalVisible(true);
                        fetchHistoryForLocation(selectedLocation);
                    }}
                    style={{ marginRight: 15 }}
                >
                    <MaterialCommunityIcons name="history" size={28} color={colors.primary} />
                </TouchableOpacity>
            ),
        });
    }, [navigation, selectedLocation]);
    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false)
        if (selectedDate) {
            setSelectedDate(selectedDate)
            console.log('Selected Date:', formatDate(selectedDate))
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
                date: formatDate(selectedDate),
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
    };

    const fetchHistoryForLocation = async (location) => {
        try {
            setLoadingHistory(true)

            const getDocumentName = (loc) => {
                switch (loc) {
                    case 'kiln inlet': return 'kiln inlet';
                    case 'pc': return 'pc';
                    case 'string a': return 'stringA';
                    case 'string b': return 'stringB';
                    default: return loc;
                }
            };

            const documentName = getDocumentName(location)
            const docRef = doc(db, 'gasanalyzers', documentName)
            const docSnap = await getDoc(docRef)
            if (docSnap.exists()) {
                const data = docSnap.data()?.data || []
                setHistoryRecords(Array.isArray(data) ? data.slice().reverse() : [])
            } else {
                setHistoryRecords([])
            }
        } catch (error) {
            console.error('Error fetching history:', error)
            setHistoryRecords([])
        } finally {
            setLoadingHistory(false)
        }
    }

    return (
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
                                        {formatDate(selectedDate)}
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
                                <TouchableOpacity
                                    style={styles.dropdownButton}
                                    onPress={() => setShowLocationPicker(true)}
                                >
                                    <Text style={styles.dropdownText}>
                                        {locationOptions.find(opt => opt.value === selectedLocation)?.label}
                                    </Text>
                                    <Text style={styles.dropdownIcon}>▼</Text>
                                </TouchableOpacity>
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
                                                    <Text style={styles.inputLabel}>Setpoint 10%</Text>
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
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>History - {locationOptions.find(opt => opt.value === selectedLocation)?.label}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <Text style={{ color: '#fff' }}>Close</Text>
                            </TouchableOpacity>
                        </View>

                        {loadingHistory ? (
                            <ActivityIndicator size="large" style={{ marginTop: 20 }} />
                        ) : (
                            <>
                                {(!historyRecords || historyRecords.length === 0) ? (
                                    <Text style={{ marginTop: 20 }}>No history records for this analyzer.</Text>
                                ) : (
                                    <FlatList
                                        style={{ marginTop: 12 }}
                                        data={historyRecords}
                                        keyExtractor={(item, index) => index.toString()}
                                        renderItem={({ item }) => (
                                            <View style={styles.historyItem}>
                                                <Text style={styles.historyDate}>{item.date || ''}</Text>
                                                <Text style={styles.historyUser}>{item.user || ''}</Text>
                                                <Text style={styles.historyText}>O2: {item['O2-reading'] ?? ''}</Text>
                                                <Text style={styles.historyText}>CO: {item['CO-reading'] ?? ''}</Text>
                                                {item['NOx-reading'] !== undefined && <Text style={styles.historyText}>NOx: {item['NOx-reading']}</Text>}
                                                {item['SOx-reading'] !== undefined && <Text style={styles.historyText}>SOx: {item['SOx-reading']}</Text>}
                                            </View>
                                        )}
                                    />
                                )}
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Location Picker Modal */}
            <Modal
                visible={showLocationPicker}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowLocationPicker(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowLocationPicker(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                            <View style={styles.locationPickerModal}>
                                <View style={styles.locationPickerHeader}>
                                    <Text style={styles.locationPickerTitle}>Select Gas Analyser</Text>
                                    <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
                                        <Text style={styles.closeButtonText}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                                {locationOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.locationOption,
                                            selectedLocation === option.value && styles.locationOptionSelected
                                        ]}
                                        onPress={() => {
                                            setSelectedLocation(option.value)
                                            setShowLocationPicker(false)
                                        }}
                                    >
                                        <Text style={[
                                            styles.locationOptionText,
                                            selectedLocation === option.value && styles.locationOptionTextSelected
                                        ]}>
                                            {option.label}
                                        </Text>
                                        {selectedLocation === option.value && (
                                            <Text style={styles.checkmark}>✓</Text>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
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

    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '90%',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    closeButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    historyItem: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    historyDate: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    historyUser: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
        fontStyle: 'italic',
    },
    historyText: {
        fontSize: 13,
        color: '#495057',
        marginBottom: 2,
    },
    dropdownButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 12,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: {
        fontSize: 16,
        color: '#333',
    },
    dropdownIcon: {
        fontSize: 12,
        color: '#666',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationPickerModal: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '80%',
        maxHeight: '60%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    locationPickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    locationPickerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    closeButtonText: {
        fontSize: 24,
        color: '#666',
        fontWeight: '300',
    },
    locationOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#f8f9fa',
    },
    locationOptionSelected: {
        backgroundColor: '#e8f5e9',
        borderWidth: 1,
        borderColor: '#28a745',
    },
    locationOptionText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    locationOptionTextSelected: {
        color: '#28a745',
        fontWeight: '600',
    },
    checkmark: {
        fontSize: 20,
        color: '#28a745',
        fontWeight: 'bold',
    },
})

export default GasAnalyzerCalibration