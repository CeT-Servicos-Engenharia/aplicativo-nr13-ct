import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import Navbar from './Navbar';
import LateralBar from './LateralBar';

const AppLayout = ({ children }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Navbar onMenuPress={() => setMenuVisible(true)} />
      <View style={styles.content}>{children}</View>

      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <View style={styles.menuContainer}>
          <LateralBar isVisible={menuVisible} onClose={()=> setMenuVisible(false)} />
        </View> 
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // Fundo escuro ao abrir o menu
  },
  menuContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "75%",
    height: "100%",
  },
});

export default AppLayout;
