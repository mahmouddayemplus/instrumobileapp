import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = 'user';

export async function storeUser(user) {
 

  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
   } catch (e) {
   }
}

export async function getUser() {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (e) {
     return null;
  }
}

export async function removeUser() {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (e) {
   }
}
