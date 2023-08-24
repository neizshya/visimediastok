import React, { useEffect, useState } from "react";
import {
  View,
  SafeAreaView,
  Dimensions,
  StyleSheet,
  ScrollView,
  Text,
  Platform,
  Alert,
} from "react-native";
import { ActivityIndicator, Button, DataTable, List } from "react-native-paper";
import _ from "lodash";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../config/firebase";
import moment from "moment";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as XLSX from "xlsx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";

const deviceWidth = Dimensions.get("screen").width;
const deviceHeight = Dimensions.get("screen").height;

export default function ReportScreen({ navigation }) {
  const headers = [
    "No",
    "Nama Barang",
    "Tipe",
    "Banyak Barang",
    "Tanggal",
    "Pengirim/Penerima",
    "Nomor Nota",
  ];
  const [sortedData, setSortedData] = useState();
  const [sortConfig, setSortConfig] = useState({ column: "", direction: "" });
  const [downloadReport, setDownloadReport] = useState(false);
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [expanded, setExpanded] = useState(false);
  const [isStartDatePickerVisible, setStartDatePickerVisibility] =
    useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filePermissionGranted, setFilePermissionGranted] = useState(false);
  const [dataDownload, setDataDownload] = useState({
    from: "",
    to: "",
    type: "",
  });

  const showStartDatePicker = () => {
    setStartDatePickerVisibility(true);
  };
  const showEndDatePicker = () => {
    setEndDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setStartDatePickerVisibility(false);
    setEndDatePickerVisibility(false);
  };

  const Today = new Date();
  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const historyCollectionRef = collection(firestore, "history");
      const querySnapshot = await getDocs(historyCollectionRef);

      const items = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          Tipe: data.Tipe,
          date: data.date,
          id: doc.id,
          name: data.name,
          nota: data.nota,
          person: data.person,
          qty: parseFloat(data.qty),
        };
      });

      setSortedData(items);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching items data:", error);
      setIsLoading(false);
    }
  };

  const sortFunctions = {
    default: (item) => item,
    numeric: (item) => parseFloat(item),
    date: (item) => new Date(item),
  };

  const handleSort = (column) => {
    const validSortColumns = ["Tipe", "Banyak Barang", "Tanggal"];

    if (validSortColumns.includes(column)) {
      const newSortConfig = { ...sortConfig };

      if (sortConfig.column === column) {
        newSortConfig.direction =
          sortConfig.direction === "ascending" ? "descending" : "ascending";
      } else {
        newSortConfig.column = column;
        newSortConfig.direction = "ascending"; // Default to ascending for a new column
      }

      const sortFunction =
        sortFunctions[newSortConfig.column] || sortFunctions.default;
      const sorted = _.orderBy(
        sortedData,
        (item) => sortFunction(item[column]), // Pass the item[column] to the sort function
        newSortConfig.direction
      );

      setSortedData(sorted);
      setSortConfig(newSortConfig);
      setPage(0);
    }
  };

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, sortedData?.length);

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const cellWidths = [
    30,
    screenWidth * 0.7,
    50,
    screenWidth * 0.3,
    120,
    screenWidth * 0.5,
    screenWidth * 0.4,
  ];
  const exportToExcel = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Unable to save Excel file. Please grant permission."
        );
        return;
      }

      const sortedAndFilteredData = sortedData
        .filter((item) => {
          if (dataDownload.type === "in") {
            return item.Tipe === "in";
          } else if (dataDownload.type === "out") {
            return item.Tipe === "out";
          }
          return true;
        })
        .filter((item) => {
          const startDate = moment(dataDownload.from, "DD/MM/YYYY");
          const endDate = moment(dataDownload.to, "DD/MM/YYYY");
          const itemDate = moment(item.date, "DD-MM-YYYY");
          return itemDate.isBetween(startDate, endDate, null, "[]");
        });
      const test = {
        No: 0,
        "Nama Barang": "",
        Tipe: "",
        "Banyak Barang": "",
        Tanggal: "",
        "Pengirim/Penerima": "",
        "Nomor Nota": "",
      };
      const formattedDataXlsx = [];
      sortedAndFilteredData.map((item, index) => {
        const temp = {
          No: index,
          "Nama Barang": item.name,
          Tipe: item.Tipe,
          "Banyak Barang": item.qty,
          Tanggal: item.date,
          "Pengirim/Penerima": item.person,
          "Nomor Nota": item.nota,
        };
        formattedDataXlsx.push(temp);
      });
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(formattedDataXlsx);

      // Customize column widths
      const columnWidths = [
        { wch: 5 },
        { wch: 20 },
        { wch: 10 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
      ];

      ws["!cols"] = columnWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Laporan");
      const wbout = XLSX.write(wb, {
        type: "base64",
        bookType: "xlsx",
      });
      const xlsxname = `Laporan tanggal ${dataDownload.from}_${dataDownload.to}.xlsx`;

      const folderName = "Laporan";
      const folderPath = FileSystem.cacheDirectory + folderName;
      const filePath = `${folderPath}/${xlsxname}`;

      const folderInfo = await FileSystem.getInfoAsync(folderPath);
      if (!folderInfo.exists) {
        await FileSystem.makeDirectoryAsync(folderPath);
      }

      await FileSystem.writeAsStringAsync(filePath, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (Platform.OS === "ios" || Platform.OS === "android") {
        const fileUri = `file://${filePath}`;
        await Sharing.shareAsync(fileUri);
        Alert.alert("Data Terunduh");
        setDownloadReport(!downloadReport);
      } else {
        Alert.alert(
          "platform tidak didukung",
          "File sharing tidak dapat digunakan di platform ini."
        );
      }
    } catch (error) {
      Alert.alert(`Error exporting to Excel: ${error}`);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchHistory();
    });
    return unsubscribe;
  }, [navigation]);
  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 10 }}>
      <View style={{ flexDirection: "row-reverse", alignItems: "flex-start" }}>
        <Button
          icon={downloadReport ? "" : "download"}
          mode="contained-tonal"
          style={{
            width: Dimensions.get("window").width * 0.5,
            marginVertical: 10,
            borderRadius: 5,
          }}
          onPress={() => {
            setDownloadReport(!downloadReport);
            setDataDownload({
              from: "",
              to: "",
              type: "",
            });
          }}>
          {downloadReport ? <>Batal</> : <>Unduh laporan</>}
        </Button>
      </View>
      {downloadReport ? (
        <>
          <View style={styles.cardView}>
            {/* tipe */}
            <Text style={{ marginBottom: 10 }}>Pilih Tipe</Text>
            <List.Section
              style={{
                width: screenWidth * 0.5,
                borderRadius: 10,
              }}>
              <List.Accordion
                title={
                  dataDownload.type === "in"
                    ? `Barang Masuk`
                    : dataDownload.type === "out"
                    ? `Barang Keluar`
                    : dataDownload.type === "all"
                    ? `Semua`
                    : `Pilih Tipe`
                }
                expanded={expanded}
                onPress={() => setExpanded(!expanded)}>
                <List.Item
                  title="Barang Masuk"
                  onPress={() => {
                    setDataDownload({
                      ...dataDownload,
                      type: "in",
                    });
                    setExpanded(!expanded);
                  }}
                  style={{
                    borderRadius: 10,
                  }}
                />
                <List.Item
                  title="Barang Keluar"
                  onPress={() => {
                    setDataDownload({
                      ...dataDownload,
                      type: "out",
                    });
                    setExpanded(false);
                  }}
                  style={{
                    borderRadius: 10,
                  }}
                />
                <List.Item
                  title="Semua"
                  onPress={() => {
                    setDataDownload({
                      ...dataDownload,
                      type: "all",
                    });
                    setExpanded(false);
                  }}
                  style={{
                    borderRadius: 10,
                  }}
                />
              </List.Accordion>
            </List.Section>

            {/* tanggal */}
            <Text style={{ marginVertical: 10 }}>Pilih Tanggal</Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}>
              {/* mulai */}
              <Button
                buttonColor="#5689c0"
                style={{
                  width: 150,
                  height: 40,
                  borderRadius: 10,
                }}
                textColor="white"
                mode="elevated"
                onPress={showStartDatePicker}>
                {dataDownload.from === "" ? (
                  <>Mulai</>
                ) : (
                  <>{dataDownload.from}</>
                )}
              </Button>
              <Text style={{ fontSize: 30 }}>-</Text>
              {/* berakhir */}
              <Button
                buttonColor="#5689c0"
                style={{
                  width: 150,
                  height: 40,
                  borderRadius: 10,
                }}
                textColor="white"
                mode="elevated"
                onPress={showEndDatePicker}>
                {dataDownload.to === "" ? (
                  <>Berakhir</>
                ) : (
                  <>{dataDownload.to}</>
                )}
              </Button>
            </View>

            {/* download button */}
            <Button
              buttonColor="#5689c0"
              textColor="white"
              mode="elevated"
              style={{ marginTop: screenHeight * 0.15, borderRadius: 10 }}
              disabled={
                dataDownload.to === "" ||
                dataDownload.from === "" ||
                dataDownload.type === ""
                  ? true
                  : false
              }
              onPress={async () => {
                exportToExcel();
              }}>
              Unduh Laporan
            </Button>
          </View>
        </>
      ) : (
        <>
          {isLoading ? (
            <>
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
            </>
          ) : (
            <ScrollView horizontal>
              <DataTable>
                <DataTable.Header style={{}}>
                  {headers.map((header, index) => (
                    <DataTable.Title
                      key={header}
                      onPress={() => handleSort(header)}
                      sortDirection={
                        sortConfig.column === header ? sortConfig.direction : ""
                      }
                      style={{ width: cellWidths[index] }}
                      numberOfLines={1}>
                      {header}
                    </DataTable.Title>
                  ))}
                </DataTable.Header>

                {sortedData?.slice(from, to).map((rowData, rowIndex) => (
                  <DataTable.Row key={rowData.id}>
                    <DataTable.Cell style={{ width: cellWidths[0] }}>
                      {from + rowIndex + 1} {/* Calculate the actual index */}
                    </DataTable.Cell>
                    <DataTable.Cell style={{ width: cellWidths[1] }}>
                      {rowData.name}
                    </DataTable.Cell>
                    <DataTable.Cell style={{ width: cellWidths[2] }}>
                      {rowData.Tipe}
                    </DataTable.Cell>
                    <DataTable.Cell style={{ width: cellWidths[3] }}>
                      {rowData.qty}
                    </DataTable.Cell>
                    <DataTable.Cell style={{ width: cellWidths[4] }}>
                      {moment(rowData.date, "DD-MM-YYYY").format("DD/MM/YYYY")}
                    </DataTable.Cell>
                    <DataTable.Cell style={{ width: cellWidths[5] }}>
                      {rowData.person}
                    </DataTable.Cell>
                    <DataTable.Cell style={{ width: cellWidths[6] }}>
                      {rowData.nota}
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}

                <DataTable.Pagination
                  page={page}
                  numberOfPages={Math.ceil(sortedData?.length / itemsPerPage)}
                  onPageChange={(page) => setPage(page)}
                  label={`${from + 1}-${to} of ${sortedData?.length}`}
                  itemsPerPage={itemsPerPage}
                  setItemsPerPage={setItemsPerPage}
                  style={{
                    alignContent: "center",
                    justifyContent: "flex-start",
                  }}
                />
              </DataTable>
            </ScrollView>
          )}
        </>
      )}
      <DateTimePickerModal
        isVisible={isStartDatePickerVisible}
        mode="date"
        onConfirm={(date) => {
          setDataDownload({
            ...dataDownload,
            from: moment(date).format("DD-MM-YYYY"),
          });
          hideDatePicker();
        }}
        onCancel={hideDatePicker}
      />
      <DateTimePickerModal
        isVisible={isEndDatePickerVisible}
        mode="date"
        onConfirm={(date) => {
          setDataDownload({
            ...dataDownload,
            to: moment(date).format("DD-MM-YYYY"),
          });
          hideDatePicker();
        }}
        onCancel={hideDatePicker}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    height: "10%",
    paddingLeft: 15,
    paddingTop: 10,
    width: deviceWidth,
  },
  textTitle: {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    padding: 16,
    color: "white",
  },
  textTitle1: {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    padding: 16,
    color: "white",
  },
  cardView: {
    width: deviceWidth - 32,
    height: deviceHeight - 500,
    borderRadius: 10,

    paddingHorizontal: 15,
    paddingVertical: 25,
    marginLeft: 5,
    marginRight: 5,
    backgroundColor: "white",
  },
});
