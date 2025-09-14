import React from "react";
import { TouchableOpacity, Text } from "react-native";

const CustomBackButton = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={{ paddingHorizontal: 10 }}>
    <Text style={{ color: "#F8FAFC", fontSize: 16 }}>← Back</Text>
  </TouchableOpacity>
);

export default CustomBackButton;
