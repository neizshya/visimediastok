import React, { useContext, useEffect, useState } from "react";
import { View, Text, StatusBar, Image, StyleSheet } from "react-native";
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#5689c0" />
      <View style={styles.profileInfo}>
        <Image
          source={{ uri: loggedInUserData.userData.image }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{loggedInUserData.userData.name}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Posisi</Text>
          <Text style={styles.detailValue}>
            {loggedInUserData.userData.role}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Jenis Kelamin</Text>
          <Text style={styles.detailValue}>
            {loggedInUserData.userData.gender}
          </Text>
        </View>
      </View>
      <View style={styles.logoutContainer}>
        <LoginButtons
          text="Keluar"
          onPressHandle={handleLogout}
          loading={logoutLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  profileInfo: {
    flex: 0.8,
    backgroundColor: "#fafafa",
    alignItems: "center",
    paddingTop: 32,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 100,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    paddingTop: 12,
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: "#fafafa",
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  detailRow: {
    flex: 1,
    backgroundColor: "#fafafa",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  detailLabel: {
    fontSize: 20,
    paddingVertical: 8,
  },
  detailValue: {
    fontSize: 20,
    paddingVertical: 8,
  },
  logoutContainer: {
    flex: 1,
    backgroundColor: "#fafafa",
    paddingHorizontal: 20,
  },
});
