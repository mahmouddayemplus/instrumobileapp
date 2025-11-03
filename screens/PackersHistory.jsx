import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  StatusBar,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getFirestore, doc, getDoc } from "firebase/firestore";

import { colors } from "../constants/color";
import React, { useState, useLayoutEffect } from "react";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const PackersHistory = () => {
  const navigation = useNavigation();

  // Packer filter states
  const [selectedPacker, setSelectedPacker] = useState("Packer-1");
  const [showPackerDropdown, setShowPackerDropdown] = useState(false);
  const packerOptions = [
    "Packer-1", 
    "Packer-2", 
    "Packer-3", 
    "Packer-4", 
    "Ventocheck-Packer-1", 
    "Ventocheck-Packer-2", 
    "Ventocheck-Packer-3", 
    "Ventocheck-Packer-4"
  ];

  // Data states
  const [historyData, setHistoryData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [hasData, setHasData] = useState(false);

  // Modal states for detailed view
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Function to handle packer selection
  const handlePackerSelection = (packer) => {
    setSelectedPacker(packer);
    setShowPackerDropdown(false);
    // Clear previous data when changing packer
    setHistoryData([]);
    setHasData(false);
   };

  // Function to fetch calibration history from Firestore
  const fetchCalibrationHistory = async () => {
    try {
      setIsFetching(true);
      
      // Get Firestore instance Ventocheck-Packer-1 Ventocheck-Packer-1
      const db = getFirestore();
      const packerDocRef = doc(db, "packers_calibration", selectedPacker);
 
      // Get document
      const docSnap = await getDoc(packerDocRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
 
        const calibrations = data.calibrations || [];
        
        if (calibrations.length > 0) {
          // Sort by created_at in descending order (newest first)
          const sortedCalibrations = calibrations.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          );
          
          setHistoryData(sortedCalibrations);
          setHasData(true);
          
          Alert.alert(
            "Success", 
            `Found ${calibrations.length} calibration records for ${selectedPacker}`
          );
        } else {
          setHistoryData([]);
          setHasData(false);
          Alert.alert("No Data", `No calibration records found for ${selectedPacker}`);
        }
      } else {
        setHistoryData([]);
        setHasData(false);
        Alert.alert("No Data", `No calibration data exists for ${selectedPacker}`);
      }

    } catch (error) {
      console.error("Error fetching calibration history:", error);
      Alert.alert("Error", "Failed to fetch calibration history. Please try again.");
      setHistoryData([]);
      setHasData(false);
    } finally {
      setIsFetching(false);
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  // Function to handle record click
  const handleRecordClick = (record) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  // Function to close detail modal
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedRecord(null);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Packers History",
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
            <Ionicons name="time" size={24} color="#fff" />
          </View>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary || '#34C759'} />
        
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces={true}
          alwaysBounceVertical={false}
        >
          {/* Navigation Button */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={styles.navigationButton}
              onPress={() => navigation.navigate('PackerScreen')}
            >
              <Ionicons name="calculator" size={20} color="#fff" />
              <Text style={styles.navigationButtonText}>New Calibration</Text>
            </TouchableOpacity>
          </View>

          {/* Packer Filter Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Select Machine</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowPackerDropdown(true)}
            >
              <Text style={styles.dropdownText}>{selectedPacker}</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Fetch Button */}
          <View style={styles.fetchButtonContainer}>
            <TouchableOpacity 
              style={[styles.fetchButton, isFetching && styles.disabledButton]} 
              onPress={fetchCalibrationHistory}
              disabled={isFetching}
            >
              {isFetching ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.fetchButtonText}>Fetching...</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="download" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.fetchButtonText}>Fetch History</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* History Table */}
          {hasData && historyData.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Calibration History</Text>
              <Text style={styles.subtitle}>
                {historyData.length} records found for {selectedPacker}
              </Text>
              
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.headerText, styles.dateColumn]}>Date & Time</Text>
                <Text style={[styles.headerText, styles.userColumn]}>User</Text>
                <Text style={[styles.headerText, styles.recordsColumn]}>Records</Text>
              </View>

              {/* Table Rows */}
              {historyData.map((record, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.tableRow}
                  onPress={() => handleRecordClick(record)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dateColumn}>
                    <Text style={styles.cellText}>
                      {formatDate(record.created_at)}
                    </Text>
                  </View>
                  <View style={styles.userColumn}>
                    <Text style={styles.cellText} numberOfLines={2}>
                      {record.user_name || "Unknown User"}
                    </Text>
                  </View>
                  <View style={styles.recordsColumn}>
                    <Text style={styles.cellText}>
                      {record.data ? record.data.length : 0}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* No Data Message */}
          {!hasData && !isFetching && (
            <View style={styles.noDataContainer}>
              <Ionicons name="document-text-outline" size={60} color="#ccc" />
              <Text style={styles.noDataText}>No calibration history available</Text>
              <Text style={styles.noDataSubtext}>
                Select a packer and tap "Fetch History" to load data
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Packer Dropdown Modal */}
        <Modal
          visible={showPackerDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPackerDropdown(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowPackerDropdown(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.dropdownModal}>
                <Text style={styles.modalTitle}>Select Packer</Text>
                {packerOptions.map((packer, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownOption,
                      selectedPacker === packer && styles.selectedOption
                    ]}
                    onPress={() => handlePackerSelection(packer)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedPacker === packer && styles.selectedOptionText
                    ]}>
                      {packer}
                    </Text>
                    {selectedPacker === packer && (
                      <Ionicons name="checkmark" size={20} color={colors.primary || "#34C759"} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Detail Modal */}
        <Modal
          visible={showDetailModal}
          transparent={true}
          animationType="slide"
          onRequestClose={closeDetailModal}
        >
          <View style={styles.detailModalOverlay}>
            <View style={styles.detailModal}>
              {/* Modal Header */}
              <View style={styles.detailModalHeader}>
                <Text style={styles.detailModalTitle}>Calibration Details</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeDetailModal}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {selectedRecord && (
                <ScrollView style={styles.detailModalContent}>
                  {/* Session Info */}
                  <View style={styles.sessionInfoCard}>
                    <Text style={styles.sessionInfoTitle}>Session Information</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Date & Time:</Text>
                      <Text style={styles.infoValue}>
                        {formatDate(selectedRecord.created_at)}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>User:</Text>
                      <Text style={styles.infoValue}>
                        {selectedRecord.user_name || "Unknown User"}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Machine:</Text>
                      <Text style={styles.infoValue}>{selectedPacker}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Total Records:</Text>
                      <Text style={styles.infoValue}>
                        {selectedRecord.data ? selectedRecord.data.length : 0}
                      </Text>
                    </View>
                  </View>

                  {/* Calibration Data */}
                  {selectedRecord.data && selectedRecord.data.length > 0 && (
                    <View style={styles.calibrationDataCard}>
                      <Text style={styles.calibrationDataTitle}>Measurements</Text>
                      
                      {/* Data Table Header */}
                      <View style={styles.dataTableHeader}>
                        <Text style={[styles.dataHeaderText, styles.indexColumn]}>#</Text>
                        <Text style={[styles.dataHeaderText, styles.inputColumn]}>Input</Text>
                        <Text style={[styles.dataHeaderText, styles.errorColumn]}>Error (%)</Text>
                        <Text style={[styles.dataHeaderText, styles.statusColumn]}>Status</Text>
                      </View>

                      {/* Data Rows */}
                      {selectedRecord.data.map((measurement, index) => {
                        const getErrorColor = (errorValue) => {
                          const err = parseFloat(errorValue);
                          if (err >= -0.5 && err <= 0.5) return "#4CAF50";
                          if ((err > 0.5 && err <= 2.5) || (err < -0.5 && err >= -2.5))
                            return "#FF9800";
                          return "#F44336";
                        };

                        const getStatusText = (errorValue) => {
                          const err = parseFloat(errorValue);
                          if (err >= -0.5 && err <= 0.5) return "Good";
                          if ((err > 0.5 && err <= 2.5) || (err < -0.5 && err >= -2.5))
                            return "Warning";
                          return "Critical";
                        };

                        return (
                          <View key={index} style={styles.dataTableRow}>
                            <Text style={[styles.dataCellText, styles.indexColumn]}>
                              {index + 1}
                            </Text>
                            <Text style={[styles.dataCellText, styles.inputColumn]}>
                              {measurement.input?.toFixed(2) || "N/A"}
                            </Text>
                            <Text style={[
                              styles.dataCellText, 
                              styles.errorColumn,
                              { color: getErrorColor(measurement.error) }
                            ]}>
                              {measurement.error?.toFixed(2) || "N/A"}
                            </Text>
                            <Text style={[
                              styles.dataCellText, 
                              styles.statusColumn,
                              { color: getErrorColor(measurement.error) }
                            ]}>
                              {getStatusText(measurement.error)}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default PackersHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || "#F8F9FA",
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    fontStyle: "italic",
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E1E5E9",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#FAFBFC",
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  fetchButtonContainer: {
    marginBottom: 20,
  },
  fetchButton: {
    backgroundColor: colors.primary || "#34C759",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary || "#34C759",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: "#ccc",
    shadowOpacity: 0.1,
  },
  fetchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dateColumn: {
    flex: 2,
    paddingRight: 8,
  },
  userColumn: {
    flex: 2,
    paddingHorizontal: 8,
  },
  recordsColumn: {
    flex: 1,
    alignItems: "center",
    paddingLeft: 8,
  },
  cellText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 18,
  },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownModal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    margin: 20,
    minWidth: 250,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  dropdownOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 5,
  },
  selectedOption: {
    backgroundColor: "#E8F5E8",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  selectedOptionText: {
    color: colors.primary || "#34C759",
    fontWeight: "600",
  },
  detailModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 20,
    maxHeight: "80%",
    width: "90%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  detailModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  detailModalContent: {
    maxHeight: "100%",
  },
  sessionInfoCard: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sessionInfoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  calibrationDataCard: {
    padding: 20,
  },
  calibrationDataTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  dataTableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  dataHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
  },
  dataTableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dataCellText: {
    fontSize: 13,
    color: "#333",
    textAlign: "center",
  },
  indexColumn: {
    flex: 0.5,
  },
  inputColumn: {
    flex: 1.5,
  },
  errorColumn: {
    flex: 1.5,
  },
  statusColumn: {
    flex: 1,
  },
  navigationContainer: {
    marginBottom: 16,
  },
  navigationButton: {
    backgroundColor: colors.primary || "#34C759",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary || "#34C759",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  navigationButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
});