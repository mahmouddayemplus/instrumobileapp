import { StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect, useLayoutEffect, memo } from "react";
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

  const [favorites, setFavorites] = useState([]);

  const defaultImage = require("../assets/no-image.webp");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSpares, setFilteredSpares] = useState([]);
  const navigation = useNavigation();

  // const imageUrl = `https://res.cloudinary.com/dsnl3mogn/image/upload/${item.code}.webp`;
  //////////////// fetch favorites spares
  useEffect(() => {
    const fetchfavorites = async () => {
      let cached_favorites = await loadFavorites("favorite_spares");

      if (!cached_favorites) {
        console.log("No favorites cached data found ...");
      }

      if (cached_favorites) {
        setFavorites(cached_favorites);
        // initialize filtered list
        console.log("favorites found loaded:" + favorites);
      } else {
        console.log("Failed to fetch or load cached spares.");
      }
    };

    fetchfavorites();
  }, []);
  //////////////////////////////////

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
        console.log("spares loaded:");
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

      console.log("Updated spares loaded: ");
    } else {
      console.log("No cached data found after update");
    }
  };
  ///////////////////////////////////////////////////////////////////
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Spare Parts",
      headerRight: () => (
        <TouchableOpacity onPress={handlePress} style={{ marginRight: 15 }}>
          {loading ? (
            <ActivityIndicator size={20} color="black" />
          ) : (
            <Ionicons name="refresh" size={24} color="black" />
          )}
        </TouchableOpacity>
      ),
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
  /////////////////// handleSearch  ////////////
  // const handleSearch = (text) => {
  //   setSearchQuery(text);

  //   const filtered = spares.filter(
  //     (item) =>
  //       item.title.toLowerCase().includes(text.toLowerCase()) ||
  //       item.code.toLowerCase().includes(text.toLowerCase())
  //   );

  //   setFilteredSpares(filtered);
  // };
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
        onPress={() => navigation.navigate("SpareDetailScreen", { item })} // Replace with navigation or action
      >
        <View>
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
            contentFit="cover" // equivalent to resizeMode
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
            transition={300} // optional fade-in
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.code}>{item.code}</Text>
          <Text style={styles.title}>{item.title}</Text>
        </View>
        {/* Favorite Icon */}
        <TouchableOpacity
          onPress={() => toggleFavorite(item.code)}
          style={styles.favoriteIcon}
        >
          <Ionicons
            name={favorites.includes(item.code) ? "heart" : "pin-outline"}
            size={22}
            color={favorites.includes(item.code) ? "red" : "#888"}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  });
  ////////////////////////
  const toggleFavorite = async (code) => {
    const updatedFavorites = favorites.includes(code)
      ? favorites.filter((c) => c !== code)
      : [...favorites, code];
    // await storeFavorites("favorite_spares", [...favorites, code]);
    setFavorites(updatedFavorites); // update state first
    await storeFavorites("favorite_spares", updatedFavorites); // save updated list

    console.log("Updated Favorites:", updatedFavorites);
  };
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
      {/* <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginBottom: 10,
        }}
      >
        {["all", "general", "plc", "packing"].map((category) => (
          <TouchableOpacity
            key={category}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              backgroundColor:
                selectedCategory === category ? colors.primary : "#ccc",
              borderRadius: 8,
            }}
            onPress={() => handleCategoryChange(category)}
          >
            <Text
              style={{ color: selectedCategory === category ? "#fff" : "#000" }}
            >
              {category.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View> */}
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
              paddingHorizontal: 7,
              backgroundColor:
                selectedCategory === category ? colors.primary : "#e0e0e0",
              borderRadius: 20,
            }}
            onPress={() => handleCategoryChange(category)}
          >
            <Text
              style={{
                color: selectedCategory === category ? "#fff" : "#333",
                fontWeight: "500",
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

      {/* <FlatList
        data={filteredSpares}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => <RenderItem item={item} />}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={true}
      /> */}
    </View>
  );
};

export default SparesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
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
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 16,
    backgroundColor: "#e0e0e0",
  },

  imageLoader: {
    position: "absolute",
    top: "40%",
    left: "40%",
    zIndex: 1,
  },

  textContainer: {
    flex: 1,
    justifyContent: "center",
  },

  code: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 4,
  },

  title: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },

  row: {
    justifyContent: "space-between",
  },
  favoriteIcon: {
    marginLeft: 10,
    alignSelf: "flex-start",
  },
});
