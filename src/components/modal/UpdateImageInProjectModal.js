import React from 'react';
import { View, Modal, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

const UpdateImageInProjectModal = ({ visible, onClose, onImagePicked, onCameraOpen, onImageSelected, onDeleteImage }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Atualizar Imagem</Text>
          <TouchableOpacity style={styles.optionButton} onPress={onImagePicked}>
            <Feather name="image" size={24} color="gray" />
            <Text style={styles.optionText}>Substituir Imagem</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={onDeleteImage}>
            <Feather name="trash-2" size={24} color="red" />
            <Text style={styles.optionText}>Exlcluir Imagem</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};


const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
  },
  closeButtonText: {
    color: 'red',
    fontSize: 16,
  },
});

export default UpdateImageInProjectModal;
