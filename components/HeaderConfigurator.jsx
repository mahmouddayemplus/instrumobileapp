// HeaderConfigurator.js
import { useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { View, TouchableOpacity,StyleSheet } from "react-native";
import { colors } from "../constants/color"; // adjust path
 
const HeaderConfigurator = ({title,iconName}) => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: title,
      headerStyle: {
        backgroundColor: colors.primary || "#34C759",
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontSize: 18,
        fontWeight: "600",
      },
      headerLeft: () => (
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.headerIconContainer}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerIconContainer}>
            <Ionicons name={iconName} size={24} color="#fff" />
          </View>
        </View>
      ),
    });
  }, [navigation]);

  return null; // This component only configures the header
};

export default HeaderConfigurator;

const styles = StyleSheet.create({
   headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  headerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

})