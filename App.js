import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import Login from "./Pages/Login";
import Home from "./Pages/Dashboard";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import ProfileScreen from "./Pages/Profile";
import MainNavigator from "./src/Components/MainNavigator/MainNavigator";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  SimpleLineIcons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";

import { SafeAreaProvider } from "react-native-safe-area-context";

import { useContext, useEffect, useState } from "react";
import { UserContext, useUserState } from "./context/UserContext";
import StackNavigator from "./src/Components/MainNavigator/MainNavigator";

export default function App() {
  const userState = useUserState();
  const { isDataLoaded } = useUserState();
  return (
    <>
      {/* <Provider> */}
      <UserContext.Provider value={userState}>
        <SafeAreaProvider>
          <NavigationContainer>
            <StackNavigator isDataLoaded={isDataLoaded} />
          </NavigationContainer>
        </SafeAreaProvider>
      </UserContext.Provider>
      {/* </Provider> */}
    </>
  );
}
