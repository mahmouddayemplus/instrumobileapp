import { StyleSheet, Text, View, Alert, ActivityIndicator } from 'react-native';
import PackerScreen from './screens/PackerScreen'
import AuthScreen from './screens/AuthScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PreventiveMaintenanceScreen from './screens/PreventiveMaintenanceScreen'
import { Provider } from 'react-redux';
import store from './store/store';
import { useSelector } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { logout, saveUser } from './store/authSlice';
import { setFavorites } from './store/favoritesSlice';
import { getUser, removeUser } from "./helper/authStorage";
import { useState, useEffect } from 'react';
import { setAuthenticated } from './store/authSlice'
import PT100Calculator from './screens/PT100Calculator';
import WeighFeeder from './screens/WeighFeeder';
import Thermocouple from './screens/Thermocouple';
import PressureConverter from './screens/PressureConverter';
import TaskDetailScreen from './screens/TaskDetailScreen';
import SparesScreen from './screens/SparesScreen';
import Home from './screens/Home';
import ToolsScreen from './screens/ToolsScreen';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
import SpareDetailScreen from './screens/SparesDetailScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Overtime from './screens/Overtime';
import OvertimeDetails from './screens/OvertimeDetails'
import PlcModification from './screens/PlcModification'
import PackersHistory from './screens/PackersHistory'
import GasAnalyzerCalibration from './screens/GasAnalyzerCalibration'



