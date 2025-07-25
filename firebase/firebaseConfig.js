import { initializeApp } from "firebase/app";
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
  console.log('=======from sign in page=========');
  console.log(email, password);
  console.log('====================================');
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
