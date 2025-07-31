import React, { useLayoutEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const defaultImage = require("../assets/no-image.webp");

const SpareDetailScreen = ({ route }) => {
  const { item } = route.params;
  const navigation = useNavigation();

  const imageUrl = `https://res.cloudinary.com/dsnl3mogn/image/upload/${item.code}.webp`;

  useLayoutEffect(() => {
    navigation.setOptions({ title: item.code });
  }, [navigation, item]);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Image
        source={{ uri: imageUrl }}
        defaultSource={defaultImage}
        onError={() => console.log("Failed to load image")}
        style={styles.image}
        resizeMode="contain"
      />

      <View style={styles.card}>
        <Text style={styles.label}>Details</Text>
        <Text style={styles.value}>{item.title}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>SAP Code</Text>
        <Text style={styles.value}>{item.code}</Text>
      </View>

      {/* You can add more info cards here like description, location, quantity, etc. */}
    </ScrollView>
  );
};

export default SpareDetailScreen;

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  image: {
    width: screenWidth - 32,
    height: 280,
    borderRadius: 12,
    backgroundColor: "#e0e0e0",
    marginBottom: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: "#999",
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    color: "#333",
    fontWeight: "500",
  },
});
