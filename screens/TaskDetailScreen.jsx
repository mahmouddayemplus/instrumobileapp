import {
  StyleSheet,
  Text,
  View,
  Button,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  Platform,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useLayoutEffect, useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { loadData, updateDetailedTasks } from "../firebase/firebaseConfig"; // Combined imports
import AreaTasksListComponent from "../components/AreaTasksListComponent";
import { Ionicons } from "@expo/vector-icons"; // or use Feather, MaterialIcons, etc.
import { writeAllTasksToFirestore } from "../firebase/fireStoreBulkWrite";
import { demoData } from "../firebase/demoData";
import { colors } from "../constants/color";
import { useSelector } from "react-redux";
import { db } from "../firebase/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

const TaskDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [tasks, setTasks] = useState(null);
  const [areaTasks, setAreaTasks] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSafetyWarning, setShowSafetyWarning] = useState(false);
  const [addTagVisible, setAddTagVisible] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagTitle, setNewTagTitle] = useState("");
  const [savingTag, setSavingTag] = useState(false);
  const { task } = route.params;
  const taskId = task.id; // Assuming task has an id field
  const user = useSelector((state) => state.auth.user);
  const isAdmin = !!user?.isAdmin;

  // Helper function to get the actual task count
  const getTaskCount = () => {
    if (areaTasks && areaTasks[0] && areaTasks[0].tags) {
      const numberOfTask = areaTasks[0].tags.reduce(
        (total, tag) => total + (tag.tasks?.length || 0),
        0 // ← Initial value
      );
      return numberOfTask;
    }
    return 0;
  };

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        let cached = await loadData("cached_tasks");

        if (!cached) {
          await updateDetailedTasks(); // Fetch from Firestore and store in AsyncStorage
          cached = await loadData("cached_tasks"); // Load again after update
        }

        if (cached) {
          setTasks(cached);
        } else {
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handlePress = async () => {
    setIsRefreshing(true);
    try {
      await updateDetailedTasks();
      const cached = await loadData("cached_tasks");

      if (cached) {
        setTasks(cached);
      } else {
        // No cached data found after update
      }
    } catch (error) {
      console.error("Error updating tasks:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false, // Hide the navigation header completely
    });
  }, [navigation]);

  useEffect(() => {
    if (tasks && taskId) {
      const taskById = tasks.filter((t) => t.sectionId === taskId);

      if (taskById.length !== 0) {
        setAreaTasks(taskById);
      }
    }
  }, [tasks, taskId]); // only runs when tasks or taskId change

  const shouldWriteData = false; // Toggle manually

  useEffect(() => {
    if (shouldWriteData) {
      writeAllTasksToFirestore(demoData);
    }
  }, [shouldWriteData]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.primary || "#34C759"}
        />
        <View style={styles.loadingContent}>
          <View style={styles.loadingIconContainer}>
            <ActivityIndicator
              size="large"
              color={colors.primary || "#34C759"}
            />
          </View>
          <Text style={styles.loadingText}>Loading tasks...</Text>
          <Text style={styles.loadingSubtext}>
            Please wait while we fetch your data
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!areaTasks || areaTasks.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.primary || "#34C759"}
        />
        <View style={styles.emptyContent}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="document-outline" size={80} color="#ccc" />
          </View>
          <Text style={styles.emptyTitle}>No Tasks Found</Text>
          <Text style={styles.emptySubtext}>
            There are no tasks available for this area at the moment.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handlePress}
            disabled={isRefreshing}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary || "#34C759"}
      />

      {/* Custom Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.areaTitle}>{task.area}</Text>
            <Text style={styles.taskCount}>
              {getTaskCount()} task{getTaskCount() !== 1 ? "s" : ""} available
            </Text>
          </View>

          <TouchableOpacity
            onPress={handlePress}
            style={styles.refreshButton}
            disabled={isRefreshing}
          >
            <Ionicons
              name="refresh"
              size={24}
              color="#fff"
              style={isRefreshing ? styles.rotating : null}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Collapsible Safety Warning */}
      <TouchableOpacity
        style={styles.safetyToggle}
        onPress={() => setShowSafetyWarning(!showSafetyWarning)}
        activeOpacity={0.7}
      >
        <View style={styles.safetyToggleContent}>
          <Ionicons name="warning" size={16} color="#FF6B35" />
          <Text style={styles.safetyToggleText}>Safety Guidelines</Text>
          <Ionicons
            name={showSafetyWarning ? "chevron-up" : "chevron-down"}
            size={16}
            color="#666"
          />
        </View>
      </TouchableOpacity>

      {showSafetyWarning && (
        <View style={styles.safetySection}>
          <Text style={styles.safetyText}>
            Ensure to apply electrical isolation (LOTOTO) and release all stored
            energy before starting the work.
          </Text>
          <View style={styles.stopContainer}>
            <Text style={styles.stopTitle}>STOP</Text>
            <Text style={styles.stopSubtitle}>
              Stop, Think, Observe, Proceed
            </Text>
          </View>
        </View>
      )}

      {/* Tasks Section */}
      <View style={styles.tasksSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.primary || "#34C759"}
            />
            <Text style={styles.sectionTitle}>Available Tasks</Text>
          </View>
          <View style={styles.sectionRight}>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{getTaskCount()}</Text>
            </View>
            {isAdmin && (
              <TouchableOpacity
                onPress={() => {
                  setNewTagName("");
                  setNewTagTitle("");
                  setAddTagVisible(true);
                }}
                style={styles.addTagBtn}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <AreaTasksListComponent
          data={areaTasks}
          onTasksUpdated={async () => {
            // Refresh cache and reload
            await updateDetailedTasks();
            const cached = await loadData("cached_tasks");
            if (cached) {
              setTasks(cached);
            }
          }}
        />
      </View>

      {/* Refresh Status Overlay */}
      {isRefreshing && (
        <View style={styles.refreshOverlay}>
          <View style={styles.refreshStatus}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.refreshStatusText}>Updating tasks...</Text>
          </View>
        </View>
      )}
      {isAdmin && (
        <Modal
          visible={addTagVisible}
          transparent
          animationType="fade"
          onRequestClose={() => !savingTag && setAddTagVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Add New Tag</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Tag (unique key)"
                value={newTagName}
                onChangeText={setNewTagName}
                editable={!savingTag}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Title (optional)"
                value={newTagTitle}
                onChangeText={setNewTagTitle}
                editable={!savingTag}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalBtn}
                  disabled={savingTag}
                  onPress={() => setAddTagVisible(false)}
                >
                  <Text style={styles.modalBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalPrimary]}
                  disabled={savingTag}
                  onPress={async () => {
                    const section = areaTasks?.[0];
                    const tagVal = newTagName.trim();
                    const titleVal = newTagTitle.trim() || tagVal;
                    if (!section?.id) return;
                    if (!tagVal) {
                      Alert.alert("Required", "Please enter a tag.");
                      return;
                    }
                    try {
                      setSavingTag(true);
                      const tags = section.tags || [];
                      const exists = tags.some(
                        (t) => (t?.tag || "").trim().toLowerCase() === tagVal.toLowerCase()
                      );
                      if (exists) {
                        Alert.alert("Duplicate tag", "A tag with this key already exists.");
                        return;
                      }
                      const updatedTags = [
                        ...tags,
                        { tag: tagVal, title: titleVal, tasks: [], archived: false, archive: false },
                      ];
                      const ref = doc(db, "allTasks", section.id);
                      await updateDoc(ref, {
                        tags: updatedTags,
                        updatedAt: new Date().toISOString(),
                      });
                      setAddTagVisible(false);
                      setNewTagName("");
                      setNewTagTitle("");
                      await updateDetailedTasks();
                      const cached = await loadData("cached_tasks");
                      if (cached) setTasks(cached);
                    } catch (e) {
                      console.error("Failed to add tag:", e);
                      Alert.alert("Add failed", e?.message || String(e));
                    } finally {
                      setSavingTag(false);
                    }
                  }}
                >
                  {savingTag ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={[styles.modalBtnText, { color: '#fff' }]}>Saving...</Text>
                    </View>
                  ) : (
                    <Text style={[styles.modalBtnText, { color: '#fff' }]}>Add Tag</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default TaskDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background || "#F8F9FA",
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background || "#F8F9FA",
  },
  emptyContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 40,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary || "#34C759",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
  headerSection: {
    backgroundColor: colors.primary || "#34C759",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  areaTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  taskCount: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  safetyToggle: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  safetyToggleContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  safetyToggleText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  safetySection: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  safetyText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 20,
    marginBottom: 12,
  },
  stopContainer: {
    backgroundColor: "#FF6B35",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  stopTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 2,
  },
  stopSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    opacity: 0.9,
  },
  tasksSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginLeft: 8,
  },
  sectionBadge: {
    backgroundColor: colors.primary || "#34C759",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 32,
    alignItems: "center",
  },
  sectionBadgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  sectionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  refreshOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  refreshStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
  },
  refreshStatusText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 12,
    fontWeight: "600",
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  rotating: {
    transform: [{ rotate: "360deg" }],
  },
  headerSection: {
    backgroundColor: colors.primary || "#34C759",
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  addTagBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary || "#34C759",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: "#111",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111",
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },
  modalBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  modalPrimary: {
    backgroundColor: colors.primary || "#34C759",
  },
  modalBtnText: {
    color: "#111",
    fontWeight: "600",
  },
});