function HomeTabs() {
  const dispatch = useDispatch();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerRight: () => (
          <View style={{ marginRight: 10 }}>
            <MaterialCommunityIcons
              name="logout"
              size={24}
              color="#2e7d32"
              onPress={() => {
                Alert.alert(
                  "Confirm Logout",
                  "Are you sure you want to log out?",
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "Logout",
                      style: "destructive",
                      onPress: async () => {
                        dispatch(logout());
                        await removeUser();
                      },
                    },
                  ],
                  { cancelable: true }
                );
              }}
            />
          </View>
        ),

      }}
    >

      <Tab.Screen
        name="ToolsScreen"
        component={ToolsScreen}
        options={{
          title: 'Tools',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name="tools"
              size={focused ? size + 4 : size}
              color={focused ? '#43ad49ff' : color} // Green when focused
            />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
          },
          tabBarActiveTintColor: '#2e7d32', // Dark green
          tabBarInactiveTintColor: '#999',
        }}


      />

      <Tab.Screen
        name="PMTasks"
        component={PreventiveMaintenanceScreen}
        options={{
          title: 'PM Tasks',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name="calendar-check"
              size={focused ? size + 4 : size}
              color={focused ? '#43ad49ff' : color} // green focus
            />
          ),


          tabBarActiveTintColor: '#2e7d32',
          tabBarInactiveTintColor: '#999',
        }}
      />
      <Tab.Screen
        name="SparesScreen"
        component={SparesScreen}
        options={{
          title: "Warehouse",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name="warehouse"
              size={focused ? size + 4 : size}
              color={focused ? '#43ad49ff' : color} // Green when focused
            />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
          },
          tabBarActiveTintColor: '#2e7d32', // Dark green
          tabBarInactiveTintColor: '#999',
        }}

      />


    </Tab.Navigator>
  );
}
function RootStack() {
  const [isTryingLogin, setIsTryingLogin] = useState(true);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkLogin = async () => {
      const user = await getUser();

      if (user) {
        dispatch(setAuthenticated(true)); // ✅ Dispatch to Redux once
        dispatch(saveUser(user))

      }
      setIsTryingLogin(false);
    };
    const loadFavorites = async () => {

      const json = await AsyncStorage.getItem('favorite_spares')
      if (json) {
        const favorites = JSON.parse(json);
        dispatch(setFavorites(favorites));

      }

    }

    loadFavorites();
    checkLogin();
  }, [dispatch]);

  if (isTryingLogin) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18 }}>Loading... </Text>
    </View>
  }

  return (

    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        animation: 'slide_from_right', // Optional: Add slide animation
      }}
    >
      {
        isAuthenticated ? (
          <>

            <Stack.Screen
              name="HomeTabs"
              component={HomeTabs}
              options={{
                headerShown: false
              }}

            />
            <Stack.Screen
              name="PT100Calculator"
              component={PT100Calculator}
              options={({ navigation }) => ({
                title: "PT100 Calculator",
                headerRight: () => (
                  <MaterialCommunityIcons
                    name="home"
                    size={24}
                    color="#43ad49"
                    style={{ marginRight: 16 }}
                    onPress={() => navigation.navigate("HomeTabs")}
                  />
                ),
              })}

            />
            <Stack.Screen
              name="Thermocouple"
              component={Thermocouple}
              options={({ navigation }) => ({
                title: "Thermocouple K-type ",

                headerRight: () => (
                  <MaterialCommunityIcons
                    name="home"
                    size={24}
                    color="#43ad49"
                    style={{ marginRight: 16 }}
                    onPress={() => navigation.navigate("HomeTabs")}
                  />
                ),
              })}

            />
            <Stack.Screen
              name="WeighFeeder"
              component={WeighFeeder}
              options={({ navigation }) => ({
                title: "Weigh Feeder Calibration",

                headerRight: () => (
                  <MaterialCommunityIcons
                    name="home"
                    size={24}
                    color="#43ad49"
                    style={{ marginRight: 16 }}
                    onPress={() => navigation.navigate("HomeTabs")}
                  />
                ),
              })}

            />
            <Stack.Screen
              name="PressureConverter"
              component={PressureConverter}
              options={({ navigation }) => ({
                title: "Pressure Converter",

                headerRight: () => (
                  <MaterialCommunityIcons
                    name="home"
                    size={24}
                    color="#43ad49"
                    style={{ marginRight: 16 }}
                    onPress={() => navigation.navigate("HomeTabs")}
                  />
                ),
              })}

            />
            <Stack.Screen
              name="TaskDetailScreen"
              component={TaskDetailScreen}
              options={({ navigation }) => ({
                title: " TaskDetailScreen",

                headerRight: () => (
                  <MaterialCommunityIcons
                    name="home"
                    size={24}
                    color="#43ad49"
                    style={{ marginRight: 16 }}
                    onPress={() => navigation.navigate("HomeTabs")}
                  />
                ),
              })}

            />
            <Stack.Screen
              name="SpareDetailScreen"
              component={SpareDetailScreen}
              options={({ navigation }) => ({
                title: " SpareDetailScreen",

                headerRight: () => (
                  <MaterialCommunityIcons
                    name="home"
                    size={24}
                    color="#43ad49"
                    style={{ marginRight: 16 }}
                    onPress={() => navigation.navigate("HomeTabs")}
                  />
                ),
              })}

            />
            <Stack.Screen
              name="PackerScreen"
              component={PackerScreen}
              options={({ navigation }) => ({
                title: "Packer Calibrator",

                headerRight: () => (
                  <MaterialCommunityIcons
                    name="home"
                    size={24}
                    color="#43ad49"
                    style={{ marginRight: 16 }}
                    onPress={() => navigation.navigate("HomeTabs")}
                  />
                ),
              })}

            />
            <Stack.Screen
              name="PackersHistory"
              component={PackersHistory}
              options={({ navigation }) => ({
                title: "Packer History",

                headerRight: () => (
                  <MaterialCommunityIcons
                    name="home"
                    size={24}
                    color="#43ad49"
                    style={{ marginRight: 16 }}
                    onPress={() => navigation.navigate("HomeTabs")}
                  />
                ),
              })}

            />
            <Stack.Screen
              name="GasAnalyzerCalibration"
              component={GasAnalyzerCalibration}
              options={({ navigation }) => ({
                title: "Gas Analyzers Calibration",

                headerRight: () => (
                  <MaterialCommunityIcons
                    name="home"
                    size={24}
                    color="#43ad49"
                    style={{ marginRight: 16 }}
                    onPress={() => navigation.navigate("HomeTabs")}
                  />
                ),
              })}

            />
            <Stack.Screen
              name="Overtime"
              component={Overtime}
              options={({ navigation }) => ({
                title: "Overtime ",

                headerRight: () => (
                  <MaterialCommunityIcons
                    name="home"
                    size={24}
                    color="#43ad49"
                    style={{ marginRight: 16 }}
                    onPress={() => navigation.navigate("HomeTabs")}
                  />
                ),
              })}

            />
            <Stack.Screen
              name="OvertimeDetails"
              component={OvertimeDetails}
              options={({ navigation }) => ({
                title: "Overtime Details ",

                headerRight: () => (
                  <MaterialCommunityIcons
                    name="home"
                    size={24}
                    color="#43ad49"
                    style={{ marginRight: 16 }}
                    onPress={() => navigation.navigate("HomeTabs")}
                  />
                ),
              })}

            />
            <Stack.Screen
              name="PlcModification"
              component={PlcModification}
              options={({ navigation }) => ({
                title: "PLC Change Request ",

                headerRight: () => (
                  <MaterialCommunityIcons
                    name="home"
                    size={24}
                    color="#43ad49"
                    style={{ marginRight: 16 }}
                    onPress={() => navigation.navigate("HomeTabs")}
                  />
                ),
              })}

            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        )
      }
    </Stack.Navigator>
  );
}
export default function App() {

  return (

    <SafeAreaProvider >
      <Provider store={store}>
        <NavigationContainer>
          <RootStack />
        </NavigationContainer>
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
