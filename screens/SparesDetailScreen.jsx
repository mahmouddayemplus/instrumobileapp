import React, { useLayoutEffect, useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons"; // or use Feather, MaterialIcons, etc.
import { handleShareToWhatsApp } from "../helper/handleShareToWhatsApp";
import { Linking } from "react-native";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch,useSelector } from "react-redux";
const defaultImage = require("../assets/no-image.webp");
import { toggleFavorite } from "../store/favoritesSlice";

const SpareDetailScreen = ({ route }) => {
  // const [favorites, setFavorites] = useState([]);
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.items);

  const { item } = route.params;

  const navigation = useNavigation();

  const imageUrl = `https://res.cloudinary.com/dsnl3mogn/image/upload/${item.code}.webp`;
 

  useLayoutEffect(() => {
    navigation.setOptions({ title: item.code });
  }, [navigation, item]);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {/* Image Container with Icons */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          defaultSource={defaultImage}
          onError={() => console.log("Failed to load image")}
          style={styles.image}
          resizeMode="contain"
        />

        <TouchableOpacity
          onPress={() =>dispatch(toggleFavorite(item.code))}
          style={[styles.iconOverlay, { top: 10, right: 50 }]} // Adjust position
        >
          <Ionicons
            name={favorites.includes(item.code) ? "heart" : "heart-outline"}
            size={26}
            color={favorites.includes(item.code) ? "red" : "#fff"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleShareToWhatsApp(item)}
          style={[styles.iconOverlay, { top: 10, right: 10 }]} // Adjust position
        >
          <Ionicons name="logo-whatsapp" size={26} color="#25D366" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Details</Text>
        <Text style={styles.value}>{item.title}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>SAP Code</Text>
        <Text style={styles.value}>{item.code}</Text>
      </View>
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
  imageContainer: {
    flex: 1,
    width: "100%",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: "100%",
    height: 250,
    borderRadius: 8,
    backgroundColor: "#f4f4f4",
  },

  iconOverlay: {
    position: "absolute",
    padding: 6,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
  },
});
