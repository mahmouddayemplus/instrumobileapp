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
  console.log("SectionTasksList dataxxxxxxxxxxxxxxxxxxxx:" );
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
    />
  );
};

export default AreaTasksListComponent;
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    marginVertical: 4,
    borderRadius: 6,
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 16,
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
