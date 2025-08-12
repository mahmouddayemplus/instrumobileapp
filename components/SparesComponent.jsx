import { StyleSheet, Text, View, ScrollView } from "react-native";
import React, { useState, useEffect, useLayoutEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Linking } from "react-native";
import { toggleFavorite } from "../store/favoritesSlice";
import { loadSpares, updateSpares } from "../firebase/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, StatusBar, SafeAreaView } from "react-native";
import { FlatList, TextInput, ActivityIndicator } from "react-native";
import { colors } from "../constants/color";
import { Image } from "expo-image";
import { FlashList } from "@shopify/flash-list";

const SparesComponent = ({ item }) => {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.items);
  const isFavorite = favorites.includes(item.code);
  const navigation = useNavigation();
  const defaultImage = require("../assets/no-image.webp");

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imageUrl = `https://res.cloudinary.com/dsnl3mogn/image/upload/${item.code}.webp`;
  const handleShareToWhatsApp = (item) => {
    const message = `Check out this spare part:\n\nCode: ${item.code}\nTitle: ${item.title}\n`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.openURL(url)
      .then(() => {})
      .catch(() => {
        alert("WhatsApp not installed on your device");
      });
  };
  const handleFavoriteButton = () => {
    dispatch(toggleFavorite(item.code));
    const handleShareToWhatsApp = (item) => {
      const message = `Check out this spare part:\n\nCode: ${item.code}\nTitle: ${item.title}\n`;
      const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
      Linking.openURL(url)
        .then(() => {})
        .catch(() => {
          alert("WhatsApp not installed on your device");
        });
    };
  };

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate("SpareDetailScreen", { item })}
    >
      <View style={styles.imageContainer}>
        {!imageLoaded && !imageError && (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={styles.imageLoader}
          />
        )}
        <Image
          source={imageError ? defaultImage : imageUrl}
          style={styles.itemImage}
          contentFit="contain"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          transition={300}
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.code}>
            {item.code} | {item.new_code}
          </Text>
          <Text style={styles.title} numberOfLines={3}>
            {item.title}
          </Text>
          <View style={styles.categoryContainer}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {item.category?.toUpperCase() || "GENERAL"}
              </Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => handleShareToWhatsApp(item)}
                style={styles.actionButton}
              >
                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleFavoriteButton}
                style={[
                  styles.actionButton,
                  isFavorite && styles.favoriteActive,
                ]}
              >
                <Ionicons
                  name={isFavorite ? "pin" : "pin-outline"}
                  size={20}
                  color={isFavorite ? "#fff" : colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SparesComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  refreshButton: {
    padding: 4,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: colors.text,
  },
  clearButton: {
    padding: 4,
  },
  resultCount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    fontWeight: "500",
  },
  categorySection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  categoryScroll: {
    paddingRight: 20,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  itemImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  imageLoader: {
    position: "absolute",
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
  },
  code: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 0,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  categoryBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 8,
    fontWeight: "600",
    color: colors.primaryDark,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    width: 20,
    height: 20,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  errorIconContainer: {
    backgroundColor: "#FFE0D1",
    borderRadius: 50,
    padding: 15,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 10,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    gap: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
