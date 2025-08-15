import React, { useState, useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/color";
import { KeyboardAvoidingView, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Alert } from "react-native";
import { useSelector } from "react-redux";
import { getAuth } from "firebase/auth";
import AdminOvertimeList from '../components/AdminOvertimeList'
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import OvertimeList from "../components/OvertimeList";
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
  const db = getFirestore();

  // const auth = getAuth();
  const user = useSelector((state) => state.auth.user);
  const navigation = useNavigation();

  const [id] = useState(user.companyId);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hours, setHours] = useState("");
  const [reason, setReason] = useState("");
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);
  const idForm = "entry.1448286481";
  const hoursForm = "entry.1722567950";
  const reasonForm = "entry.1660518312";
  const yearForm = "entry.1145477684_year";
  const monthForm = "entry.1145477684_month";
  const dayForm = "entry.1145477684_day";
  const googleFormUrl =
    "https://docs.google.com/forms/u/0/d/e/1FAIpQLSdYyjgPU5G8p1E6WPYYIzgw6YdYqzYihO7zW82I0M92wuL73A/formResponse";

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Overtime Tracker",
      headerStyle: { backgroundColor: colors.primary || "#34C759" },
      headerTintColor: "#fff",
      headerTitleStyle: { fontSize: 18, fontWeight: "600" },
      headerLeft: () => (
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.headerIconContainer}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerIconContainer}>
            <Ionicons name="hourglass-outline" size={24} color="#fff" />
          </View>
        </View>
      ),
    });
  }, [navigation]);

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };
  //////////////////////////////////////////////////////////////////////////////////////
  async function sendRequest() {
    if (!hours.trim() || !reason.trim()) {
      Alert.alert(
        "Missing Information",
        "Please fill in all fields before submitting."
      );
      return;
    }
    if (isNaN(hours) || Number(hours) <= 0) {
      Alert.alert("Invalid Hours", "Please enter a valid number of hours.");
      return;
    }

    try {
      setLoading(true);
      // const userAuth = auth.currentUser;
      const cltDate = new Date(date.getTime() + 3 * 60 * 60 * 1000);

      // Send to Firestore
      await addDoc(collection(db, "overtime"), {
        id,
        hours,
        reason,
        date: cltDate.toISOString(),
        createdAt: serverTimestamp(),
        uid: user ? user.uid : null,
      });
      //   Send to Google Sheets via Google Form
      const formBody = new URLSearchParams();
      formBody.append(idForm, id);
      formBody.append(hoursForm, hours);
      formBody.append(reasonForm, reason);
      formBody.append(yearForm, date.getFullYear());
      formBody.append(monthForm, date.getMonth() + 1); // Month is 0-indexed
      formBody.append(dayForm, date.getDate());
      await fetch(googleFormUrl, {
        method: "POST",
        body: formBody.toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      setReload((prev) => !prev);
      (prev) => !prev;
      Alert.alert("Success", "Your overtime request has been submitted.");
      setLoading(false);

      setHours("");
      setReason("");
      setDate(new Date());
    } catch (error) {
      console.error("Error submitting request:", error);
      Alert.alert("Error", "There was a problem submitting your request.");
    }
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
        {/* 
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        > */}
        
        { !user?.isAdmin ? 
          (
          <>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.card}>
              {/* ID */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ID</Text>
                <Text style={styles.input}>{id}</Text>
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
                  placeholder="e.g. 1"
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
                      minHeight: 60,
                      textAlignVertical: "top",
                      padding: 12,
                      backgroundColor: "#F4F6F8",
                    },
                  ]}
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Reason for overtime"
                  placeholderTextColor="#999"
                  multiline
                />
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.5 }]}
                onPress={sendRequest}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Submitting..." : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback> 
          <View style={styles.listContainer}>
          <OvertimeList reload={reload} setReload={setReload} user={user} />
        </View>
        </>


                ): <AdminOvertimeList/> 
        }
     
        
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
  container: { flex: 1, backgroundColor: colors.background || "#F8F9FA" },
  card: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
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
  dateText: { fontSize: 16, color: "#333", marginRight: 8 },
  button: {
    backgroundColor: colors.primary || "#34C759",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  headerLeft: { flexDirection: "row", alignItems: "center", marginLeft: 15 },
  headerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  listContainer: { marginTop: 10, flex: 1 },
});
