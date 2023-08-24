import React, { useEffect, useState } from "react";
import Icon from "react-native-vector-icons/FontAwesome5";
import { ActivityIndicator } from "react-native";
import {
  View,
  Text,
  Image,
  // TextInput,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from "react-native";

const colors = {
  primary: "#5689c0",
  secondary: "#75e2ff",
  caption: "#244d61",
  caption2: "#ffffff",
};
const onPressHandle = () => {};
const LoginButtons = (props) => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: `${props.disabled ? "gray" : "#5689c0"}`,
        paddingVertical: 12,
        marginTop: 32,
        borderRadius: 10,
        marginHorizontal: 20,
        elevation: 15,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
      disabled={props.disabled ? true : false}
      onPress={props.onPressHandle}>
      {props.loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <Text
            style={{
              textAlign: "center",
              fontSize: 18,
              fontWeight: "bold",
              color: colors.caption2,
              marginRight: 10,
            }}>
            {props.text}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default LoginButtons;
