import { View, Text, TouchableOpacity, Modal, TextInput, StyleSheet, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { colors } from "../constants/color";
import DateTimePicker from '@react-native-community/datetimepicker';
import { doc, addDoc, collection, getDocs, query, orderBy, updateDoc } from 'firebase/firestore';
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { formatDate, formatTime } from '../utils/dateUtils';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' for oldest first, 'desc' for newest first
  const [editingItem, setEditingItem] = useState(null); // Track which item is being edited
  const [isEditing, setIsEditing] = useState(false); // Track if we're in edit mode

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

  const handleEditItem = (modification) => {
    // Populate the form with existing data
    setRequestName(modification.requestName || '');
    setSignalName(modification.signalName || '');
    setDetails(modification.details || '');

    // Parse the existing date and time
    if (modification.date) {
      const dateParts = modification.date.split('/');
      if (dateParts.length === 3) {
        const parsedDate = new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);
        if (!isNaN(parsedDate.getTime())) {
          setDate(parsedDate);
        }
      }
    }

    if (modification.time) {
      const timeString = modification.time;
      const today = new Date();
      const [timeOnly] = timeString.split(' ');
      const [hours, minutes, seconds] = timeOnly.split(':');
      const parsedTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(),
        parseInt(hours), parseInt(minutes), seconds ? parseInt(seconds) : 0);
      if (!isNaN(parsedTime.getTime())) {
        setTime(parsedTime);
      }
    }

    setEditingItem(modification);
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setIsEditing(false);
    // Clear form
    setRequestName('');
    setSignalName('');
    setTime(new Date());
    setDate(new Date());
    setDetails('');
  };

  const fetchModifications = async () => {
    try {
      const q = query(collection(db, 'plcModifications'), orderBy('date', sortOrder));
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
  }, [sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };

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
        Alert.alert('Error', 'Signal name is required');
        return;
      }

      const formData = {
        signalName: signalName.toUpperCase(),
        time: formatTime(time),
        date: formatDate(date),
        details,
        requestName: requestName.trim(),
      };

      if (isEditing && editingItem) {
        // Update existing document - only update the fields that can be changed
        const docRef = doc(db, 'plcModifications', editingItem.id);
        await updateDoc(docRef, {
          signalName: signalName.toUpperCase(),
          time: formatTime(time),
          date: formatDate(date),
          details,
          requestName: requestName.trim(),
          updatedAt: new Date().toISOString(),
          updatedBy: user.uid
        });
      } else {
        // Create new document
        await addDoc(collection(db, 'plcModifications'), {
          ...formData,
          createdAt: new Date().toISOString(),
          uid: user.uid,
          userName: user.displayName || 'Anonymous',
          status: 'active',
        });
      }

      setModalVisible(false);
      fetchModifications(); // Refresh the list

      // Clear form and reset edit state
      setRequestName('');
      setSignalName('');
      setTime(new Date());
      setDate(new Date());
      setDetails('');
      setEditingItem(null);
      setIsEditing(false);

    } catch (error) {
      console.error('Error saving PLC modification:', error);
      console.error('Error details:', error.message);
      Alert.alert('Error', `Failed to save modification: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
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
              ]}>Completed</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>Sort:</Text>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={toggleSortOrder}
            >
              <Ionicons
                name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
                size={16}
                color={colors.primary}
              />
              <Text style={styles.sortButtonText}>
                {sortOrder === 'asc' ? 'Old' : 'New'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.primary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by signal,details, or requester."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.listContainer}>
          {modifications
            .filter(mod => {
              // Status filter
              if (mod.status !== statusFilter) return false;

              // Search filter
              if (searchQuery.trim() === '') return true;

              const query = searchQuery.toLowerCase();
              return (
                mod.requestName?.toLowerCase().includes(query) ||
                mod.signalName?.toLowerCase().includes(query) ||
                mod.details?.toLowerCase().includes(query)
              );
            })
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
                        Cancelled on: {formatDate(new Date(modification.cancelledDate))}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.rowActions}>
                  {/* Days since modification */}
                  <Text style={styles.daysSince}>
                    {(() => {
                      try {
                        // Check if date exists
                        if (!modification.date) return 'No Date';

                        // Try different date parsing approaches
                        let modDate;

                        // First try: direct parsing
                        modDate = new Date(modification.date);

                        // If invalid, try manual parsing for MM/DD/YYYY format
                        if (isNaN(modDate.getTime())) {
                          const dateParts = modification.date.split('/');
                          if (dateParts.length === 3) {
                            // Assume MM/DD/YYYY format
                            modDate = new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);
                          }
                        }

                        // Check if we got a valid date
                        if (isNaN(modDate.getTime())) {
                          return 'Invalid';
                        }

                        const today = new Date();

                        // Set time to start of day for accurate day calculation
                        modDate.setHours(0, 0, 0, 0);
                        today.setHours(0, 0, 0, 0);

                        const diffTime = today - modDate;
                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                        // Return appropriate text based on the difference
                        if (diffDays === 0) return 'Today';
                        if (diffDays === 1) return '1d ago';
                        if (diffDays > 1) return `${diffDays}d ago`;
                        if (diffDays === -1) return 'Tomorrow';
                        return `${Math.abs(diffDays)}d future`;
                      } catch (error) {
                        return 'Error';
                      }
                    })()}
                  </Text>

                  {/* Edit button */}
                  <TouchableOpacity
                    onPress={() => handleEditItem(modification)}
                    style={styles.editButton}
                  >
                    <Ionicons name="pencil" size={14} color={colors.primary} />
                  </TouchableOpacity>

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
                    {
                      backgroundColor: modification.status === 'active' ? '#FFD700'
                        : modification.status === 'cancelled' ? colors.primary
                          : '#ddd'
                    }
                  ]} />
                </View>
              </View>
            ))}
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          // Clear edit state when adding new item
          setEditingItem(null);
          setIsEditing(false);
          setModalVisible(true);
        }}
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
                  <Text>{formatTime(time)}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.input}
                >
                  <Text>{formatDate(date)}</Text>
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
                <Text style={styles.buttonText}>{isEditing ? 'Update' : 'Save'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.closeButton]}
                onPress={() => {
                  setModalVisible(false);
                  if (isEditing) {
                    handleCancelEdit();
                  }
                }}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  sortLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 2,
    minWidth: 50,
  },
  sortButtonText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '500',
  },
  searchContainer: {
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 45,
    borderWidth: 1,
    borderColor: colors.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 12,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: colors.primary,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    minWidth: 60,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
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
    marginBottom: 80,
    paddingTop: 10,
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
  },
  rowActions: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  daysSince: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 30,
    textAlign: 'center',
  },
  editButton: {
    padding: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 4,
  },
  cancelButton: {
    padding: 5,
  },
  cancelledText: {
    color: colors.primary,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary,
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
  },
});

export default PlcModification;