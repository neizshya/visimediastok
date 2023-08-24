import React, { useContext, useEffect, useState } from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ActivityIndicator, Button, TextInput } from "react-native-paper";
import TambahBarangModal from "../src/Components/TambahBarangModal";
import KurangiBarangModal from "../src/Components/KurangiBarangModal";
import { firestore } from "../config/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { UserContext } from "../context/UserContext";

const screenWidth = Dimensions.get("window").width;

const ItemDetail = ({ route }) => {
  const { loggedInUserData } = useContext(UserContext);
  const { itemId } = route.params;
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [barang, setBarang] = useState({
    id: "",
    item_name: "",
    qty: "",
  });
  const [isLoadingSaving, setIsLoadingSaving] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [isEdit, setIsEdit] = useState(true);
  const [tambahModalVisible, setTambahModalVisible] = useState(false);
  const [kurangiModalVisible, setKurangiModalVisible] = useState(false);
  const [tambahData, setTambahData] = useState({});
  const [kurangiData, setKurangiData] = useState({});

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
        setBarang({
          id: itemDocSnapshot.id,
          item_name: itemDocSnapshot.data().item_name,
          qty: itemDocSnapshot.data().qty,
        });
        navigation.setOptions({ title: itemDocSnapshot.data().item_name });
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
  }, [itemId, navigation]);

  const handleEditPress = () => {
    setIsEdit(!isEdit);
    if (!isEdit) {
      setBarang({
        id: selectedItem ? selectedItem.id : "",
        item_name: selectedItem ? selectedItem.item_name : "",
        qty: selectedItem ? selectedItem.qty : "",
      });
    }
  };

  const handleSavePress = async () => {
    setIsLoadingSaving(true);
    try {
      const docRef = doc(firestore, `items/${selectedItem.id}`);
      await updateDoc(docRef, {
        item_name: barang.item_name,
      });

      await setDoc(docRef, { id: selectedItem.id }, { merge: true });

      setIsLoadingSaving(false);
      setIsEdit(true);
      navigation.navigate("Items");
    } catch (error) {
      console.error("Error updating document:", error);
      setIsLoadingSaving(false);
      setIsEdit(true);
    }
  };

  const handleKurangiPress = () => {
    setKurangiModalVisible(true);
  };

  const handleKurangiSave = async (data) => {
    try {
      if (!data.quantity || isNaN(parseInt(data.quantity))) {
        return;
      }

      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newQuantity = selectedItem.qty - parseInt(data.quantity);
      if (newQuantity >= 0) {
        // Update the item's quantity in the database
        await updateDoc(doc(firestore, `items/${selectedItem.id}`), {
          qty: newQuantity,
        });

        // Add a new history document to the collection
        await addDoc(collection(firestore, `history`), {
          name: selectedItem.item_name,
          date: data.date,
          nota: data.nota,
          person: data.sender,
          Tipe: "out",
          qty: newQuantity,
        });

        // Fetch and update the updated item data
        await fetchItem();
        setIsLoading(false);
        setKurangiModalVisible(false);
      } else {
        console.log("Cannot reduce beyond zero");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error updating document:", error);
      setIsLoading(false);
    }
  };

  const handleTambahPress = () => {
    setTambahModalVisible(true);
  };
  const handleTambahSave = async (data) => {
    try {
      if (!data.quantity || isNaN(parseInt(data.quantity))) {
        return;
      }

      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newQuantity = selectedItem.qty + parseInt(data.quantity);

      await updateDoc(doc(firestore, `items/${selectedItem.id}`), {
        qty: newQuantity,
      });

      // Add a new history document to the collection
      await addDoc(collection(firestore, `history`), {
        name: selectedItem.item_name,
        date: data.date,
        nota: data.nota,
        person: data.sender,
        Tipe: "in",
        qty: newQuantity,
      });

      // Fetch and update the updated item data
      await fetchItem();
      setIsLoading(false);
      setTambahModalVisible(false);
    } catch (error) {
      console.error("Error updating document:", error);
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoadingDelete(true);
    try {
      if (selectedItem) {
        await deleteDoc(doc(firestore, `items/${selectedItem.id}`));
        setIsLoadingDelete(false);
        navigation.navigate("Items");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      setIsLoadingDelete(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <>
          <ActivityIndicator animating={true} />
        </>
      ) : (
        <View style={styles.container}>
          <View style={styles.imgContainer}>
            <Image
              source={
                selectedItem?.item_img
                  ? { uri: selectedItem?.item_img }
                  : require("../src/images/defaultitem.png")
              }
              style={styles.image}
            />
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.idBarangContainer}>
              <Text style={styles.label}>ID Barang:</Text>
              <TextInput
                value={String(barang.id)} // Convert to string before passing
                onChangeText={(text) => SetBarang({ ...barang, id: text })}
                style={styles.data}
                disabled={isEdit}
              />
            </View>
            <View style={styles.namaBarangContainer}>
              <Text style={styles.label}>Nama Barang:</Text>
              <TextInput
                value={barang.item_name}
                onChangeText={(text) =>
                  SetBarang({ ...barang, item_name: text })
                }
                style={styles.data}
                disabled={isEdit}
              />
              {loggedInUserData.userData.isAdmin === false ? (
                <></>
              ) : isEdit ? (
                <>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={handleEditPress}>
                    <Text style={styles.editButtonText}>Edit Data</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}>
                    <Button
                      style={styles.editedButton}
                      onPress={handleEditPress}>
                      <Text style={styles.editButtonText}>Batal</Text>
                    </Button>
                    <Button
                      style={styles.editedButton}
                      onPress={handleSavePress}
                      loading={isLoadingSaving}>
                      <Text style={styles.editButtonText}>Simpan</Text>
                    </Button>
                  </View>
                </>
              )}
            </View>
          </View>
          <View style={styles.jumlahContainer}>
            <Text style={styles.label}>Jumlah:</Text>
            <Text style={styles.qtyText}>{selectedItem?.qty}</Text>
            {loggedInUserData.userData.isAdmin === false ? (
              <></>
            ) : (
              <View style={styles.jumlahButton}>
                <TouchableOpacity
                  style={styles.kurangiTambahButton}
                  onPress={handleKurangiPress}>
                  <Text style={styles.kurangiTambahButtonText}>
                    Kurangi Barang
                  </Text>
                </TouchableOpacity>
                <KurangiBarangModal
                  visible={kurangiModalVisible}
                  onClose={() => setKurangiModalVisible(false)}
                  item={selectedItem}
                  onSave={handleKurangiSave}
                />
                <TouchableOpacity
                  style={styles.kurangiTambahButton}
                  onPress={handleTambahPress}>
                  <Text style={styles.kurangiTambahButtonText}>
                    Tambah Barang
                  </Text>
                </TouchableOpacity>
                <TambahBarangModal
                  visible={tambahModalVisible}
                  onClose={() => setTambahModalVisible(false)}
                  item={selectedItem}
                  onSave={handleTambahSave}
                />
              </View>
            )}
          </View>
          {loggedInUserData.userData.isAdmin === false ? (
            <></>
          ) : (
            <Button
              style={styles.deleteButton}
              onPress={handleDelete}
              loading={isLoadingDelete}>
              <Text style={styles.deleteButtonText}>Hapus</Text>
            </Button>
          )}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#fafafa",
    paddingVertical: 20,
  },
  imgContainer: {
    flex: 1,
    alignItems: "center",
    elevation: 3,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 15,
    marginBottom: 16,
  },
  infoContainer: {
    flex: 1,
    marginBottom: 8,
    marginTop: 24,
  },
  idBarangContainer: {
    marginBottom: 12,
  },
  namaBarangContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: "800",
  },
  data: {
    fontSize: 18,
    fontWeight: "400",
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 8,
    paddingVertical: 4,
    backgroundColor: "#eaebed",
    height: 30,
  },
  jumlahContainer: {
    flex: 1,
  },
  editButton: {
    backgroundColor: "#5689c0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    elevation: 3,
  },
  editedButton: {
    backgroundColor: "#5689c0",
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    elevation: 3,
    width: screenWidth * 0.4,
  },
  editButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  qtyText: {
    backgroundColor: "#eaebed",
    fontSize: 18,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 4,
    textAlign: "center",
    paddingVertical: 4,
  },
  jumlahButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    alignItems: "flex-end",
    marginTop: 12,
  },
  kurangiTambahButton: {
    width: 170,
    backgroundColor: "green",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 3,
    marginTop: 4,
  },
  kurangiTambahButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  deleteButton: {
    backgroundColor: "red",
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 3,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ItemDetail;
