import { StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect, useLayoutEffect, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Linking } from "react-native";
import { toggleFavorite } from "../store/favoritesSlice";

import {
  loadSpares,
  updateSpares,
  storeFavorites,
  loadFavorites,
} from "../firebase/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // or use Feather, MaterialIcons, etc.
import { TouchableOpacity } from "react-native";
import { FlatList, TextInput, ActivityIndicator } from "react-native";
import { colors } from "../constants/color";
import { Image } from "expo-image";
import { FlashList } from "@shopify/flash-list";
const SparesScreen = () => {
  const [spares, setSpares] = useState(null);

  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.items);
  console.log('====================================');
  console.log(favorites);
  console.log('====================================');

  const user = useSelector((state) => state.auth.user);
 

  const defaultImage = require("../assets/no-image.webp");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSpares, setFilteredSpares] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchSpares = async () => {
      let cached = await loadSpares("cached_spares");

      if (!cached) {
        console.log("No Spares cached data found, fetching from Firestore...");
        await updateSpares(); // Fetch from Firestore and store in AsyncStorage
        cached = await loadSpares("cached_spares"); // Load again after update
      }

      if (cached) {
        setSpares(cached);
        setFilteredSpares(cached); // initialize filtered list
      } else {
        console.log("Failed to fetch or load cached spares.");
      }
    };

    fetchSpares();
  }, []);

  //////////////////////////////////////////////////////////////
  const handlePress = async () => {
    setLoading(true);

    await updateSpares();
    const cached = await loadSpares("cached_spares");
    setLoading(false);

    if (cached) {
      setSpares(cached);
      setFilteredSpares(cached);
    } else {
      console.log("No cached data found after update");
    }
  };
  ///////////////////////////////////////////////////////////////////
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Spare Parts",
      headerTitleStyle: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#2e7d32", // custom color
      },
      headerRight: () => (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text> {user.displayName} </Text>
          <TouchableOpacity
            onPress={handlePress}
            style={{ marginRight: 15, marginLeft: 15 }}
          >
            {loading ? (
              <ActivityIndicator size={20} color="black" />
            ) : (
              <Ionicons name="refresh" size={24} color="#2e7d32" />
            )}
          </TouchableOpacity>
        </View>
      ),
      headerStyle: {
        height: 60, // reduce height from default ~80 on some devices
        backgroundColor: "#fff", // optional
        shadowColor: "transparent", // remove shadow if needed
        elevation: 0, // for Android
      },
      headerTitleStyle: {
        fontSize: 18, // smaller title text
        fontWeight: "500",
      },
    });
  }, [navigation, spares]);
  ///////////////////////////////////////////////////////////////////////////////////////////////////////

  if (!spares || spares.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 18 }}>Loading... </Text>
      </View>
    );
  }

  const handleSearch = (text) => {
    setSearchQuery(text);

    const filtered = spares.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(text.toLowerCase()) ||
        item.code.toLowerCase().includes(text.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    setFilteredSpares(filtered);
  };
  ///////////////////////////////////////////////////////////////
  const RenderItem = memo(({ item }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const imageUrl = `https://res.cloudinary.com/dsnl3mogn/image/upload/${item.code}.webp`;
    // const defaultImage =
    // "https://via.placeholder.com/80x80.png?text=No+Image";
    const defaultImage = require("../assets/no-image.webp");

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() =>
          navigation.navigate("SpareDetailScreen", {
            item,
          })
        } // Replace with navigation or action
      >
        <View style={styles.imageContainer}>
          {!imageLoaded && !imageError && (
            <ActivityIndicator
              size="small"
              color="#888"
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
        <View style={styles.verticalDivider} />

        <View style={styles.textContainer}>
          <Text style={styles.code}>{item.code}</Text>
          <Text style={styles.title}>{item.title}</Text>
        </View>

        <TouchableOpacity
          onPress={() => handleShareToWhatsApp(item)}
          style={styles.favoriteIcon}
        >
          <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => dispatch(toggleFavorite(item.code))}
          style={styles.favoriteIcon}
        >
          <Ionicons
            name={favorites.includes(item.code) ? "heart" : "heart-outline"}
            size={22}
            color={favorites.includes(item.code) ? "red" : "#888"}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  });

  //////////////////////////////////////////////
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);

    const filtered = spares.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        category === "all"
          ? true
          : category === "favorites"
          ? favorites.includes(item.code)
          : item.category === category;

      return matchesSearch && matchesCategory;
    });

    setFilteredSpares(filtered);
  };
  ////////////
  const handleShareToWhatsApp = (item) => {
    const message = `Check out this spare part:\n\nCode: ${item.code}\nTitle: ${item.title}\n`;

    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;

    Linking.openURL(url)
      .then(() => console.log("WhatsApp opened"))
      .catch(() => {
        alert("WhatsApp not installed on your device");
      });
  };

  ////////////////////////////////////////////////////////////////////

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search by title or SAP code"
        value={searchQuery}
        onChangeText={handleSearch}
        style={styles.searchInput}
      />
      {searchQuery && (
        <Text style={styles.resultCount}>
          Found {filteredSpares.length} item
          {filteredSpares.length !== 1 ? "s" : ""}
        </Text>
      )}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginBottom: 12,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {["all", "general", "plc", "packing", "favorites"].map((category) => (
          <TouchableOpacity
            key={category}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 5,
              backgroundColor:
                selectedCategory === category ? colors.primary : "#e0e0e0",
              borderRadius: 10,
            }}
            onPress={() => handleCategoryChange(category)}
          >
            <Text
              style={{
                color: selectedCategory === category ? "#fff" : "#333",
                fontWeight: "500",
                fontSize: 10,
              }}
            >
              {category.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlashList
        data={filteredSpares}
        estimatedItemSize={160}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => <RenderItem item={item} />}
        numColumns={1}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

export default SparesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6faf5bc",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  searchInput: {
    height: 44,
    borderColor: colors.primary,
    borderWidth: 1.2,
    borderRadius: 12,
    marginBottom: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },

  resultCount: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
    textAlign: "left",
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  itemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },

  imageLoader: {
    position: "absolute",
    zIndex: 1,
  },

  textContainer: {
    flex: 1,
  },

  code: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#444",
  },

  title: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
  },

  row: {
    justifyContent: "space-between",
  },
  favoriteIcon: {
    marginLeft: 10,
    alignSelf: "flex-start",
  },
  verticalDivider: {
    width: 1,
    height: "80%",
    backgroundColor: colors.primary,
    marginHorizontal: 10,
  },
});
