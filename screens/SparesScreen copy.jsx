// import { StyleSheet, Text, View, ScrollView } from "react-native";
// import React, { useState, useEffect, useLayoutEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { Linking } from "react-native";
// import { toggleFavorite } from "../store/favoritesSlice";
// import SparesComponent from "../components/SparesComponent";
// import { loadSpares, updateSpares } from "../firebase/firebaseConfig";
// import { useNavigation } from "@react-navigation/native";
// import { Ionicons } from "@expo/vector-icons";
// import { TouchableOpacity, StatusBar, SafeAreaView } from "react-native";
// import { FlatList, TextInput, ActivityIndicator } from "react-native";
// import { colors } from "../constants/color";
// import { Image } from "expo-image";
// import { FlashList } from "@shopify/flash-list";
// import * as FileSystem from "expo-file-system";
// import { Asset } from "expo-asset";
// import sparesData from "../assets/spares.json";

// const SparesScreen = () => {
//   const [spares, setSpares] = useState(null);
//   const [dataError, setDataError] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   const dispatch = useDispatch();
//   const favorites = useSelector((state) => state.favorites.items);
//   const user = useSelector((state) => state.auth.user);
//   const defaultImage = require("../assets/no-image.webp");
//   const [selectedCategory, setSelectedCategory] = useState("all");
//   const [loading, setLoading] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filteredSpares, setFilteredSpares] = useState([]);
//   const [query, setQuery] = useState("");
//   const [spareSearch, setSpareSearch] = useState([]);
//   const [allSpares, setAllSpares] = useState([]);
//   const navigation = useNavigation();
//   const CSV_NAME = "spares.";

 
//   function loadSparesJSON() {
//     console.log('=============ffffffffff===================');
    
//     console.log('====================================');
//     setAllSpares(sparesData);
//     setSpareSearch(sparesData);
//   }
//   useEffect(() => {
//     loadSparesJSON();
//   }, []);
//   ////

//   useEffect(() => {
//     const fetchSpares = async () => {
//       try {
//         let cached = await loadSpares("cached_spares");

//         if (!cached || cached.length === 0) {
//           try {
//             await updateSpares();
//             cached = await loadSpares("cached_spares");
//           } catch (error) {
//             console.error("Error fetching from Firestore:", error);
//             setDataError(true);
//             setErrorMessage(
//               "Spares database is not available. Please contact your administrator."
//             );
//             return;
//           }
//         }

//         if (cached && cached.length > 0) {
//           setSpares(cached);
//           setFilteredSpares(cached);
//         } else {
//           setDataError(true);
//           setErrorMessage(
//             "No spare parts data available. Please try again later."
//           );
//         }
//       } catch (error) {
//         console.error("Error in fetchSpares:", error);
//         setDataError(true);
//         setErrorMessage(
//           "Failed to load spare parts. Please check your connection and try again."
//         );
//       }
//     };

//     fetchSpares();
//   }, []);

//   // Test warehouse database on component load

//   // Detect when spares is set to empty array and trigger error state
//   useEffect(() => {
//     if (spares && spares.length === 0 && !dataError) {
//       setDataError(true);
//       setErrorMessage("No spare parts data available. Please try again later.");
//     }
//   }, [spares, dataError]);

//   const handlePress = async () => {
//     setLoading(true);
//     setDataError(false);
//     setErrorMessage("");

//     try {
//       await updateSpares();
//       const cached = await loadSpares("cached_spares");
//       setLoading(false);

//       if (cached && cached.length > 0) {
//         setSpares(cached);
//         setFilteredSpares(cached);
//       } else {
//         setDataError(true);
//         setErrorMessage(
//           "No spare parts data available. Please try again later."
//         );
//       }
//     } catch (error) {
//       console.error("Error refreshing spares:", error);
//       setLoading(false);
//       setDataError(true);
//       setErrorMessage(
//         "Failed to refresh spare parts. Please check your connection and try again."
//       );
//     }
//   };

