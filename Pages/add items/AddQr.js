import React, { useState, useEffect, Fragment } from "react";
import { Text, View, StyleSheet, Image, Dimensions } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { TouchableOpacity } from "react-native-gesture-handler";
import styles from "./AddStyle";
import { TextInput, Button, ActivityIndicator } from "react-native-paper";
import NumericInput from "react-native-numeric-input";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment/moment";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../../config/firebase";
/*
data buat scan qr bentuk JSON :
{
"idbarang" : "id barangnya",
"namabarang":"nama barangnya",
}

*/
export default function AddQr({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFetching, setIsLoadingFetching] = useState(false);
  const [fetchedItem, setFetchedItem] = useState({});
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const [scannedItem, setScannedItem] = useState({
    itemId: "",
    itemName: "",
    qty: 1,
    timeIn: "",
    sender: "",
    nota: "",
  });
  const [scanning, setScanning] = useState({
    scanned: false,
    isCameraOn: false,
  });
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);
  const handleBarCodeScanned = async ({ type, data }) => {
    setScanning({
      isCameraOn: false,
      scanned: true,
    });
    setIsLoadingFetching(true);
    try {
      const parsedData = JSON.parse(data);
      const itemCollectionRef = collection(firestore, "items");
      const itemDocRef = doc(itemCollectionRef, parsedData.itemId);
      const itemDocSnapshot = await getDoc(itemDocRef);
      if (itemDocSnapshot.exists()) {
        setFetchedItem(itemDocSnapshot.data());
        setScannedItem({
          itemId: parsedData.itemId,
          itemName: parsedData.itemName,
          qty: 1,
          timeIn: "",
          sender: "",
          nota: "",
        });
      } else {
        console.log("Barang tidak ditemukan");
      }
      setIsLoadingFetching(false);
    } catch (error) {
      alert(
        "Qr Code yang discan harus menggunakan QR Code yang dibuat di aplikasi ini"
      );
      setScannedItem(null);
      setIsLoadingFetching(false);
    }
  };
  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const handleOnPress = async () => {
    setIsLoading(true);
    try {
      await updateDoc(doc(firestore, `items/${scannedItem.itemId}`), {
        qty: fetchedItem.qty + scannedItem.qty,
      });
      await addDoc(collection(firestore, `history`), {
        name: scannedItem.itemName,
        date: scannedItem.timeIn,
        nota: scannedItem.nota,
        person: scannedItem.sender,
        Tipe: "in",
        qty: fetchedItem.qty + scannedItem.qty,
      });
      setIsLoading(false);
      alert("Barang berhasil ditambahkan");

      navigation.navigate("Items");
    } catch (error) {
      console.error("Error adding data:", error);
      setIsLoading(false);
    }
  };
  return (
    <View style={styles.scrollViewStyle}>
      <View style={styles.cardView}>
        {scanning.isCameraOn === true && scanning.scanned === false ? (
          <>
            {/* during*/}
            <BarCodeScanner
              onBarCodeScanned={
                scanning.scanned ? undefined : handleBarCodeScanned
              }
              style={StyleSheet.absoluteFillObject}
            />
          </>
        ) : scanning.isCameraOn === false && scanning.scanned === true ? (
          <>
            {/* after scan */}
            <View style={{ width: screenWidth * 0.8 }}>
              <View>
                {scannedItem ? (
                  <>
                    {isLoadingFetching ? (
                      <>
                        <ActivityIndicator
                          animating={true}
                          color="#5689c0"
                          size={"large"}
                        />
                      </>
                    ) : (
                      <>
                        <Text>ID Barang: {scannedItem.itemId}</Text>
                        <Text>Nama Barang: {scannedItem.itemName}</Text>
                        {/* qty */}
                        <View style={{ marginBottom: 10 }}>
                          <Text style={{ marginBottom: 10 }}>Qty:</Text>
                          <NumericInput
                            rounded
                            totalWidth={100}
                            totalHeight={40}
                            separatorWidth={0.5}
                            valueType="real"
                            minValue={1}
                            value={scannedItem.qty}
                            onChange={(value) =>
                              setScannedItem({ ...scannedItem, qty: value })
                            }
                          />
                        </View>
                        {/* inTime */}
                        <View>
                          <Text style={{ marginBottom: 10 }}>
                            Tanggal Masuk:
                          </Text>
                          <Button
                            buttonColor="#5689c0"
                            style={{
                              width: 150,
                              height: 40,
                              borderRadius: 10,
                            }}
                            textColor="white"
                            mode="elevated"
                            onPress={showDatePicker}>
                            {scannedItem.timeIn === "" ? (
                              <>Pilih tanggal</>
                            ) : (
                              <>{scannedItem.timeIn}</>
                            )}
                          </Button>
                          {/* picked */}
                          <DateTimePickerModal
                            isVisible={isDatePickerVisible}
                            mode="date"
                            onConfirm={(date) => {
                              setScannedItem({
                                ...scannedItem,
                                timeIn: moment(date).format("DD-MM-YYYY"),
                              });
                              hideDatePicker();
                            }}
                            onCancel={hideDatePicker}
                          />
                        </View>

                        {/* sender */}
                        <View style={{ marginVertical: 10 }}>
                          <Text>Pengirim:</Text>
                          <TextInput
                            mode="outlined"
                            style={{ height: 30 }}
                            value={scannedItem.sender}
                            onChangeText={(text) =>
                              setScannedItem({ ...scannedItem, sender: text })
                            }
                          />
                        </View>
                        <View style={{ marginVertical: 10 }}>
                          <Text>Nota:</Text>
                          <TextInput
                            mode="outlined"
                            style={{ height: 30 }}
                            value={scannedItem.nota}
                            onChangeText={(text) =>
                              setScannedItem({ ...scannedItem, nota: text })
                            }
                          />
                        </View>

                        <Button
                          mode="contained"
                          style={{ marginTop: screenHeight * 0.2 }}
                          buttonColor="#5689c0"
                          textColor="white"
                          disabled={
                            scannedItem.timeIn === "" || scannedItem.qty === 0
                              ? true
                              : false
                          }
                          onPress={handleOnPress}
                          loading={isLoading}>
                          Tambah Barang
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Text>
                      Qr Code yang discan harus menggunakan QR Code yang dibuat
                      di aplikasi ini
                    </Text>
                    <Button
                      mode="contained"
                      onPress={() =>
                        setScanning({
                          scanned: false,
                          isCameraOn: false,
                        })
                      }
                      style={{ marginTop: screenHeight * 0.2 }}
                      buttonColor="#5689c0"
                      textColor="white">
                      Tap to Scan Again
                    </Button>
                  </>
                )}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* before scan */}
            <Image
              source={require("../../assets/camera.png")}
              style={{ height: 36, width: 36 }}></Image>
            <Text numberOfLines={8} style={styles.descText}>
              Arahkan kamera {"\n"} ke QR Code
            </Text>
            <Image
              source={require("../../assets/qr-code.png")}
              style={{ margin: 20 }}></Image>
            <TouchableOpacity
              onPress={() => {
                setScanning({
                  scanned: false,
                  isCameraOn: true,
                });
              }}
              style={styles.buttonScan}>
              <View style={styles.buttonWrapper}>
                <Image
                  source={require("../../assets/camera.png")}
                  style={{ height: 36, width: 36 }}></Image>
                <Text style={{ ...styles.buttonTextStyle, color: "#2196f3" }}>
                  Scan QR Code
                </Text>
              </View>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
