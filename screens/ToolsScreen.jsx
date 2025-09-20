import {
  StyleSheet,
  Text,
  View,
  Alert,
  ScrollView,
  StatusBar,
} from "react-native";
import React, { useLayoutEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import ToolComponent from "../components/ToolComponent";
import { useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { useDispatch } from "react-redux";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { removeUser } from "../helper/authStorage";
import { colors } from "../constants/color";

const ToolsScreen = ({ navigation }) => {
  const user = useSelector((state) => state.auth.user);
   const isPrivileged = user.isPrivileged;
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Tools & Calculators",
      headerTitleStyle: {
        fontSize: 14,
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
            <MaterialCommunityIcons
              name="account-circle"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.welcomeText}>
              {user?.displayName || "User"}
            </Text>
          </View>
          <MaterialCommunityIcons
            name="logout"
            size={24}
            color={colors.primary}
            style={styles.logoutIcon}
            onPress={() => {
              Alert.alert(
                "Confirm Logout",
                "Are you sure you want to log out?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                      dispatch(logout());
                      await removeUser();
                    },
                  },
                ],
                { cancelable: true }
              );
            }}
          />
        </View>
      ),
    });
  }, [navigation, user]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerGradient}>
            <View style={styles.headerContent}>
              <MaterialCommunityIcons
                name="tools"
                size={40}
                color={colors.card}
              />
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Industrial Tools</Text>
                <Text style={styles.headerSubtitle}>
                  Professional calculators and converters
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tools Grid */}
        <View style={styles.toolsContainer}>
          <View style={styles.toolsGrid}>
            <ToolComponent
              iconName="thermometer"
              titleLine1="PT100"
              titleLine2=""
              screenName="PT100Calculator"
            />
            <ToolComponent
              iconName="pulse"
              titleLine1="Thermocouple-k Type"
              titleLine2=""
              screenName="Thermocouple"
            />
          </View>
          <View style={styles.toolsGrid}>
            <ToolComponent
              iconName="funnel"
              titleLine1="Pressure"
              titleLine2="Converter"
              screenName="PressureConverter"
            />
            <ToolComponent
              iconName="calculator"
              titleLine1="Weigh Feeder"
              titleLine2="Correction Factor"
              screenName="WeighFeeder"
            />
          </View>

          <View style={styles.toolsGrid}>
            <ToolComponent
              iconName="calculator"
              titleLine1="Packer | VentoCheck"
              titleLine2="Calibrator"
              screenName="PackerScreen"
            />
        
          
            <ToolComponent
              iconName="hourglass-outline"
              titleLine1="Overtime"
              titleLine2="Tracker"
              screenName="Overtime"
            />
          </View>
          {
              isPrivileged 
              &&
              <View style={styles.toolsGrid}>
                        <ToolComponent
                          iconName="clipboard"
                          titleLine1="PLC Change "
                          titleLine2="Request"
                          screenName="PlcModification"/>
              
 
          </View>
}
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ToolsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
  logoutIcon: {
    padding: 5,
  },
  headerSection: {
    marginBottom: 20,
  },
  headerGradient: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 10,
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
    fontSize: 10,
    color: colors.card,
    opacity: 0.9,
  },
  toolsContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  toolsGrid: {
    flexDirection: "row",
    // flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 24,
    flexWrap: "nowrap",
  },
  comingSoonSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 12,
  },
  comingSoonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  comingSoonCard: {
    width: "48%",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    opacity: 0.6,
  },
  comingSoonText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "500",
    color: colors.textSecondary,
    textAlign: "center",
  },
});
