import React, { useContext, useEffect, useState } from "react";
import { View, Text, StatusBar, Image } from "react-native";
import { Button } from "react-native-paper";
import LoginButtons from "../src/Components/LoginButton";
import { signOut } from "firebase/auth";
import { auth, firestore } from "../config/firebase";
import { collection, doc } from "firebase/firestore";
import { UserContext } from "../context/UserContext";

export default function ProfileScreen({ navigation }) {
  const [logoutLoading, setLogoutLoading] = useState(false);
  const {
    loggedInUserData,
    setEmail,
    setLoggedInUserData,
    setPassword,
    initialState,
    setIsLoading,
    setIsDataLoaded,
  } = useContext(UserContext);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await signOut(auth);
      setEmail("");
      setPassword("");
      setLoggedInUserData(initialState);
      setIsDataLoaded(false);
      setIsLoading(false);
      navigation.replace("Login");
    } catch (error) {
      console.error(error);
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle={"dark-content"} backgroundColor={"#5689c0"} />
      <View
        style={{
          flex: 0.8,
          backgroundColor: "#fafafa",
          alignItems: "center",
          paddingTop: 32,
        }}>
        <Image
          source={{ uri: loggedInUserData.userData.image }}
          style={{
            width: 150,
            height: 150,
            borderRadius: 100,
          }}
        />
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            paddingTop: 12,
          }}>
          {loggedInUserData.userData.name}
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: "#fafafa",
          flexDirection: "row",
          paddingHorizontal: 20,
          paddingTop: 4,
        }}>
        <View
          style={{
            flex: 0.9,
            backgroundColor: "#fafafa",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}>
          <Text style={{ fontSize: 20, paddingVertical: 8 }}>Posisi</Text>
          <Text style={{ fontSize: 20, paddingVertical: 8 }}>
            Jenis Kelamin
          </Text>
        </View>
        <View
          style={{
            flex: 0.1,
            backgroundColor: "#fafafa",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}>
          <Text style={{ fontSize: 20, paddingVertical: 8 }}>:</Text>
          <Text style={{ fontSize: 20, paddingVertical: 8 }}>:</Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: "#fafafa",

            flexDirection: "column",
            justifyContent: "flex-start",
          }}>
          <Text style={{ fontSize: 20, paddingVertical: 8 }}>
            {loggedInUserData.userData.role}
          </Text>
          <Text style={{ fontSize: 20, paddingVertical: 8 }}>
            {loggedInUserData.userData.gender}
          </Text>
        </View>
      </View>
      <View
        style={{ flex: 1, backgroundColor: "#fafafa", paddingHorizontal: 20 }}>
        <LoginButtons
          text="Keluar"
          onPressHandle={handleLogout}
          loading={logoutLoading}
        />
      </View>
    </View>
  );
}
