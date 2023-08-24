import { useCallback, useEffect, useContext, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import FloatingButton from "../src/Components/FloatingButton";
import { UserContext } from "../context/UserContext";
import { ActivityIndicator, Searchbar, Snackbar } from "react-native-paper";
import ItemDetail from "./ItemDetail";
import defaultimg from "../src/images/defaultitem.png";
import { firestore } from "../config/firebase";
import { collection, doc, getDocs } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";

export default function ItemsScreen({ navigation }) {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const { loggedInUserData, searchQuery } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);
  const [itemsData, setItemsData] = useState([]); // State to hold fetched data
  const [currentPage, setCurrentPage] = useState(1);

  const fetchItems = async () => {
    try {
      const itemsCollectionRef = collection(firestore, "items");
      const querySnapshot = await getDocs(itemsCollectionRef);

      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const filteredItems = items.filter((item) =>
        item.item_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setItemsData(filteredItems);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching items data:", error);
      setIsLoading(false);
    }
  };

  const refreshItemsData = async () => {
    setIsLoading(true);
    setCurrentPage(1);
    setItemsData([]);
    await fetchItems();
  };
  useEffect(() => {
    fetchItems();
  }, []);
  useFocusEffect(
    useCallback(() => {
      refreshItemsData();
      return () => {};
    }, [searchQuery])
  );
  return (
    <>
      <View
        style={{
          backgroundColor: "#fafafa",
        }}>
        <View
          style={{
            paddingHorizontal: 20,
            marginBottom: 12,
            height: screenHeight * 0.9,
          }}>
          <SafeAreaView>
            {isLoading ? (
              <View
                style={{
                  height: screenHeight,
                  justifyContent: "center",
                  alignContent: "center",
                }}>
                <ActivityIndicator
                  animating={true}
                  color="#5689c0"
                  size={"large"}
                />
              </View>
            ) : (
              <FlatList
                data={itemsData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  return (
                    <>
                      <TouchableOpacity
                        style={{}}
                        onPress={() => {
                          navigation.navigate("ItemDetail", {
                            itemId: item.id,
                          });
                        }}>
                        <View
                          style={{
                            backgroundColor: "#75e2ff",
                            flexDirection: "row",
                            paddingVertical: 16,
                            paddingHorizontal: 16,
                            borderRadius: 12,
                            marginTop: 12,
                            elevation: 2,
                          }}>
                          <Image
                            style={{ height: 100, width: 100, borderRadius: 8 }}
                            source={{ uri: item.item_img }}
                          />
                          <View
                            style={{
                              flexDirection: "column",
                              paddingLeft: 16,
                            }}>
                            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                              {item.item_name}
                            </Text>
                            <View
                              style={{ flexDirection: "row", paddingTop: 12 }}>
                              <Text style={{ fontSize: 16 }}>Jumlah: </Text>
                              <Text style={{ fontSize: 16 }}>{item.qty}</Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </>
                  );
                }}
              />
            )}
          </SafeAreaView>
        </View>
        {isLoading ? (
          <></>
        ) : (
          <>
            {loggedInUserData.userData.isAdmin ? (
              <>
                <FloatingButton
                  onpressManual={() => {
                    navigation.navigate("AddManual");
                  }}
                  onPressQr={() => {
                    navigation.navigate("AddQr");
                  }}
                />
              </>
            ) : (
              <></>
            )}
          </>
        )}
      </View>
    </>
  );
}
