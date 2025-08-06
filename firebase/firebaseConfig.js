import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, query, where, getDocs,setDoc, doc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getAuth, createUserWithEmailAndPassword, updateProfile, getReactNativePersistence, initializeAuth, signInWithEmailAndPassword } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
const {
  firebaseApiKey,
  firebaseAuthDomain,
  firebaseProjectId,
  firebaseStorageBucket,
  firebaseMessagingSenderId,
  firebaseAppId,
} = Constants.expoConfig.extra;


const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId,
};
 
const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and get a reference to the service

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});


export async function signup({ email, password, displayName, companyId }) {

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Set display name
    await updateProfile(user, {
      displayName: displayName,
    });
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      displayName,
      companyId,
      createdAt: new Date().toISOString(),
    });



    return {
      status: 'ok',
      error: false,
      message: user,
    };
  } catch (error) {

    return {
      status: 'error',
      error: true,
      message: error.message,
    };
  }
}

export async function signin({ email, password }) {

  const auth = getAuth();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    return {
      status: 'ok',
      error: false,
      message: user,
    };
  } catch (error) {
    console.log('Signin Error:', error.message);

    return {
      status: 'error',
      error: true,
      message: error.message,
    };
  }
}
export const db = getFirestore(app);

// Firestore → SQLite local DB
const updateLocalTasks = async () => {
  const querySnapshot = await getDocs(collection(db, "PMTasks"));
  const tasks = [];

  querySnapshot.forEach((doc) => {
    tasks.push({ id: doc.id, ...doc.data() });
  });

  // Clear old and insert new into SQLite
  await saveTasksToSQLite(tasks);
};

/* use it to get detailed tasks from firestore */

export const updateDetailedTasks = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "allTasks"));
    const tasks = [];

    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
      // console.log('====================================');
      // // console.log(doc.data());
      // // console.log(doc.data());
      // console.log('====================================');
    });

    // Save to cache
    await storeData('cached_tasks', tasks);

    console.log("Tasks fetched and cached successfully");
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};


//  updateDetailedTasks();

const storeData = async (key, value) => {
  // console.log('====================================');
  // console.log('from storeData',key,value);
  // console.log('====================================');
  try {
    const jsonValue = JSON.stringify(value);
    // console.log('============ jsonValue ===============');
    // console.log(jsonValue);
    // console.log('====================================');
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error saving to storage', e);
  }
};


export const loadData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Failed to load data from cache', e);
    return null;
  }
};


// const cached  = await loadData('cached_tasks');
//
//
//
//
export const updateSpares = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "spares"));
    const spares = [];

    querySnapshot.forEach((doc) => {
      spares.push({ id: doc.id, ...doc.data() });
      // console.log('====================================');
      // console.log(doc.data());
      // console.log('====================================');
    });

    // Save to cache
    await storeData('cached_spares', spares);

    console.log("spares fetched and cached successfully");
  } catch (error) {
    console.error("Error fetching spares:", error);
  }
};


//  Load spares from cache();
export const loadSpares = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Failed to load data from cache', e);
    return null;
  }
};
////////////////////////// Load favorites
export const loadFavorites = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Failed to load favorites from cache', e);
    return null;
  }
};

//////////////////// update to favorites
export const storeFavorites = async (key, value) => {

  try {
    const jsonValue = JSON.stringify(value);
    // console.log('============ jsonValue ===============');
    // console.log(jsonValue);
    // console.log('====================================');
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error saving to storage', e);
  }
};

//////////////////