//   useLayoutEffect(() => {
//     navigation.setOptions({
//       title: "Spare Parts",
//       headerStyle: {
//         backgroundColor: colors.primary,
//       },
//       headerTintColor: "#fff",
//       headerTitleStyle: {
//         fontSize: 18,
//         fontWeight: "600",
//       },
//       headerRight: () => (
//         <View style={styles.headerRight}>
//           <Ionicons name="person-circle" size={20} color={"#fff"} />

//           <Text style={styles.userName}>{user.displayName}</Text>
//           <TouchableOpacity onPress={handlePress} style={styles.refreshButton}>
//             {loading ? (
//               <ActivityIndicator size={20} color="#fff" />
//             ) : (
//               <Ionicons name="refresh" size={24} color="#fff" />
//             )}
//           </TouchableOpacity>
//         </View>
//       ),
//     });
//   }, [navigation, spares, loading]);

//   // Show error state when data is not available
//   if (dataError) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <StatusBar
//           barStyle="light-content"
//           backgroundColor={colors.primary || "#34C759"}
//         />

//         <View style={styles.errorContainer}>
//           <View style={styles.errorIconContainer}>
//             <Ionicons name="alert-circle-outline" size={80} color="#FF6B35" />
//           </View>
//           <Text style={styles.errorTitle}>No Data Available</Text>
//           <Text style={styles.errorMessage}>{errorMessage}</Text>
//           <TouchableOpacity
//             style={styles.retryButton}
//             onPress={handlePress}
//             disabled={loading}
//           >
//             <Ionicons name="refresh" size={20} color="#fff" />
//             <Text style={styles.retryButtonText}>
//               {loading ? "Retrying..." : "Try Again"}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // Show loading state only if not in error state and still loading
//   if (!spares || spares.length === 0) {
//     // Don't show loading if we have an error
//     if (dataError) {
//       return null; // This should not happen due to the order, but just in case
//     }
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
//         <View style={styles.loadingContent}>
//           <ActivityIndicator size="large" color={colors.primary} />
//           <Text style={styles.loadingText}>Loading spare parts...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const handleSearch = async (text) => {
//     setSearchQuery(text);

//     if (selectedCategory === "warehouse") {
//       // Search in warehouse database
    
//         if (text !== "") {
//           console.log('===============search must started=====================');
           
//           console.log(searchQuery);
//           const filtered = allSpares.filter((item) => {
//             const matchesSearch =
//               item.old.toLowerCase().includes(text.toLowerCase()) ||
//               item.new.toLowerCase().includes(text.toLowerCase()) ||
//               item.description.toLowerCase().includes(text.toLowerCase());
//              return matchesSearch    ;
//           });
//           const convertedResults = filtered.map((item) => ({
//             id: item.id || item.old,
//             code: item.old || "",
//             title: item.description || "",
//             category: "",
//             new_code: item.new || "",
//             old_code: item.old || "",
//             description: item.description || "",
//           }));

//           setFilteredSpares(convertedResults);
//         }else{
//           setFilteredSpares( []);
//         }

//         // // Convert warehouse results to match spares format
      
//     } else {
//       // Search in regular spares
//       const filtered = spares.filter((item) => {
//         const matchesSearch =
//           item.title.toLowerCase().includes(text.toLowerCase()) ||
//           item.code.toLowerCase().includes(text.toLowerCase());
//         const matchesCategory =
//           selectedCategory === "all" || item.category === selectedCategory;
//         return matchesSearch && matchesCategory;
//       });
//       setFilteredSpares(filtered);
//     }
//   };

//   const handleCategoryChange = async (category) => {
//     setSelectedCategory(category);
//     console.log("Category changed to:", category);

