import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";

import { getAuth, createUserWithEmailAndPassword, getReactNativePersistence, initializeAuth, signInWithEmailAndPassword } from "firebase/auth";
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
// const firebaseConfig = {
//   apiKey: "AIzaSyAeYnIoSeivCEmRpclgvrim-MRQljti3ok",
//   authDomain: "instruapp-6baab.firebaseapp.com",
//   projectId: "instruapp-6baab",
//   storageBucket: "instruapp-6baab.firebasestorage.app",
//   messagingSenderId: "926409663138",
//   appId: "1:926409663138:web:03170495c4b812ce8f2dfb"
// };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and get a reference to the service

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});


export async function signup({ email, password }) {

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

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


const updateDetailedlTasks = async () => {
  const querySnapshot = await getDocs(collection(db, "allTasks"));
  const tasks = [];

  querySnapshot.forEach((doc) => {
    tasks.push({ id: doc.id, ...doc.data() });
  });
  console.log('========== yy all tasks   =============');
  console.log(tasks);
  console.log('====================================');
  // Clear old and insert new into SQLite
  // await saveTasksToSQLite(tasks);
};
updateDetailedlTasks();
 
 