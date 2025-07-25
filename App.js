import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import AuthScreen from './screens/AuthScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PreventiveMaintenanceScreen from './screens/PreventiveMaintenanceScreen'
import { Provider } from 'react-redux';
import store from './store/store';  // adjust path as needed
import { useSelector } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { logout } from './store/authSlice';
import { getUser, removeUser } from "./helper/authStorage";
import { useState, useEffect } from 'react';
import {setAuthenticated} from './store/authSlice'

import Home from './screens/Home';
import Tools from './screens/Utils';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


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
              onPress={async () => {
                // Handle profile icon press
                dispatch(logout());
                await removeUser();

                console.log('Logout pressed');
              }}
            />
          </View>
        ),

      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name="home"
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
        name="Tools"
        component={Tools}
        options={{
          title: 'Tools',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name="toolbox"
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
        console.log('User loaded from AsyncStorage:', user);
      }
      setIsTryingLogin(false);
    };

    checkLogin();
  }, [dispatch]);

  if (isTryingLogin) {
    return   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18 }}>Loading... </Text>
      </View>
  }
 
  return (

    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right', // Optional: Add slide animation
      }}
    >
      {
        isAuthenticated ? (
          <Stack.Screen
            name="HomeTabs"
            component={HomeTabs}

          />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
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
