import { StyleSheet, Text, View } from "react-native";
import React, { useLayoutEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";

const TaskDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const { task } = route.params;
  useLayoutEffect(() => {
    navigation.setOptions({ title: ` ${task.section}` });
  }, [navigation, task]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task Details</Text>
      <Text style={styles.item}>Section: {task.section}</Text>
      <Text style={styles.item}>ID: {task.id}</Text>
      {/* Add more fields as needed */}
    </View>
  );
};

export default TaskDetailScreen;

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  item: { fontSize: 18, marginVertical: 5 },
});
