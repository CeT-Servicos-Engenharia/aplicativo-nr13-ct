import React from "react";
import { Image, TouchableOpacity, View, StyleSheet, StatusBar, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const statusBarHeight = Platform.OS === 'web' ? 0 : (StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 64);

const Navbar = ({ onMenuPress }) => {
  return (
    <View style={styles.navbar}>
      <TouchableOpacity 
        onPress={onMenuPress} 
        style={styles.menuButton}
        {...Platform.select({
          web: {
            cursor: 'pointer',
          },
        })}
      >
        <Ionicons name="menu" size={32} color="#fff" />
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Image source={require("../../assets/favicon.png")} style={styles.logo} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    height: 100,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1d4ed8",
    paddingHorizontal: 15,
    paddingTop: statusBarHeight,
    justifyContent: "space-between",
  },
  menuButton: {
    position: "absolute",
    left: 15,
    paddingTop: Platform.OS === 'web' ? 0 : statusBarHeight,
    zIndex: 1000
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
  },
  logo: {
    width: Platform.OS === "web" ? 100 : 70,
    height: 100,
    resizeMode: "contain",
    marginBottom: Platform.OS === "web" ? 0 : 0,
    marginRight: "auto",
    marginLeft: "auto",
  },
});

export default Navbar;
