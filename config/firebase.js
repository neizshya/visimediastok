import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
export const firebaseConfig = {
  apiKey: "AIzaSyDnNZKW_elUpngLkrM59LQE6vKFfCQD2VM",
  authDomain: "aplikasistokgudang-6eab8.firebaseapp.com",
  projectId: "aplikasistokgudang-6eab8",
  storageBucket: "aplikasistokgudang-6eab8.appspot.com",
  messagingSenderId: "743222448161",
  appId: "1:743222448161:web:927407196ebc7c09ca1360",
  measurementId: "G-FGVXPD28GK",
};
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
const firestore = getFirestore(app);
const db = getDatabase(app);
export { app, firebase, auth, db, firestore };
