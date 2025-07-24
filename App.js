import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import AuthScreen from './screens/AuthScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PreventiveMaintenanceScreen from './screens/PreventiveMaintenanceScreen'

import Home from './screens/Home';
import Tools from './screens/Utils';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


function HomeTabs() {
  return (
    <Tab.Navigator>
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
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen
        name="AuthScreen"
        component={AuthScreen}
      />
      <Stack.Screen
        name="HomeTabs"
        component={HomeTabs}
      />
    </Stack.Navigator>
  );
}
export default function App() {
  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
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
