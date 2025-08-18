import React from 'react';
import { Pressable, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';

const LateralBar = ({ isVisible, onClose }) => {
  if (!isVisible) return null;
  const navigation = useNavigation();

  return (
    <View style={styles.overlay}>
      <View style={styles.sidebar}>
        <Text style={styles.header}>Menu</Text>
        <Pressable style={styles.button} onPress={() => {
          navigation.navigate("Clientes")
          onClose();
        }}>
          <Text style={styles.buttonText}>Clientes</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          navigation.navigate("Engenheiros")
          onClose();
        }}>
          <Text style={styles.buttonText}>Engenheiros</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => {
          navigation.navigate("Inspetores")
          onClose();
        }}>
          <Text style={styles.buttonText}>Inspetores</Text>
        </Pressable>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={32} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1000,
  },
  sidebar: {
    width: Platform.OS === 'web' ? '300px' : '100%',
    height: "100%",
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1001,
    ...Platform.select({
      web: {
        boxShadow: '2px 0 5px rgba(0,0,0,0.2)',
      },
    }),
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
    marginTop: Platform.OS === 'web' ? 20 : 0,
  },
  button: {
    backgroundColor: "#3b82f6",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
    width: "100%",
    ...Platform.select({
      web: {
        cursor: 'pointer',
        ':hover': {
          backgroundColor: '#2563eb',
        },
      },
    }),
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
});

export default LateralBar;
