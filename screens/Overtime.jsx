import React, { useState, useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/color";
import { KeyboardAvoidingView, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Alert } from "react-native"; // add this at the top
import { useSelector } from "react-redux";

import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  SafeAreaView,
  TextInput,
  Keyboard,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from "react-native";

const Overtime = () => {
  const user = useSelector((state) => state.auth.user);
  const navigation = useNavigation();
  const [id, setId] = useState(user.companyId);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hours, setHours] = useState("");
  const [reason, setReason] = useState("");
  const URL =
    "https://docs.google.com/forms/u/0/d/e/1FAIpQLSdYyjgPU5G8p1E6WPYYIzgw6YdYqzYihO7zW82I0M92wuL73A/formResponse";

  const idForm = "entry.1448286481";
  const hoursForm = "entry.1722567950";
  const reasonForm = "entry.1660518312";
  const yearForm = "entry.1145477684_year";
  const monthForm = "entry.1145477684_month";
  const dayForm = "entry.1145477684_day";

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Overtime Tracker",
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
            <Ionicons name="time-outline" size={24} color="#fff" />
          </View>
        </View>
      ),
    });
  }, [navigation]);

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  function sendRequest() {
    if (!id.trim() || !hours.trim() || !reason.trim() || !date) {
      Alert.alert(
        "Missing Information",
        "Please fill in all fields before submitting."
      );
      return;
    }

    const formData = {
      id,
      date: date.toISOString().split("T")[0],
      hours,
      reason,
    };

    console.log("Data to send:", formData);

    // Later: send to Google Form + Firestore
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.primary || "#34C759"}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.card}>
              {/* ID */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ID</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={id}
                  onChangeText={setId}
                  placeholder="ID"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateText}>{date.toDateString()}</Text>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={colors.primary || "#34C759"}
                  />
                </TouchableOpacity>
              </View>

              {/* Hours */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Hours</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={hours}
                  onChangeText={setHours}
                  placeholder="e.g. 4"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Reason */}
              <View
                style={[
                  styles.inputGroup,
                  { flexDirection: "column", alignItems: "flex-start" },
                ]}
              >
                <Text style={[styles.inputLabel, { marginBottom: 5 }]}>
                  Reason
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      width: "100%",
                      textAlign: "left",
                      minHeight: 60,
                      textAlignVertical: "top",
                      padding: 12, // more padding for comfort
                      backgroundColor: "#F4F6F8", // light background for contrast
                    },
                  ]}
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Reason for overtime"
                  placeholderTextColor="#999"
                  multiline={true}
                  numberOfLines={2}
                />
              </View>

              {/* Submit */}
              <TouchableOpacity style={styles.button} onPress={sendRequest}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeDate}
          />
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Overtime;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || "#F8F9FA",
  },
  scroll: {
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginRight: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E1E5E9",
    borderRadius: 12,
    padding: 8,
    fontSize: 16,
    backgroundColor: "#FAFBFC",
    color: "#333",
    fontWeight: "500",
    textAlign: "center",
    width: 80,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E1E5E9",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FAFBFC",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
    marginRight: 8,
  },
  button: {
    backgroundColor: colors.primary || "#34C759",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
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
});