//     if (category === "warehouse") {
//       // Load warehouse data
//       try {
//         if (searchQuery !== "") {
//           console.log('====================================');
//           console.log(searchQuery);
//           console.log('====================================');
//           const filteredItems = allSpares.filter((item) => {
//             const matchesSearch =
//               item.old.toLowerCase().includes(searchQuery.toLowerCase()) ||
//               item.new.toLowerCase().includes(searchQuery.toLowerCase()) ||
//               item.description.toLowerCase().includes(searchQuery.toLowerCase());
//              return matchesSearch    ;
//           });
//           console.log('============filtererd==============');
//           console.log(filteredItems);
//           console.log('====================================');
//           const convertedResults = filteredItems.map((item) => ({
//             id: item.id || item.old,
//             code: item.old || "",
//             title: item.description || "",
//             category: "",
//             new_code: item.new || "",
//             old_code: item.old || "",
//             description: item.description || "",
//           }));

//           setFilteredSpares(convertedResults);
//         }else{
//           setFilteredSpares([]);
//         }

//         // // Convert warehouse results to match spares format
//       } catch (error) {
//         console.error("Warehouse search error:", error);
//         setFilteredSpares([]);
//       }
 
//     } else {
//       // Handle other categories
//       const filtered = spares.filter((item) => {
//         const matchesSearch =
//           item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           item.code.toLowerCase().includes(searchQuery.toLowerCase());
//         const matchesCategory =
//           category === "all"
//             ? true
//             : category === "favorites"
//             ? favorites.includes(item.code)
//             : item.category === category;
//         return matchesSearch && matchesCategory;
//       });
//       setFilteredSpares(filtered);
//     }
//   };

//   const handleShareToWhatsApp = (item) => {
//     const message = `Check out this spare part:\n\nCode: ${item.code}\nTitle: ${item.title}\n`;
//     const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
//     Linking.openURL(url)
//       .then(() => {})
//       .catch(() => {
//         0;
//         alert("WhatsApp not installed on your device");
//       });
//   };

//   const categories = [
//     { key: "all", label: "All", icon: "grid-outline" },
//     { key: "general", label: "Inst", icon: "construct-outline" },
//     { key: "plc", label: "PLC", icon: "hardware-chip-outline" },
//     { key: "packing", label: "Packing", icon: "cube-outline" },
//     { key: "favorites", label: "Favorites", icon: "heart-outline" },
//     { key: "warehouse", label: "warehouse", icon: "grid-outline" },
//   ];

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar
//         barStyle="light-content"
//         backgroundColor={colors.primary || "#34C759"}
//       />

//       {/* Search Section */}
//       <View style={styles.searchSection}>
//         <View style={styles.searchContainer}>
//           <Ionicons
//             name="search"
//             size={20}
//             color={colors.textSecondary}
//             style={styles.searchIcon}
//           />
//           <TextInput
//             placeholder="Search by title or SAP code"
//             value={searchQuery}
//             onChangeText={handleSearch}
//             style={styles.searchInput}
//             placeholderTextColor={colors.textSecondary}
//           />
//           {searchQuery.length > 0 && (
//             <TouchableOpacity
//               onPress={() => handleSearch("")}
//               style={styles.clearButton}
//             >
//               <Ionicons
//                 name="close-circle"
//                 size={20}
//                 color={colors.textSecondary}
//               />
//             </TouchableOpacity>
//           )}
//         </View>

//         {searchQuery && (
//           <Text style={styles.resultCount}>
//             Found {filteredSpares.length} item
//             {filteredSpares.length !== 1 ? "s" : ""}
//           </Text>
//         )}
//       </View>

//       {/* Category Filters */}
//       <View style={styles.categorySection}>
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.categoryScroll}
//         >
//           {categories.map((category) => (
//             <TouchableOpacity
//               key={category.key}
//               style={[
//                 styles.categoryButton,
//                 selectedCategory === category.key &&
//                   styles.categoryButtonActive,
//               ]}
//               onPress={() => handleCategoryChange(category.key)}
//             >
//               <Ionicons
//                 name={category.icon}
//                 size={16}
//                 color={
//                   selectedCategory === category.key
//                     ? "#fff"
//                     : colors.textSecondary
//                 }
//               />
//               <Text
//                 style={[
//                   styles.categoryButtonText,
//                   selectedCategory === category.key &&
//                     styles.categoryButtonTextActive,
//                 ]}
//               >
//                 {category.label}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>

