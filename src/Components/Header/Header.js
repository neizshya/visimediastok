import React, { useContext, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dimensions, Image, Text, View } from "react-native";
import {
  SimpleLineIcons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome,
  Feather,
} from "@expo/vector-icons";
import {
  DrawerItemList,
  createDrawerNavigator,
} from "@react-navigation/drawer";
import Dashboard from "../../../Pages/Dashboard";
import ProfileScreen from "../../../Pages/Profile";
import ItemsScreen from "../../../Pages/Items";
import ReportScreen from "../../../Pages/Report";
import { UserContext } from "../../../context/UserContext";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Icon from "react-native-vector-icons/Feather";
const Drawer = createDrawerNavigator();
export default function Header() {
  const [showSearchBar, setShowSearchBar] = useState(false);
  const { loggedInUserData, searchQuery, setSearchQuery } =
    useContext(UserContext);
  const animations = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width:
        animations.value === 1
          ? withTiming(200, { duration: 500 })
          : withTiming(0, { duration: 500 }),
    };
  });
  const toggleSearchBar = () => {
    animations.value = animations.value === 1 ? 0 : 1;
    if (showSearchBar) {
      setTimeout(() => {
        setShowSearchBar(false);
      }, 300);
    } else {
      setShowSearchBar(true);
    }
    setSearchQuery("");
  };
  const handleSearchInputChange = (text) => {
    setSearchQuery(text);
  };
  return (
    <Drawer.Navigator
      drawerContent={(props) => {
        return (
          <SafeAreaView>
            <View
              style={{
                height: 200,
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
                borderBottomColor: "#f4f4f4",
                borderBottomWidth: 1,
              }}>
              <Image
                source={{ uri: loggedInUserData.userData.image }}
                style={{
                  height: 130,
                  width: 130,
                  borderRadius: 65,
                }}
              />
              <Text
                style={{
                  fontSize: 22,
                  marginVertical: 6,
                  fontWeight: "bold",
                  color: "#111",
                }}>
                {loggedInUserData.userData.name}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: "#111",
                }}>
                {loggedInUserData.userData.role}
              </Text>
            </View>
            <DrawerItemList {...props} />
          </SafeAreaView>
        );
      }}
      screenOptions={{
        drawerStyle: {
          backgroundColor: "#fff",
          width: 250,
        },
        headerStyle: {
          backgroundColor: "#5689c0",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        drawerLabelStyle: {
          color: "#111",
        },
      }}>
      <Drawer.Screen
        name="Home"
        options={{
          drawerLabel: "Dashboard",
          title: "Dashboard",
          drawerIcon: () => (
            <SimpleLineIcons name="home" size={20} color="#808080" />
          ),
        }}
        component={Dashboard}
      />
      <Drawer.Screen
        name="Items"
        options={{
          drawerLabel: "List Barang",
          title: "List Barang",
          drawerIcon: () => <Icon name="list" size={20} color="#808080" />,
          headerRight: () =>
            showSearchBar ? (
              <>
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingTop: 5,
                    paddingHorizontal: 10,
                  }}>
                  <Animated.View
                    style={[
                      {
                        height: 30,
                        width: Dimensions.get("window").width * 0.5,
                        backgroundColor: "white",
                        borderRadius: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        paddingLeft: 10,
                      },
                      animatedStyle,
                    ]}>
                    <TextInput
                      style={{ width: "85%" }}
                      placeholder="Nama Barang"
                      onChangeText={(text) => setSearchQuery(text)}
                    />
                    <TouchableOpacity onPress={toggleSearchBar}>
                      <Feather name="x" size={24} color="black" />
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={toggleSearchBar}>
                  <SimpleLineIcons
                    name="magnifier"
                    size={20}
                    color="#fff"
                    style={{ marginRight: 15 }}
                  />
                </TouchableOpacity>
              </>
            ),
        }}
        component={ItemsScreen}
      />
      <Drawer.Screen
        name="Report"
        options={{
          drawerLabel: "Laporan",
          title: "Laporan",
          drawerIcon: () => (
            <SimpleLineIcons name="docs" size={20} color="#808080" />
          ),
        }}
        component={ReportScreen}
      />
      <Drawer.Screen
        name="Account"
        options={{
          drawerLabel: "Akun",
          title: "Akun",
          drawerIcon: () => (
            <SimpleLineIcons name="user" size={20} color="#808080" />
          ),
        }}
        component={ProfileScreen}
      />
    </Drawer.Navigator>
  );
}
