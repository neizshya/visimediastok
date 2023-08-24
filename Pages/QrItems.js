import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { collection, doc, getDoc } from "firebase/firestore";
import { firestore } from "../config/firebase";
import { ActivityIndicator } from "react-native-paper";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";

const QrItems = ({ route }) => {
  const { itemId } = route.params;
  const [selectedItem, setSelectedItem] = useState();
  const viewShotRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const screenHeight = Dimensions.get("window").height;

  const fetchItem = async () => {
    try {
      const itemCollectionRef = collection(firestore, "items");
      const itemDocRef = doc(itemCollectionRef, itemId);
      const itemDocSnapshot = await getDoc(itemDocRef);

      if (itemDocSnapshot.exists()) {
        setSelectedItem({
          id: itemDocSnapshot.id,
          ...itemDocSnapshot.data(),
        });
      } else {
        console.log("Item not found.");
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching item data:", error);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchItem();
  }, []);
  const captureAndSave = async () => {
    if (viewShotRef.current) {
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Unable to save QR code. Please grant permission."
        );
        return;
      }

      viewShotRef.current.capture().then(async (uri) => {
        try {
          const folderName = "QR Code Barang";
          const folderPath = FileSystem.documentDirectory + folderName;

          const folderInfo = await FileSystem.getInfoAsync(folderPath);
          if (!folderInfo.exists) {
            await FileSystem.makeDirectoryAsync(folderPath);
          }

          const filename = `${selectedItem?.namebarang}_QR.jpg`;
          const filePath = `${folderPath}/${filename}`;

          await FileSystem.moveAsync({
            from: uri,
            to: filePath,
          });

          const asset = await MediaLibrary.createAssetAsync(filePath);

          if (asset) {
            Alert.alert("Success", "QR code berhasil disimpan.");
          } else {
            Alert.alert("Error", "QR code gagal disimpan.");
          }
        } catch (error) {
          Alert.alert("Error", "An error occurred while saving the QR code.");
          console.error("Error saving QR code:", error);
        }
      });
    }
  };

  return (
    <>
      {isLoading ? (
        <View
          style={{
            height: screenHeight,
            justifyContent: "center",
            alignContent: "center",
          }}>
          <ActivityIndicator animating={true} color="#5689c0" size={"large"} />
        </View>
      ) : (
        <TouchableWithoutFeedback onPress={captureAndSave}>
          <View style={styles.container}>
            <ViewShot
              ref={viewShotRef}
              options={{ format: "jpg", quality: 0.9 }}>
              <QRCode
                value={`{
                  "itemId": "${selectedItem.id}", 
                  "itemName": "${selectedItem.item_name}"
                }`}
                size={250}
                bgColor="#000"
                fgColor="#fff"
              />
            </ViewShot>
          </View>
        </TouchableWithoutFeedback>
      )}
    </>
  );
};

export default QrItems;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
