import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "../../../Pages/Login";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Header from "../Header/Header";
import ProfileScreen from "../../../Pages/Profile";
import AddManual from "../../../Pages/add items/AddManual";
import AddQr from "../../../Pages/add items/AddQr";
import ItemDetail from "../../../Pages/ItemDetail";
import TambahBarangModal from "../TambahBarangModal";
import KurangiBarangModal from "../KurangiBarangModal";
import Icon from "react-native-vector-icons/FontAwesome";
import QrItems from "../../../Pages/QrItems";
const Stack = createStackNavigator();

const StackNavigator = ({ isDataLoaded }) => {
  const navigation = useNavigation();
  const config = {
    animation: "timing",
    config: {
      stiffness: 1000,
      damping: 500,
      mass: 3,
      overshootClamping: true,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    },
  };

  return (
    <Stack.Navigator initialRouteName={isDataLoaded ? "Header" : "Login"}>
      <Stack.Screen
        name="Header"
        component={Header}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="Login"
        component={Login}
      />
      <Stack.Screen
        name="AddManual"
        component={AddManual}
        options={{
          headerBackImage: () => <Feather name="x" size={30} color="white" />,
          headerStyle: {
            backgroundColor: "#5689c0",
          },
          transitionSpec: {
            open: config,
            close: config,
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          title: "Tambah barang",
          gestureDirection: "vertical",
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              containerStyle: {
                transform: [
                  {
                    translateY: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.height, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      />
      <Stack.Screen
        name="AddQr"
        component={AddQr}
        options={{
          headerBackImage: () => <Feather name="x" size={30} color="white" />,
          headerStyle: {
            backgroundColor: "#5689c0",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          title: "Scan QR Code",
          gestureDirection: "vertical",
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              containerStyle: {
                transform: [
                  {
                    translateY: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.height, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      />
      <Stack.Screen
        name="ItemDetail"
        component={ItemDetail}
        options={({ route }) => ({
          headerStyle: {
            backgroundColor: "#5689c0",
          },
          transitionSpec: {
            open: config,
            close: config,
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          title: `Loading`,

          headerRight: () => (
            <View style={{ paddingRight: 20 }}>
              <TouchableOpacity
                onPress={() => {
                  // here's onpress navigation to qritems
                  navigation.navigate("QrItems", {
                    itemId: route.params.itemId, // Pass the itemId to the QrItems screen if needed
                  });
                }}>
                <Icon name="qrcode" size={24} color="#FFFF" />
              </TouchableOpacity>
            </View>
          ),
          gestureDirection: "horizontal",
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              containerStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.height, 0],
                    }),
                  },
                ],
              },
            };
          },
        })}
      />
      <Stack.Screen
        name="QrItems"
        component={QrItems}
        options={({ route }) => ({
          headerStyle: {
            backgroundColor: "#5689c0",
          },
          transitionSpec: {
            open: config,
            close: config,
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          // title: `QR ${
          //   Data.find((item) => item.id === route.params.itemId).namebarang
          // }`,
          gestureDirection: "horizontal",
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              containerStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.height, 0],
                    }),
                  },
                ],
              },
            };
          },
        })}
      />
    </Stack.Navigator>
  );
};

// const MainNavigator = () => {
//   return <StackNavigator />;
// };
export default StackNavigator;
