import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAeYnIoSeivCEmRpclgvrim-MRQljti3ok",
    authDomain: "instruapp-6baab.firebaseapp.com",
    projectId: "instruapp-6baab",
    storageBucket: "instruapp-6baab.firebasestorage.app",
    messagingSenderId: "926409663138",
    appId: "1:926409663138:web:03170495c4b812ce8f2dfb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and get a reference to the service
export const signUP = getAuth(app);
export const auth = getAuth();

export function signup({email,password}) {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed up 
            const user = userCredential.user;
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
        });

}
