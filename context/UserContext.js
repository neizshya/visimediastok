// usercontext.js
import { createContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, firestore } from "../config/firebase";
import { query } from "firebase/database";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
export const UserContext = createContext(null);
export const useUserState = (handleNavigationAfterLogin) => {
  const initialState = {
    userID: "",
    userData: {},
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loggedInUserData, setLoggedInUserData] = useState(initialState);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const HandlePressLogin = async (navigation) => {
    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setIsLoading(false);
      if (
        error.code === "auth/invalid-email" ||
        error.code === "auth/wrong-password"
      ) {
        alert("Email atau password yang digunakan salah");
      } else if (error.code === "auth/user-not-found") {
        alert("Akun yang digunakan tidak ada di database");
      } else {
        alert("Ada masalah dengan request yang anda lakukan");
      }
    }
  };

  const onAuthChanged = async (currentUser) => {
    if (currentUser) {
      try {
        const userDocRef = doc(firestore, `users/${currentUser.uid}`);
        const docSnapshot = await getDoc(userDocRef);
        const userData = docSnapshot.data();

        setLoggedInUserData({
          userID: currentUser.uid,
          userData: userData || {},
        });

        setIsDataLoaded(true);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    } else {
      setLoggedInUserData(initialState);
      setIsDataLoaded(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, onAuthChanged);

    return () => {
      unsubscribe();
    };
  }, []);
  const handleForceLogout = async () => {
    try {
      await signOut(auth); // Trigger the sign-out process
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  return {
    HandlePressLogin,
    isLoading,
    loggedInUserData,
    email,
    setEmail,
    password,
    setPassword,
    searchQuery,
    setSearchQuery,
    initialState,
    setLoggedInUserData,
    isDataLoaded,
    setIsLoading,
    setIsDataLoaded,
    handleForceLogout,
  };
};
