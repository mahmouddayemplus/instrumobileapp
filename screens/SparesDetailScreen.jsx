import React, { useLayoutEffect, useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
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
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { colors } from "../constants/color";

const defaultImage = require("../assets/no-image.webp");
import { toggleFavorite } from "../store/favoritesSlice";

const SpareDetailScreen = ({ route }) => {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.items);
  const { item } = route.params;
  const navigation = useNavigation();

  const imageUrl = `https://res.cloudinary.com/dsnl3mogn/image/upload/${item.code}.webp`;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: item.code,
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "600",
      },
    });
  }, [navigation, item]);

  const isFavorite = favorites.includes(item.code);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            defaultSource={defaultImage}
            onError={() => {}}
            style={styles.image}
            resizeMode="contain"
          />

          {/* Gradient overlay for better icon visibility */}
          <View style={styles.imageOverlay} />

          {/* Action Icons */}
          <View style={styles.actionIcons}>
            <TouchableOpacity
              onPress={() => dispatch(toggleFavorite(item.code))}
              style={[styles.iconButton, isFavorite && styles.favoriteActive]}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite ? "#fff" : colors.text}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleShareToWhatsApp(item)}
              style={styles.iconButton}
            >
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Title Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.cardTitle}>Product Information</Text>
            </View>
            <Text style={styles.productTitle}>{item.title}</Text>
          </View>

          {/* SAP Code Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="barcode-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.cardTitle}>SAP Code</Text>
            </View>
            <View style={styles.codeContainer}>
              <Text style={styles.codeText}>{item.code} | {item.new_code} </Text>
          
              <TouchableOpacity style={styles.copyButton}>
                <Ionicons
                  name="copy-outline"
                  size={16}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Additional Details Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="list-outline" size={20} color={colors.primary} />
              <Text style={styles.cardTitle}>Additional Details</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{item.category}</Text>
            </View>

            {/* <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Availability</Text>
              <View style={styles.availabilityContainer}>
                <View style={styles.availabilityDot} />
                <Text style={styles.availabilityText}>In Stock</Text>
              </View>
            </View> */}

            {/* <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Last Updated</Text>
              <Text style={styles.detailValue}>Today</Text>
            </View> */}
          </View>

          {/* Action Buttons */}
          {/* <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton}>
              <Ionicons name="call-outline" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Contact Supplier</Text>
            </TouchableOpacity> */}

          {/* <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>View Specifications</Text>
            </TouchableOpacity> */}
          {/* </View> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SpareDetailScreen;

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 300,
    backgroundColor: colors.card,
    overflow: "visible",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.background,
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "rgba(0,0,0,0.1)",
    zIndex: 1,
  },
  actionIcons: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "row",
    gap: 12,
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 11,
  },
  favoriteActive: {
    backgroundColor: colors.error,
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 28,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  codeText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    fontFamily: "monospace",
  },
  copyButton: {
    padding: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "600",
    textTransform: "uppercase", // 👈 this makes text uppercase
  },
  availabilityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  availabilityText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: "600",
  },
  actionButtons: {
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});