//       {/* Spares List */}
//       <View style={styles.listContainer}>
//         <FlashList
//           data={filteredSpares}
//           estimatedItemSize={120}
//           keyExtractor={(item) => item.code}
//           renderItem={({ item }) => <SparesComponent item={item} />}
//           numColumns={1}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.listContent}
//         />
//       </View>
//     </SafeAreaView>
//   );
// };

// export default SparesScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   loadingContent: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     fontSize: 16,
//     color: colors.textSecondary,
//     marginTop: 12,
//   },
//   headerRight: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   userName: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "500",
//   },
//   refreshButton: {
//     padding: 4,
//   },
//   searchSection: {
//     paddingHorizontal: 20,
//     paddingTop: 16,
//     paddingBottom: 12,
//   },
//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: colors.card,
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,
//     height: 48,
//     fontSize: 16,
//     color: colors.text,
//   },
//   clearButton: {
//     padding: 4,
//   },
//   resultCount: {
//     fontSize: 14,
//     color: colors.textSecondary,
//     marginTop: 8,
//     fontWeight: "500",
//   },
//   categorySection: {
//     paddingHorizontal: 20,
//     paddingBottom: 16,
//   },
//   categoryScroll: {
//     paddingRight: 20,
//   },
//   categoryButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     backgroundColor: colors.card,
//     borderRadius: 20,
//     marginRight: 8,
//     gap: 6,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   categoryButtonActive: {
//     backgroundColor: colors.primary,
//   },
//   categoryButtonText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: colors.textSecondary,
//   },
//   categoryButtonTextActive: {
//     color: "#fff",
//   },
//   listContainer: {
//     flex: 1,
//     paddingHorizontal: 20,
//   },
//   listContent: {
//     paddingBottom: 20,
//   },
//   item: {
//     flexDirection: "row",
//     backgroundColor: colors.card,
//     borderRadius: 16,
//     marginBottom: 12,
//     padding: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   imageContainer: {
//     width: 80,
//     height: 80,
//     borderRadius: 12,
//     overflow: "hidden",
//     backgroundColor: colors.background,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   itemImage: {
//     width: "100%",
//     height: "100%",
//     borderRadius: 12,
//   },
//   imageLoader: {
//     position: "absolute",
//     zIndex: 1,
//   },
//   contentContainer: {
//     flex: 1,
//     marginLeft: 16,
//     justifyContent: "space-between",
//   },
//   textContainer: {
//     flex: 1,
//   },
//   code: {
//     fontSize: 12,
//     fontWeight: "700",
//     color: colors.text,
//     marginBottom: 4,
//   },
//   title: {
//     fontSize: 14,
//     color: colors.textSecondary,
//     lineHeight: 20,
//     marginBottom: 0,
//   },
//   categoryContainer: {
//     flexDirection: "row",
//     alignItems: "baseline",
//     justifyContent: "space-between",
//   },
//   categoryBadge: {
//     backgroundColor: colors.primaryLight,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 8,
//   },
//   categoryText: {
//     fontSize: 8,
//     fontWeight: "600",
//     color: colors.primaryDark,
//   },
//   actionButtons: {
//     flexDirection: "row",
//     gap: 8,
//     marginTop: 4,
//   },
//   actionButton: {
//     width: 20,
//     height: 20,
//     borderRadius: 18,
//     backgroundColor: colors.background,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   favoriteActive: {
//     backgroundColor: colors.primary,
//     borderColor: colors.primaryDark,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//     backgroundColor: colors.background,
//   },
//   errorIconContainer: {
//     backgroundColor: "#FFE0D1",
//     borderRadius: 50,
//     padding: 15,
//     marginBottom: 20,
//   },
//   errorTitle: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: colors.text,
//     marginBottom: 10,
//     textAlign: "center",
//   },
//   errorMessage: {
//     fontSize: 16,
//     color: colors.textSecondary,
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   retryButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: colors.primary,
//     paddingVertical: 12,
//     paddingHorizontal: 25,
//     borderRadius: 10,
//     gap: 8,
//   },
//   retryButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });
