import moment from "moment";
import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import NumericInput from "react-native-numeric-input";
import { TextInput } from "react-native-paper";

const TambahBarangModal = ({ visible, onClose, item, onSave }) => {
  const [quantity, setQuantity] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [nota, setNota] = useState("");
  const [sender, setSender] = useState("");
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const handleSave = async () => {
    if (!quantity || isNaN(parseInt(quantity)) || !selectedDate) {
      return;
    }

    setIsSaving(true);

    // Simulate a network request or any other async action
    await new Promise((resolve) => setTimeout(resolve, 1000));

    onSave({
      quantity: parseInt(quantity),
      date: selectedDate,
      nota: nota,
      sender: sender,
    });

    setIsSaving(false);
    onClose();
  };

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleDateConfirm = (date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Tambah Barang</Text>
          <Text>Jumlah Barang:</Text>

          <NumericInput
            rounded
            totalWidth={100}
            totalHeight={40}
            separatorWidth={0.5}
            valueType="real"
            minValue={1}
            value={parseInt(quantity)}
            onChange={setQuantity}
          />
          <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
            <Text style={styles.dateButtonText}>
              {selectedDate === "" ? (
                <>Pilih Tanggal</>
              ) : (
                <>{moment(selectedDate).format("DD/MM/YYYY")}</>
              )}
            </Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleDateConfirm}
            onCancel={hideDatePicker}
          />

          {/* nota */}
          <TextInput
            placeholder="Nomor Nota"
            value={nota}
            onChangeText={setNota}
            style={{ height: 40, marginVertical: 20 }}
            mode="outlined"
          />
          {/* sender */}
          <TextInput
            placeholder="Penerima"
            value={sender}
            onChangeText={setSender}
            style={{ height: 40 }}
            mode="outlined"
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              {isSaving ? "Menyimpan..." : "Simpan"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Batal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  dateButton: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  dateButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
  },
};

export default TambahBarangModal;
