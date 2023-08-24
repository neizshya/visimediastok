import React, { useEffect, useState } from "react";
import Icon from "react-native-vector-icons/FontAwesome5";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  StatusBar,
} from "react-native";

const colors = {
  primary: "#5689c0",
  secondary: "#75e2ff",
  caption: "#244d61",
  caption2: "#ffffff",
};

const TextInputKeren = (props) => {
  return (
    <View>
      <View
        style={{
          backgroundColor: "#ffffff",
          flexDirection: "row",
          marginHorizontal: 20,
          marginTop: 16,
        }}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#75e2ff",
            width: 50,

            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
            elevation: 5,
          }}>
          <Icon name={props.icon} size={30} color="#900"></Icon>
        </View>
        <TextInput
          value={props.state}
          style={{
            fontSize: 16,
            backgroundColor: "#75e2ff",
            borderBottomRightRadius: 10,
            borderTopRightRadius: 10,
            flex: 1,
            paddingVertical: 12,
            elevation: 5,
            paddingLeft: 10,
          }}
          placeholder={props.placeholder}
          onChangeText={props.set}
          secureTextEntry={props.isPassword}
        />
      </View>
    </View>
  );
};

export default TextInputKeren;
