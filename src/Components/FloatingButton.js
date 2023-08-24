import { SimpleLineIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Animated } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import IconMaterial from "react-native-vector-icons/MaterialIcons";

const FloatingButton = ({ onpressManual, onPressQr }) => {
  const [icon_1] = useState(new Animated.Value(30));
  const [icon_2] = useState(new Animated.Value(30));

  const [pop, setPop] = useState(false);

  const popIn = () => {
    setPop(true);
    Animated.timing(icon_1, {
      toValue: 130,
      duration: 500,
      useNativeDriver: false,
    }).start();
    Animated.timing(icon_2, {
      toValue: 110,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const popOut = () => {
    setPop(false);
    Animated.timing(icon_1, {
      toValue: 30,
      duration: 500,
      useNativeDriver: false,
    }).start();
    Animated.timing(icon_2, {
      toValue: 30,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View
      style={{
        flex: 1,
      }}>
      <TouchableOpacity onPress={onpressManual}>
        <Animated.View style={[styles.circle, { bottom: icon_1 }]}>
          <SimpleLineIcons name="drawer" size={20} color="#FFFF" />
        </Animated.View>
      </TouchableOpacity>
      <TouchableOpacity onPress={onPressQr}>
        <Animated.View
          style={[styles.circle, { bottom: icon_2, right: icon_2 }]}>
          <Icon name="qrcode" size={25} color="#FFFF" />
        </Animated.View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.circle}
        onPress={() => {
          pop === false ? popIn() : popOut();
        }}>
        <Icon name="plus" size={25} color="#FFFF" />
      </TouchableOpacity>
    </View>
  );
};

export default FloatingButton;

const styles = StyleSheet.create({
  circle: {
    backgroundColor: "#5689c0",
    width: 60,
    height: 60,
    position: "absolute",
    bottom: 30,
    right: 30,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
