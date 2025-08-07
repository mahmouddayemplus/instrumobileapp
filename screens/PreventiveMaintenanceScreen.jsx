import React, { useEffect, useState, useLayoutEffect } from "react";
import { colors } from "../constants/color";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import {
  initDb,
  getTasksFromSQLite,
  saveTasksToSQLite,
} from "../helper/database";
import { loadData, updateDetailedTasks } from "../firebase/firebaseConfig";
import { useNavigation } from "@react-navigation/native";

// Separate animated component to avoid hook issues
const AnimatedTaskCard = ({ item, onPress }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.cardContainer}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="construct" size={28} color={colors.primary} />
        </View>
        <Text style={styles.cardTitle}>{item.area}</Text>
        <Text style={styles.cardSubtitle}>
          {item.tags
            ? `${item.tags.reduce(
                (total, tag) => total + (tag.tasks?.length || 0),
                0
              )} tasks`
            : "No tasks"}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const PreventiveMaintenanceScreen = ({ navigation }) => {
  const user = useSelector((state) => state.auth.user);
  const [tasks, setTasks] = useState();
  const [loading, setLoading] = useState(false);
  const [areaTasks, setAreaTasks] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      let cached = await loadData("cached_tasks");

      if (!cached) {
        await updateDetailedTasks();
        cached = await loadData("cached_tasks");
      }

      if (cached) {
        setTasks(cached);
        // console.log("Tasks loaded:", cached);
      } else {
        // console.log("Failed to fetch or load cached tasks.");
      }
      setLoading(false);
    };

    fetchTasks();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Plant Maintenance",
      headerTitleStyle: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.primary,
      },
      headerStyle: {
        backgroundColor: colors.card,
        elevation: 0,
        shadowOpacity: 0,
      },
      headerRight: () => (
        <View style={styles.headerRight}>
          <View style={styles.userInfo}>
            <Ionicons name="person-circle" size={20} color={colors.primary} />
            <Text style={styles.welcomeText}>
              {user?.displayName || "User"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handlePress}
            style={styles.refreshButton}
            disabled={refreshing}
          >
            <Ionicons name="refresh" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, tasks, refreshing]);

  const handlePress = async () => {
    setRefreshing(true);
    await updateDetailedTasks();
    const cached = await loadData("cached_tasks");

    if (cached) {
      setTasks(cached);
      // console.log("Updated tasks loaded:", cached);
    } else {
      // console.log("No cached data found after update");
    }
    setRefreshing(false);
  };

  const renderItem = ({ item, index }) => (
    <AnimatedTaskCard
      item={item}
      onPress={() => navigation.navigate("TaskDetailScreen", { task: item })}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <Ionicons name="shield-checkmark" size={40} color={colors.card} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Maintenance Tasks</Text>
 
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="document-text-outline"
        size={64}
        color={colors.textSecondary}
      />
      <Text style={styles.emptyStateTitle}>No Tasks Available</Text>
      <Text style={styles.emptyStateSubtitle}>
        Pull to refresh or check your connection
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handlePress}
        />
      )}
    </SafeAreaView>
  );
};

export default PreventiveMaintenanceScreen;

const CARD_WIDTH = (Dimensions.get("window").width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 5,
    fontWeight: "500",
  },
  refreshButton: {
    padding: 5,
  },
  headerSection: {
    marginBottom: 20,
  },
  headerGradient: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    backgroundColor: colors.primary,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.card,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.card,
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardContainer: {
    width: CARD_WIDTH,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textSecondary,
    textAlign: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
