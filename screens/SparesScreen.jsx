import { StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect, useLayoutEffect, memo } from "react";
import { loadSpares, updateSpares } from "../firebase/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // or use Feather, MaterialIcons, etc.
import { TouchableOpacity } from "react-native";
import { FlatList, TextInput, Image, ActivityIndicator } from "react-native";
import SpareDetailScreen from "./SparesDetailScreen";
import { colors } from "../constants/color";

const SparesScreen = () => {
  const [spares, setSpares] = useState(null);
  const defaultImage = require("../assets/no-image.webp");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSpares, setFilteredSpares] = useState([]);
  const navigation = useNavigation();

  // const imageUrl = `https://res.cloudinary.com/dsnl3mogn/image/upload/${item.code}.webp`;

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
          <Ionicons name="refresh" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, spares]);
  ///////////////////////////////////////////////////////////////////////////////////////////////////////

  if (!spares || spares.length === 0 ||loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 18 }}>Loading...  </Text>
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
            source={imageError ? defaultImage : { uri: imageUrl }}
            style={styles.itemImage}
            resizeMode="cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.code}>{item.code}</Text>
          <Text style={styles.title}>{item.title}</Text>
        </View>
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

      const matchesCategory = category === "all" || item.category === category;

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
      <View
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
      </View>
      <FlatList
        data={filteredSpares}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => <RenderItem item={item} />}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </View>
  );
};

export default SparesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  // item: {
  //   marginBottom: 12,
  //   padding: 12,
  //   borderRadius: 8,
  //   backgroundColor: "#f1f1f1",
  // },
  code: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  title: {
    fontSize: 14,
    color: "#666",
  },
  searchInput: {
    height: 40,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  resultCount: {
    marginBottom: 8,
    fontSize: 14,
    color: "#555",
    textAlign: "left",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f1f1f1",
  },

  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
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
});
