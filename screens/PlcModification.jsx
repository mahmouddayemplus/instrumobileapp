import { View, Text, TouchableOpacity, Modal, TextInput, StyleSheet, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { colors } from "../constants/color";
import DateTimePicker from '@react-native-community/datetimepicker';
import { doc, addDoc, collection, getDocs, query, orderBy, updateDoc } from 'firebase/firestore';
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const PlcModification = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [requestName, setRequestName] = useState('');
  const [signalName, setSignalName] = useState('');
  const [time, setTime] = useState(new Date());
  const [date, setDate] = useState(new Date());
  const [details, setDetails] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modifications, setModifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active'); // Default filter is active

  const db = getFirestore();
  const auth = getAuth();

  const handleCancelModification = async (id) => {
    Alert.alert(
      "Cancel Modification",
      "Are you sure you want to cancel this modification?",
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const docRef = doc(db, 'plcModifications', id);
              await updateDoc(docRef, {
                status: 'cancelled',
                cancelledDate: new Date().toISOString(),
                cancelledBy: auth.currentUser.uid
              });
              console.log('Modification cancelled successfully');
              fetchModifications(); // Refresh the list
            } catch (error) {
              console.error('Error cancelling modification:', error);
              Alert.alert('Error', 'Failed to cancel modification');
            }
          }
        }
      ]
    );
  };

  const fetchModifications = async () => {
    try {
      const q = query(collection(db, 'plcModifications'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const modificationsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setModifications(modificationsList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching modifications:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModifications();
  }, []);

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert('Error', 'No authenticated user found');
        return;
      }

      if (!requestName.trim()) {
        Alert.alert('Error', 'Request name is required');
        return;
      }

      if (!signalName.trim()) {
        console.error('Signal name is required');
        return;
      }

      const formData = {
        signalName: signalName.toUpperCase(),
        time: time.toLocaleTimeString(),
        date: date.toLocaleDateString(),
        details,
        createdAt: new Date().toISOString(),
        uid: user.uid,  // Changed from userId to uid to match Firestore rules
        userName: user.displayName || 'Anonymous',
        status: 'active',
        requestName: requestName.trim(),
      };

      // Add to Firestore
      await addDoc(collection(db, 'plcModifications'), formData);
      
      console.log('PLC Modification saved successfully');
      setModalVisible(false);
      fetchModifications(); // Refresh the list after adding new item
      
      // Clear form
      setRequestName('');
      setSignalName('');
      setTime(new Date());
      setDate(new Date());
      setDetails('');
      
    } catch (error) {
      console.error('Error saving PLC modification:', error);
      // Here you might want to show an error message to the user
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            statusFilter === 'active' && styles.filterButtonActive
          ]}
          onPress={() => setStatusFilter('active')}
        >
          <Text style={[
            styles.filterButtonText,
            statusFilter === 'active' && styles.filterButtonTextActive
          ]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            statusFilter === 'cancelled' && styles.filterButtonActive
          ]}
          onPress={() => setStatusFilter('cancelled')}
        >
          <Text style={[
            styles.filterButtonText,
            statusFilter === 'cancelled' && styles.filterButtonTextActive
          ]}>Cancelled</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <ScrollView style={styles.listContainer}>
          {modifications
            .filter(mod => mod.status === statusFilter)
            .map((modification) => (
            <View key={modification.id} style={styles.row}>
              <View style={styles.rowContent}>
                <Text style={styles.signalName}>{modification.signalName}</Text>
                <View style={styles.rowDetails}>
                  <Text style={styles.timeDate}>{modification.date} {modification.time}</Text>
                  <Text style={styles.details}>{modification.details}</Text>
                  <Text style={styles.userName}>By: {modification.userName}  |  Requester: {modification.requestName}</Text>
                  {modification.status === 'cancelled' && (
                    <Text style={styles.cancelledText}>
                      Cancelled on: {new Date(modification.cancelledDate).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.rowActions}>
                {modification.status === 'active' && (
                  <TouchableOpacity 
                    onPress={() => handleCancelModification(modification.id)}
                    style={styles.cancelButton}
                  >
                    <Ionicons name="close-circle" size={24} color="red" />
                  </TouchableOpacity>
                )}
                <View style={[
                  styles.statusIndicator, 
                  { backgroundColor: modification.status === 'active' ? '#FFD700' 
                    : modification.status === 'cancelled' ? '#ff6b6b' 
                    : '#ddd' }
                ]} />
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Request Name</Text>
              <TextInput
                style={styles.input}
                value={requestName}
                onChangeText={setRequestName}
                placeholder="Enter request name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Signal Name</Text>
              <TextInput
                style={styles.input}
                value={signalName}
                onChangeText={(text) => setSignalName(text.toUpperCase())}
                placeholder="Enter signal name"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.rowContainer}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Time</Text>
                <TouchableOpacity 
                  onPress={() => setShowTimePicker(true)}
                  style={styles.input}
                >
                  <Text>{time.toLocaleTimeString()}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity 
                  onPress={() => setShowDatePicker(true)}
                  style={styles.input}
                >
                  <Text>{date.toLocaleDateString()}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                is24Hour={true}
                onChange={onTimeChange}
              />
            )}

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                onChange={onDateChange}
              />
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Details</Text>
              <TextInput
                style={[styles.input, styles.detailsInput]}
                value={details}
                onChangeText={setDetails}
                placeholder="Enter details"
                multiline={true}
                numberOfLines={4}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.closeButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
    marginBottom: 80, // Space for the add button
  },
  row: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  rowContent: {
    flex: 1,
  },
  signalName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  rowDetails: {
    gap: 4,
  },
  timeDate: {
    fontSize: 14,
    color: '#666',
  },
  details: {
    fontSize: 14,
  },
  userName: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 10,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    padding: 5,
    marginRight: 5,
  },
  cancelledText: {
    color: '#ff6b6b',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor:  colors.primary ,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  inputGroup: {
    marginBottom: 15,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  halfInput: {
    width: '48%',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
  },
  detailsInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  button: {
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    width: '48%',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  closeButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  }
});

export default PlcModification