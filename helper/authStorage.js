import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = 'user';

export async function storeUser(user) {
  console.log('=========== xxxx ==========');
  console.log('Storing user:', user);
  console.log('====================================');

  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    console.log('User stored successfully xxxx', user);
  } catch (e) {
    console.log('Error storing user', e);
  }
}

export async function getUser() {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (e) {
    console.log('Error getting user', e);
    return null;
  }
}

export async function removeUser() {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (e) {
    console.log('Error removing user', e);
  }
}
