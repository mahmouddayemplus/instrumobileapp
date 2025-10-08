import React from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { colors } from "../constants/color";
import Icon from "react-native-vector-icons/Feather"; // or MaterialIcons, Ionicons...
import { db } from "../firebase/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { useSelector } from "react-redux";
const AreaTasksListComponent = ({ data, onTasksUpdated }) => {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [newDescription, setNewDescription] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [currentTag, setCurrentTag] = React.useState(null);
  const user = useSelector((state) => state.auth.user);
  const isAdmin = !!user?.isAdmin;

  // Edit Tag modal state
  const [editTagVisible, setEditTagVisible] = React.useState(false);
  const [editTagName, setEditTagName] = React.useState("");
  const [editTagTitle, setEditTagTitle] = React.useState("");
  const [savingTagEdit, setSavingTagEdit] = React.useState(false);
  const [tagEditing, setTagEditing] = React.useState(null);

  // Edit Task modal state
  const [editTaskVisible, setEditTaskVisible] = React.useState(false);
  const [editTaskDesc, setEditTaskDesc] = React.useState("");
  const [savingTaskEdit, setSavingTaskEdit] = React.useState(false);
  const [taskEditingContext, setTaskEditingContext] = React.useState({ tag: null, index: null, original: "" });
  // Prevent double-tap races while archiving
  const [archivingTagKey, setArchivingTagKey] = React.useState(null);
  const [archivingTaskKey, setArchivingTaskKey] = React.useState(null);

  const handleComplete = () => {};

  const openAddModal = (tagItem) => {
    if (!isAdmin) {
      Alert.alert("Not allowed", "Only admins can add tasks.");
      return;
    }
    setCurrentTag(tagItem);
    setNewDescription("");
    setModalVisible(true);
  };

  const handleDeleteTag = async (tagItem) => {
    if (!isAdmin) {
      Alert.alert("Not allowed", "Only admins can delete tags.");
      return;
    }
    const section = data?.[0];
    if (!section?.id || !tagItem?.tag) {
      Alert.alert("Missing data", "Cannot determine section or tag.");
      return;
    }
    try {
      const tags = section.tags || [];
      const idx = tags.findIndex((t) => t.tag === tagItem.tag);
      if (idx === -1) {
        Alert.alert("Tag not found", "Selected tag no longer exists.");
        return;
      }
      const updatedTags = tags.filter((_, i) => i !== idx);
      const ref = doc(db, "allTasks", section.id);
      await updateDoc(ref, { tags: updatedTags, updatedAt: new Date().toISOString() });
      if (typeof onTasksUpdated === "function") onTasksUpdated();
    } catch (e) {
      console.error("Failed to delete tag:", e);
      Alert.alert("Delete failed", e?.message || String(e));
    }
  };

  const handleToggleArchiveTag = async (tagItem) => {
    if (!isAdmin) {
      Alert.alert("Not allowed", "Only admins can archive tags.");
      return;
    }
    const section = data?.[0];
    if (!section?.id || !tagItem?.tag) {
      Alert.alert("Missing data", "Cannot determine section or tag.");
      return;
    }
    try {
      if (archivingTagKey === tagItem.tag) return; // in-flight
      setArchivingTagKey(tagItem.tag);
      const tags = section.tags || [];
      const idx = tags.findIndex((t) => t.tag === tagItem.tag);
      if (idx === -1) {
        Alert.alert("Tag not found", "Selected tag no longer exists.");
        return;
      }
  const origTag = tags[idx] || {};
  const currentArchived = !!(origTag.archived ?? origTag.archive ?? false);
  const nextArchived = !currentArchived;
  const updatedTag = { ...origTag, archived: nextArchived, archive: nextArchived };
      const updatedTags = [...tags];
      updatedTags[idx] = updatedTag;
      const ref = doc(db, "allTasks", section.id);
      await updateDoc(ref, { tags: updatedTags, updatedAt: new Date().toISOString() });
      if (typeof onTasksUpdated === "function") onTasksUpdated();
    } catch (e) {
      console.error("Failed to toggle archive tag:", e);
      Alert.alert("Update failed", e?.message || String(e));
    } finally {
      setArchivingTagKey(null);
    }
  };

  const openEditTag = (tagItem) => {
    if (!isAdmin) {
      Alert.alert("Not allowed", "Only admins can edit tags.");
      return;
    }
    setTagEditing(tagItem);
    setEditTagName(tagItem?.tag || "");
    setEditTagTitle(tagItem?.title || "");
    setEditTagVisible(true);
  };

  const saveEditTag = async () => {
    if (!isAdmin) {
      Alert.alert("Not allowed", "Only admins can edit tags.");
      return;
    }
    const section = data?.[0];
    if (!section?.id || !tagEditing?.tag) {
      Alert.alert("Missing data", "Cannot determine section or tag.");
      return;
    }
    const newKey = editTagName.trim();
    const newTitle = editTagTitle.trim() || newKey;
    if (!newKey) {
      Alert.alert("Required", "Please enter a tag key.");
      return;
    }
    try {
      setSavingTagEdit(true);
      const tags = section.tags || [];
      const idx = tags.findIndex((t) => t.tag === tagEditing.tag);
      if (idx === -1) {
        Alert.alert("Tag not found", "Selected tag no longer exists.");
        return;
      }
      const exists = tags.some((t, i) => i !== idx && (t?.tag || "").trim().toLowerCase() === newKey.toLowerCase());
      if (exists) {
        Alert.alert("Duplicate tag", "Another tag already uses this key.");
        return;
      }
      const origTag = tags[idx] || {};
      const updatedTag = { ...origTag, tag: newKey, title: newTitle };
      const updatedTags = [...tags];
      updatedTags[idx] = updatedTag;
      const ref = doc(db, "allTasks", section.id);
      await updateDoc(ref, { tags: updatedTags, updatedAt: new Date().toISOString() });
      setEditTagVisible(false);
      setTagEditing(null);
      if (typeof onTasksUpdated === "function") onTasksUpdated();
    } catch (e) {
      console.error("Failed to edit tag:", e);
      Alert.alert("Edit failed", e?.message || String(e));
    } finally {
      setSavingTagEdit(false);
    }
  };

  const openEditTask = (tagItem, taskIndex, task) => {
    if (!isAdmin) {
      Alert.alert("Not allowed", "Only admins can edit tasks.");
      return;
    }
    setTaskEditingContext({ tag: tagItem, index: taskIndex, original: task?.description || "" });
    setEditTaskDesc(task?.description || "");
    setEditTaskVisible(true);
  };

  const saveEditTask = async () => {
    if (!isAdmin) {
      Alert.alert("Not allowed", "Only admins can edit tasks.");
      return;
    }
    const { tag: tagItem, index } = taskEditingContext;
    const section = data?.[0];
    if (!section?.id || !tagItem?.tag) {
      Alert.alert("Missing data", "Cannot determine section or tag.");
      return;
    }
    const newDesc = (editTaskDesc || "").trim();
    if (!newDesc) {
      Alert.alert("Required", "Please enter a task description.");
      return;
    }
    try {
      setSavingTaskEdit(true);
      const tags = section.tags || [];
      const idx = tags.findIndex((t) => t.tag === tagItem.tag);
      if (idx === -1) {
        Alert.alert("Tag not found", "Selected tag no longer exists.");
        return;
      }
      const origTag = tags[idx] || {};
      const tasks = [...(origTag.tasks || [])];
      if (index < 0 || index >= tasks.length) {
        Alert.alert("Task not found", "The task you tried to edit doesn't exist.");
        return;
      }
      // Duplicate prevention within tag, excluding current index
      const normalizedNew = newDesc.toLowerCase();
      const exists = tasks.some((t, i) => i !== index && (t?.description || "").trim().toLowerCase() === normalizedNew);
      if (exists) {
        Alert.alert("Duplicate task", "Another task already uses this description in this tag.");
        return;
      }
      const currentTask = tasks[index];
      tasks[index] = { ...currentTask, description: newDesc };
      const updatedTag = { ...origTag, tasks };
      const updatedTags = [...tags];
      updatedTags[idx] = updatedTag;
      const ref = doc(db, "allTasks", section.id);
      await updateDoc(ref, { tags: updatedTags, updatedAt: new Date().toISOString() });
      setEditTaskVisible(false);
      setTaskEditingContext({ tag: null, index: null, original: "" });
      if (typeof onTasksUpdated === "function") onTasksUpdated();
    } catch (e) {
      console.error("Failed to edit task:", e);
      Alert.alert("Edit failed", e?.message || String(e));
    } finally {
      setSavingTaskEdit(false);
    }
  };

  const handleDeleteTask = async (tagItem, taskIndex) => {
    if (!isAdmin) {
      Alert.alert("Not allowed", "Only admins can delete tasks.");
      return;
    }
    const section = data?.[0];
    if (!section?.id || !tagItem?.tag) {
      Alert.alert("Missing data", "Cannot determine section or tag.");
      return;
    }
    try {
      const tags = section.tags || [];
      const idx = tags.findIndex((t) => t.tag === tagItem.tag);
      if (idx === -1) {
        Alert.alert("Tag not found", "Selected tag no longer exists.");
        return;
      }
      const origTag = tags[idx] || {};
      const tasks = origTag.tasks || [];
      if (taskIndex < 0 || taskIndex >= tasks.length) {
        Alert.alert("Task not found", "The task you tried to delete doesn't exist.");
        return;
      }
      const newTasks = tasks.filter((_, i) => i !== taskIndex);
      const updatedTag = { ...origTag, tasks: newTasks };
      const updatedTags = [...tags];
      updatedTags[idx] = updatedTag;

      const ref = doc(db, "allTasks", section.id);
      await updateDoc(ref, { tags: updatedTags, updatedAt: new Date().toISOString() });

      if (typeof onTasksUpdated === "function") {
        onTasksUpdated();
      }
    } catch (e) {
      console.error("Failed to delete task:", e);
      Alert.alert("Delete failed", e?.message || String(e));
    }
  };

  const handleToggleArchiveTask = async (tagItem, taskIndex) => {
    if (!isAdmin) {
      Alert.alert("Not allowed", "Only admins can archive tasks.");
      return;
    }
    const section = data?.[0];
    if (!section?.id || !tagItem?.tag) {
      Alert.alert("Missing data", "Cannot determine section or tag.");
      return;
      }
    try {
      const taskKey = `${tagItem.tag}::${taskIndex}`;
      if (archivingTaskKey === taskKey) return; // in-flight
      setArchivingTaskKey(taskKey);
      const tags = section.tags || [];
      const idx = tags.findIndex((t) => t.tag === tagItem.tag);
      if (idx === -1) {
        Alert.alert("Tag not found", "Selected tag no longer exists.");
        return;
      }
      const origTag = tags[idx] || {};
      const tasks = [...(origTag.tasks || [])];
      if (taskIndex < 0 || taskIndex >= tasks.length) {
        Alert.alert("Task not found", "The task you tried to update doesn't exist.");
        return;
      }
  const current = tasks[taskIndex] || {};
  const currentArchived = !!(current.archived ?? current.archive ?? false);
  const nextArchived = !currentArchived;
  tasks[taskIndex] = { ...current, archived: nextArchived, archive: nextArchived };
      const updatedTag = { ...origTag, tasks };
      const updatedTags = [...tags];
      updatedTags[idx] = updatedTag;
      const ref = doc(db, "allTasks", section.id);
      await updateDoc(ref, { tags: updatedTags, updatedAt: new Date().toISOString() });
      if (typeof onTasksUpdated === "function") onTasksUpdated();
    } catch (e) {
      console.error("Failed to toggle archive task:", e);
      Alert.alert("Update failed", e?.message || String(e));
    } finally {
      setArchivingTaskKey(null);
    }
  };

  const addTaskToFirestore = async () => {
    if (!isAdmin) {
      Alert.alert("Not allowed", "Only admins can add tasks.");
      return;
    }
    const section = data?.[0];
    if (!section?.id || !currentTag?.tag) {
      Alert.alert("Missing data", "Cannot determine section or tag.");
      return;
    }
    if (!newDescription.trim()) {
      Alert.alert("Required", "Please enter a task description.");
      return;
    }
    try {
      setSaving(true);
      const tags = section.tags || [];
      const idx = tags.findIndex((t) => t.tag === currentTag.tag);
      if (idx === -1) {
        Alert.alert("Tag not found", "Selected tag no longer exists.");
        return;
      }
      const origTag = tags[idx] || {};
      // Duplicate prevention (case-insensitive, trimmed)
      const normalizedNew = newDescription.trim().toLowerCase();
      const exists = (origTag.tasks || []).some(
        (t) => (t?.description || "").trim().toLowerCase() === normalizedNew
      );
      if (exists) {
        Alert.alert("Duplicate task", "A task with this description already exists in this tag.");
        return;
      }
      const updatedTag = {
        ...origTag,
        tasks: [
          ...(origTag.tasks || []),
          { description: newDescription.trim(), status: "pending", archived: false, archive: false },
        ],
      };
      const updatedTags = [...tags];
      updatedTags[idx] = updatedTag;

      const ref = doc(db, "allTasks", section.id);
      await updateDoc(ref, { tags: updatedTags, updatedAt: new Date().toISOString() });

      setModalVisible(false);
      setNewDescription("");
      setCurrentTag(null);
      // Ask parent to refresh cache from Firestore
      if (typeof onTasksUpdated === "function") {
        onTasksUpdated();
      }
    } catch (e) {
      console.error("Failed to add task:", e);
      Alert.alert("Add failed", e?.message || String(e));
    } finally {
      setSaving(false);
    }
  };
  const renderTagItem = ({ item }) => (
  <View style={[styles.tagContainer, isAdmin && (item?.archived || item?.archive) ? styles.archivedTag : null]}>
      <View style={styles.tagHeader}>
        <View>
          <Text style={styles.heading}>{item.tag}</Text>
          <Text style={styles.title}>{item.title}</Text>
        </View>
        {isAdmin && (
          <View style={styles.tagHeaderActions}>
            <TouchableOpacity style={styles.addBtn} onPress={() => openAddModal(item)}>
              <Icon name="plus-circle" size={22} color={colors.primaryDark || "#2e7d32"} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addBtn, { marginLeft: 6 }]} onPress={() => handleToggleArchiveTag(item)}>
              <Icon name="archive" size={18} color={(item?.archived || item?.archive) ? "#f59e0b" : (colors.primaryDark || "#2e7d32")} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addBtn, { marginLeft: 6 }]} onPress={() => openEditTag(item)}>
              <Icon name="edit-2" size={18} color={colors.primaryDark || "#2e7d32"} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, { marginLeft: 6 }]}
              onPress={() =>
                Alert.alert(
                  "Delete tag?",
                  `This will remove the tag and all its tasks.\n\nTag: ${item.tag}`,
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => handleDeleteTag(item),
                    },
                  ]
                )
              }
            >
              <Icon name="trash-2" size={20} color="#e11d48" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        data={
          isAdmin
            ? (item.tasks || [])
            : (item.tasks || []).filter((t) => !(t?.archived === true || t?.archive === true))
        }
        keyExtractor={(task) => task.description}
        renderItem={({ item: task, index: taskIndex }) => (
          <View style={[styles.taskItem, isAdmin && (task?.archived || task?.archive) ? styles.archivedTask : null]}>
            <Text style={styles.taskText}>• {task.description}</Text>
            <View style={styles.taskActions}>
              <TouchableOpacity onPress={() => handleComplete(task.id)} style={styles.taskActionBtn}>
                <Icon name="check-circle" size={20} color="green" />
              </TouchableOpacity>
              {isAdmin && (
                <TouchableOpacity onPress={() => handleToggleArchiveTask(item, taskIndex)} style={styles.taskActionBtn}>
                  <Icon name="archive" size={18} color={(task?.archived || task?.archive) ? "#f59e0b" : (colors.primaryDark || "#2e7d32")} />
                </TouchableOpacity>
              )}
              {isAdmin && (
                <TouchableOpacity onPress={() => openEditTask(item, taskIndex, task)} style={styles.taskActionBtn}>
                  <Icon name="edit-2" size={18} color={colors.primaryDark || "#2e7d32"} />
                </TouchableOpacity>
              )}
              {isAdmin && (
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      "Delete task?",
                      `Are you sure you want to delete this task?\n\n${task.description}`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => handleDeleteTask(item, taskIndex),
                        },
                      ]
                    )
                  }
                  style={styles.taskActionBtn}
                >
                  <Icon name="trash-2" size={20} color="#e11d48" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  //   const handleComplete = (taskId) => {
  //   setTasks((prev) => prev.filter((task) => task.id !== taskId));
  // };
  );

  return (
    <>
      <FlatList
        data={isAdmin ? data[0].tags : data[0].tags.filter((t) => !t?.archived)}
        keyExtractor={(item) => item.tag}
        renderItem={renderTagItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Add Task Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !saving && setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Add Task {currentTag ? `to ${currentTag.tag}` : ""}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Task description"
              value={newDescription}
              onChangeText={setNewDescription}
              editable={!saving}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtn}
                disabled={saving}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalPrimary]}
                onPress={addTaskToFirestore}
                disabled={saving}
              >
                {saving ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={[styles.modalBtnText, { color: '#fff' }]}>Saving...</Text>
                  </View>
                ) : (
                  <Text style={[styles.modalBtnText, { color: '#fff' }]}>Add Task</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Tag Modal */}
      <Modal
        visible={editTagVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !savingTagEdit && setEditTagVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Tag</Text>
            <TextInput
              style={styles.input}
              placeholder="Tag (unique key)"
              value={editTagName}
              onChangeText={setEditTagName}
              editable={!savingTagEdit}
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.input, { marginTop: 8 }]}
              placeholder="Title"
              value={editTagTitle}
              onChangeText={setEditTagTitle}
              editable={!savingTagEdit}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtn} disabled={savingTagEdit} onPress={() => setEditTagVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalPrimary]} disabled={savingTagEdit} onPress={saveEditTag}>
                {savingTagEdit ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={[styles.modalBtnText, { color: '#fff' }]}>Saving...</Text>
                  </View>
                ) : (
                  <Text style={[styles.modalBtnText, { color: '#fff' }]}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        visible={editTaskVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !savingTaskEdit && setEditTaskVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Task</Text>
            <TextInput
              style={styles.input}
              placeholder="Task description"
              value={editTaskDesc}
              onChangeText={setEditTaskDesc}
              editable={!savingTaskEdit}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtn} disabled={savingTaskEdit} onPress={() => setEditTaskVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalPrimary]} disabled={savingTaskEdit} onPress={saveEditTask}>
                {savingTaskEdit ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={[styles.modalBtnText, { color: '#fff' }]}>Saving...</Text>
                  </View>
                ) : (
                  <Text style={[styles.modalBtnText, { color: '#fff' }]}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default AreaTasksListComponent;
const styles = StyleSheet.create({
  tagContainer: {
    marginVertical: 10,
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  tagHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  heading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1c1c1e",
  },
  title: {
    fontSize: 12,
    color: "#555",
  },
  tagHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  addBtn: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
  },
  archivedTag: {
    opacity: 0.6,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f6fa",
    marginVertical: 6,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  taskText: {
    fontSize: 12,
    flex: 1,
    color: "#333",
    paddingRight: 10,
  },
  taskActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  taskActionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  archivedTask: {
    opacity: 0.6,
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
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
  },
  modalBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  modalPrimary: {
    backgroundColor: colors.primaryDark || "#2e7d32",
  },
  modalBtnText: {
    color: "#111",
    fontWeight: "600",
  },
});

// Inline Modal so it's within this component's tree
// Render at bottom so it overlays the list
