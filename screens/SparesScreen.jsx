import { StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect, useLayoutEffect } from "react";
import { loadSpares, updateSpares } from "../firebase/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // or use Feather, MaterialIcons, etc.
import { TouchableOpacity } from "react-native";
import { FlatList, TextInput } from "react-native";

const SparesScreen = () => {
  const [spares, setSpares] = useState(null);
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
        console.log("spares loaded:");
      } else {
        console.log("Failed to fetch or load cached spares.");
      }
    };

    fetchSpares();
  }, []);

  //////////////////////////////////////////////////////////////
  const handlePress = async () => {
    await updateSpares();
    const cached = await loadSpares("cached_spares");

    if (cached) {
      setSpares(cached);
      setFilteredSpares(cached);

      console.log("Updated spares loaded:Mazen mazen 77777777777777");
    } else {
      console.log("No cached data found after update");
    }
  };

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

  if (!spares || spares.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 18 }}>Loading...No Spares Found </Text>
      </View>
    );
  }
  /////////////////// handleSearch  ////////////
  const handleSearch = (text) => {
    setSearchQuery(text);

    const filtered = spares.filter(
      (item) =>
        item.title.toLowerCase().includes(text.toLowerCase()) ||
        item.code.toLowerCase().includes(text.toLowerCase())
    );

    setFilteredSpares(filtered);
  };
  ///////////////////////////////////////////////////////////////

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

      <FlatList
        data={filteredSpares}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.code}>{item.code}</Text>
            <Text style={styles.title}>{item.title}</Text>
          </View>
        )}
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
  item: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f1f1f1",
  },
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
    borderColor: "#ccc",
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
});
