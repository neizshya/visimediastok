import React, { useContext, useEffect, useState } from "react";
import { View, Text, Dimensions, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Card } from "react-native-paper";
import { LineChart } from "react-native-chart-kit";
import { UserContext } from "../context/UserContext";
import { firestore } from "../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import moment from "moment";
import CardHome from "../src/Components/Card";
import FloatingButton from "../src/Components/FloatingButton";

const colors = {
  primary: "#5689c0",
  secondary: "#75e2ff",
  caption: "#244d61",
};

const chartConfig = {
  backgroundColor: "#1cc910",
  backgroundGradientFrom: "#5689c0",
  backgroundGradientTo: "#ffa726",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  propsForDots: {
    r: "1",
    strokeWidth: "2",
    stroke: "white",
  },
};

export default function Dashboard({ navigation }) {
  const { loggedInUserData } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsToday, setItemsToday] = useState({ in: [], out: [] });
  const [weekDayCounts, setWeekDayCounts] = useState({
    monday: { in: 0, out: 0 },
    tuesday: { in: 0, out: 0 },
    wednesday: { in: 0, out: 0 },
    thursday: { in: 0, out: 0 },
    friday: { in: 0, out: 0 },
  });

  const fetchAllItems = async () => {
    try {
      const itemsCollectionRef = collection(firestore, "items");
      const querySnapshot = await getDocs(itemsCollectionRef);

      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTotalItems(items.length);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching items data:", error);
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const itemsCollectionRef = collection(firestore, "history");
      const querySnapshot = await getDocs(itemsCollectionRef);

      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const today = new Date();
      const formattedDateToday = moment(today).format("DD-MM-YYYY");

      const filteredItems = items.filter((item) => {
        return item.date === formattedDateToday;
      });
      const dayOfWeek = today.getDay();
      const daysToSubtract = (dayOfWeek + 6) % 7;

      const lastMonday = new Date(today);
      lastMonday.setDate(today.getDate() - daysToSubtract);

      const lastFiveDaysWork = items.filter((item) => {
        const itemDate = moment(item.date, "DD-MM-YYYY").toDate();
        return itemDate >= lastMonday && itemDate <= today;
      });

      const inItemsFiveDaysWork = lastFiveDaysWork.filter(
        (item) => item.Tipe === "in"
      );
      const outItemsFiveDaysWork = lastFiveDaysWork.filter(
        (item) => item.Tipe === "out"
      );

      const inItemsToday = filteredItems.filter((item) => item.Tipe === "in");

      const outItemsToday = filteredItems.filter((item) => item.Tipe === "out");
      const weekdayCountsTemp = {
        monday: { in: 0, out: 0 },
        tuesday: { in: 0, out: 0 },
        wednesday: { in: 0, out: 0 },
        thursday: { in: 0, out: 0 },
        friday: { in: 0, out: 0 },
      };

      const daysOfWeek = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
      ];
      for (const day of daysOfWeek) {
        const itemsInDay = inItemsFiveDaysWork.filter(
          (item) =>
            moment(item.date, "DD-MM-YYYY").toDate().getDay() ===
            daysOfWeek.indexOf(day)
        );
        const itemsOutDay = outItemsFiveDaysWork.filter(
          (item) =>
            moment(item.date, "DD-MM-YYYY").toDate().getDay() ===
            daysOfWeek.indexOf(day)
        );
        weekdayCountsTemp[day].in = itemsInDay.length;
        weekdayCountsTemp[day].out = itemsOutDay.length;
      }
      setWeekDayCounts(weekdayCountsTemp);
      setItemsToday({ in: inItemsToday, out: outItemsToday });
      setIsLoadingHistory(false);
    } catch (error) {
      console.error(`Error fetching history data: ${error}`);
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchAllItems();
    fetchHistory();
  }, []);

  const data = {
    labels: [" Sen", " Sel", " Rab", " Kam", " Jum"],
    datasets: [
      {
        data: [
          weekDayCounts.monday?.in,
          weekDayCounts.tuesday?.in,
          weekDayCounts.wednesday?.in,
          weekDayCounts.thursday?.in,
          weekDayCounts.friday?.in,
        ],
        strokeWidth: 2,
        color: () => "#5689c0",
      },

      {
        data: [
          weekDayCounts.monday?.out,
          weekDayCounts.tuesday?.out,
          weekDayCounts.wednesday?.out,
          weekDayCounts.thursday?.out,
          weekDayCounts.friday?.out,
        ],
        strokeWidth: 2,
        color: () => "#ffa726",
      },
    ],
    legend: ["In", "Out"],
  };
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  return (
    <>
      <View style={{ paddingHorizontal: 20, height: screenHeight * 0.92 }}>
        <View>
          <StatusBar backgroundColor={"#5689c0"} barStyle={"dark-content"} />
          {/* greeting section */}
          <View style={{ marginTop: 10, marginBottom: 10 }}>
            <Text variant="headlineSmall">
              Halo, {loggedInUserData.userData.name}
            </Text>
            <Text variant="bodyLarge">Semoga harimu menyenangkan</Text>
          </View>
          {/* in and out section */}
          <View
            style={{ marginBottom: 10, flexDirection: "column", rowGap: 10 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                gap: 10,
              }}>
              <View style={{ width: screenWidth * 0.44 }}>
                {isLoadingHistory ? (
                  <ActivityIndicator
                    animating={true}
                    color="#5689c0"
                    size={"large"}
                  />
                ) : (
                  <CardHome
                    title={"Barang masuk hari ini"}
                    qty={itemsToday.in.length}
                  />
                )}
              </View>
              <View style={{ width: screenWidth * 0.44 }}>
                {isLoadingHistory ? (
                  <ActivityIndicator
                    animating={true}
                    color="#5689c0"
                    size={"large"}
                  />
                ) : (
                  <CardHome
                    title={"Barang keluar hari ini"}
                    qty={itemsToday.out.length}
                  />
                )}
              </View>
            </View>
            <View style={{ width: screenWidth * 0.9 }}>
              {isLoading ? (
                <ActivityIndicator
                  animating={true}
                  color="#5689c0"
                  size={"large"}
                />
              ) : (
                <CardHome
                  title={"Total barang yang tersedia"}
                  qty={totalItems}
                />
              )}
            </View>
          </View>
        </View>

        {/* chart section */}
        <View
          style={{
            width: screenWidth * 0.5,
            marginBottom: 15,
          }}>
          <Text variant="titleLarge">In & Out</Text>
          <Text variant="labelMedium">Selama 1 minggu terakhir</Text>
          {data.datasets[0].data.length === 0 &&
          data.datasets[1].data.length === 0 ? (
            <>
              <View
                style={{
                  height: screenHeight * 0.26,
                  width: screenWidth * 0.9,
                  marginVertical: 25,
                  borderRadius: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                <Text>Tidak ada data In dan Out dalam 1 minggu terakhir</Text>
              </View>
            </>
          ) : (
            <>
              {isLoadingHistory ? (
                <ActivityIndicator
                  animating={true}
                  color="#5689c0"
                  size={"large"}
                />
              ) : (
                <LineChart
                  data={data}
                  width={screenWidth * 0.9}
                  height={screenHeight * 0.26}
                  chartConfig={chartConfig}
                  bezier
                  style={{
                    marginVertical: 10,
                    borderRadius: 10,
                  }}
                />
              )}
            </>
          )}
        </View>
      </View>
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
  );
}
