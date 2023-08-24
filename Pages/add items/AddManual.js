import React, { useState, useEffect, Fragment } from "react";
import { Text, View, StyleSheet, Image, Dimensions } from "react-native";
import styles from "./AddStyle";
import { Button, TextInput } from "react-native-paper";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import NumericInput from "react-native-numeric-input";
import moment from "moment";
import * as ImagePicker from "expo-image-picker";
import { firebase, firestore } from "../../config/firebase";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
export default function AddManual({ navigation }) {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataItem, setDataItem] = useState({
    itemId: "",
    itemName: "",
    qty: 1,
    date: "",
    person: "",
    img: "",
    Tipe: "in",
    nota: "",
  });
  const [uploading, setUploading] = useState(false);
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };
  const historyQueryCollection = collection(firestore, `history`);
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.assets[0] !== null) {
      console.log(result.assets[0]);
    }

    if (!result.canceled) {
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function () {
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", result.assets[0].uri, true);
        xhr.send(null);
      });
      const ref = firebase.storage().ref().child(`items/${dataItem.itemId}`);
      const snapshot = ref.put(blob);
      snapshot.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        () => {
          setUploading(true);
        },
        (error) => {
          setUploading(false);
          console.log(error);
          blob.close();
          return;
        },
        () => {
          snapshot.snapshot.ref.getDownloadURL().then((url) => {
            setUploading(false);
            console.log("Download URL: ", url);
            setDataItem({ ...dataItem, img: url });
            blob.close();
            return url;
          });
        }
      );
    }
  };
  const handleOnPress = async () => {
    setIsLoading(true);
    try {
      const itemData = {
        id: dataItem.itemId,
        addedAt: dataItem.date,
        item_img: dataItem.img,
        item_name: dataItem.itemName,
        qty: dataItem.qty,
      };

      const historyData = {
        name: dataItem.itemName,
        date: dataItem.date,
        nota: dataItem.nota,
        person: dataItem.person,
        Tipe: "in",
        qty: dataItem.qty,
      };

      await setDoc(doc(firestore, "items", dataItem.itemId), itemData);
      await addDoc(historyQueryCollection, historyData);

      setDataItem({
        itemId: "",
        itemName: "",
        qty: 1,
        date: "",
        person: "",
        img: "",
        Tipe: "in",
      });
      setIsLoading(false);
      alert("Barang berhasil ditambahkan");

      navigation.navigate("Items");
    } catch (error) {
      alert(`error : ${error.message}`);
      console.log(error.message);
      setIsLoading(false);
    }
  };
  return (
    <View style={styles.scrollViewStyle}>
      <View style={styles.cardView}>
        <View style={{ width: screenWidth * 0.8 }}>
          <View style={{ marginVertical: 5 }}>
            <Text>Id Barang:</Text>
            <TextInput
              mode="outlined"
              style={{ height: 30 }}
              value={dataItem.itemId}
              onChangeText={(text) =>
                setDataItem({ ...dataItem, itemId: text })
              }
            />
          </View>
          <View style={{ marginVertical: 5 }}>
            <Text>Nama Barang:</Text>
            <TextInput
              mode="outlined"
              style={{ height: 30 }}
              value={dataItem.itemName}
              onChangeText={(text) =>
                setDataItem({ ...dataItem, itemName: text })
              }
            />
          </View>
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
              value={dataItem.qty}
              onChange={(value) => setDataItem({ ...dataItem, qty: value })}
            />
          </View>
          {/* inTime */}
          <View>
            <Text style={{ marginBottom: 10 }}>Tanggal Masuk:</Text>
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
              {dataItem.date === "" ? <>Pilih tanggal</> : <>{dataItem.date}</>}
            </Button>
            {/* picked */}
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={(date) => {
                setDataItem({
                  ...dataItem,
                  date: moment(date).format("DD-MM-YYYY"),
                });
                hideDatePicker();
              }}
              onCancel={hideDatePicker}
            />
          </View>
          {/* img */}
          <View style={{ marginTop: 10 }}>
            <Text style={{ marginBottom: 10 }}>Foto Barang</Text>
            <Button
              buttonColor="#5689c0"
              style={{
                width: 150,
                height: 40,
                borderRadius: 10,
              }}
              textColor="white"
              mode="elevated"
              loading={uploading ? true : false}
              disabled={
                dataItem.itemId === "" || dataItem.itemName === ""
                  ? true
                  : false
              }
              onPress={pickImage}>
              {dataItem.img === "" ? (
                <>Pilih gambar </>
              ) : uploading ? (
                <>Uploading...</>
              ) : (
                <>Gambar terpilih</>
              )}
            </Button>
          </View>
          {/* person */}
          <View style={{ marginVertical: 10 }}>
            <Text>Pengirim:</Text>
            <TextInput
              mode="outlined"
              style={{ height: 30 }}
              value={dataItem.person}
              onChangeText={(text) =>
                setDataItem({ ...dataItem, person: text })
              }
            />
          </View>
          <View style={{ marginVertical: 10 }}>
            <Text>Nota:</Text>
            <TextInput
              mode="outlined"
              style={{ height: 30 }}
              value={dataItem.nota}
              onChangeText={(text) => setDataItem({ ...dataItem, nota: text })}
            />
          </View>

          <Button
            mode="contained"
            style={{ marginTop: 25, borderRadius: 10 }}
            buttonColor="#5689c0"
            textColor="white"
            loading={isLoading}
            onPress={handleOnPress}
            disabled={
              dataItem.itemId === "" ||
              dataItem.itemName === "" ||
              dataItem.qty === 0 ||
              dataItem.date === "" ||
              dataItem.img === ""
                ? true
                : false
            }>
            Tambah barang
          </Button>
        </View>
      </View>
    </View>
  );
}
