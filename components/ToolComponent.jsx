import React from "react";

import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
  Dimensions,ActivityIndicator
} from "react-native";
import { loadCompanyId } from "../firebase/firebaseConfig";
import { useState,useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // You can use other icon sets too

const screenWidth = Dimensions.get("window").width;
const itemWidth = Platform.OS === "ios" ? screenWidth / 2.4 : screenWidth / 2.2;

const ToolComponent = ({ iconName,titleLine1,titleLine2, screenName }) => {
  const navigation = useNavigation();
  const [companyId, setCompanyId] = useState(null);
  const [loading, setLoading] = useState(true);
 

  return (
    <Pressable
      onPress={() => navigation.navigate(screenName)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <Ionicons name={iconName} size={32} color="#43ad49ff" />
      <Text style={styles.title}>{titleLine1}</Text>
      <Text style={styles.title}>{titleLine2}</Text>
    </Pressable>
  );
};

export default ToolComponent;

const styles = StyleSheet.create({
  container: {
    width: itemWidth,
    alignItems: "center",
    padding: 16,
    margin: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
});
