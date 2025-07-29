import { FlatList, View, Text, StyleSheet } from "react-native";
import { colors } from "../constants/color";

const SectionTasksList = ({ data }) => {
  console.log("SectionTasksList dataxxxxxxxxxxxxxxxxxxxx:", data[0].tags);


  const renderTagItem = ({ item }) => (
    <View style={styles.tagContainer}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.heading}>  {item.tag}</Text>
        <Text style={styles.title}>|  {item.title}</Text>
      </View>

      <FlatList
        data={item.tasks}
        keyExtractor={(task) => task.id}
        renderItem={({ item: task }) => (
          <View style={styles.taskItem}>
            <Text style={styles.taskText}>• {task.description}</Text>
            <Text
              style={[
                styles.status,
                task.status === "done" ? styles.done : styles.pending,
              ]}
            >
              Status: {task.status}
            </Text>
          </View>
        )}
      />
    </View>
  );

  return (
    <FlatList
      data={data[0].tags}
      keyExtractor={(item) => item.id}
      renderItem={renderTagItem}
    />
  );
};

export default SectionTasksList;
const styles = StyleSheet.create({
  tagContainer: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
  },
  title: {
    fontSize: 16,
    marginBottom: 10,
  },
  taskItem: {
    backgroundColor: "#f8f8f8",
    padding: 10,
    marginVertical: 4,
    borderRadius: 6,
  },
  taskText: {
    fontSize: 15,
  },
  status: {
    marginTop: 4,
    fontWeight: "600",
  },
  done: {
    color: "green",
  },
  pending: {
    color: "orange",
  },
});
