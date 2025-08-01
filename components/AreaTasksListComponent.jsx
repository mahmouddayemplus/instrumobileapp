import {
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { colors } from "../constants/color";
import Icon from "react-native-vector-icons/Feather"; // or MaterialIcons, Ionicons...

const AreaTasksListComponent = ({ data }) => {
   // console.log("SectionTasksList dataxxxxxxxxxxxxxxxxxxxx:", data[0]);
  // const [tasks, setTasks] = useState(item.tasks);
  const handleComplete = () => {};
  const renderTagItem = ({ item }) => (
    <View style={styles.tagContainer}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.heading}> {item.tag}</Text>
        <Text style={styles.title}>| {item.title}</Text>
      </View>

      <FlatList
        data={item.tasks}
        keyExtractor={(task) => task.id}
        renderItem={({ item: task }) => (
          <View style={styles.taskItem}>
            <Text style={styles.taskText}>• {task.description}</Text>
            <TouchableOpacity onPress={() => handleComplete(task.id)}>
              <Icon name="check-circle" size={24} color="green" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  //   const handleComplete = (taskId) => {
  //   setTasks((prev) => prev.filter((task) => task.id !== taskId));
  // };
  );

  return (
    <FlatList
      data={data[0].tags}
      keyExtractor={(item) => item.tag}
      renderItem={renderTagItem}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
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
  heading: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1c1c1e",
  },
  title: {
    fontSize: 15,
    color: "#555",
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
    fontSize: 15,
    flex: 1,
    color: "#333",
    paddingRight: 10,
  },
});