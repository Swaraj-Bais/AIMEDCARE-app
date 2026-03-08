import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

export default function IndexScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.teal} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.offWhite },
});
