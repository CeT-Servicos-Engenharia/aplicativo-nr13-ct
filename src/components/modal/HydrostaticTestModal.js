import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Image } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import AddImageInProjectModal from './AddImageInProjectModal';

const HydrostaticTestModal = ({ visible, onClose }) => {
  const [images, setImages] = useState([]);
  const [isAddImageModalVisible, setIsAddImageModalVisible] = useState(false);

  const handleImagePicked = (imageUri) => {
    setImages([...images, imageUri]);
    closeAddImageModal();
  };

  const handleCameraOpen = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.uri]);
    }
  };

  const openAddImageModal = () => {
    setIsAddImageModalVisible(true);
  };

  const closeAddImageModal = () => {
    setIsAddImageModalVisible(false);
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <AntDesign name="closecircle" size={28} color="red" />
          </Pressable>
          <Text style={styles.title}>Dispositivos</Text>

          <View style={{ height: 120 }}>
            <ScrollView horizontal={true} style={styles.imageRow}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageBox}>
                  <Image source={{ uri: image }} style={styles.image} />
                </View>
              ))}
              <Pressable onPress={openAddImageModal} style={styles.addImageBox}>
                <Feather name="image" size={24} color="gray" />
                <Text style={styles.imageText}>Adicionar Imagem</Text>
              </Pressable>
            </ScrollView>
          </View>

          <ScrollView style={{ width: '95%' }}>
            {/* Campos de texto */}
            <TextInput style={styles.textAreas} placeholder='Tipo de dispositivo' />
            <TextInput style={styles.textAreas} placeholder='Descrição' />
            <TextInput style={styles.textAreas} placeholder='Identificação' />
            <TextInput style={styles.textAreas} placeholder='Fabricante' />
            <TextInput style={styles.textAreas} placeholder='Diâmetro' />
            <TextInput style={styles.textAreas} placeholder='Escala' />
            <TextInput style={styles.textAreas} placeholder='Precisão' />
            <TextInput style={styles.textAreas} placeholder='Número de certificação' />
            <TextInput style={styles.textAreas} placeholder='Data de calibração' />
            <TextInput style={styles.textAreas} placeholder='Validade da calibração' />
          </ScrollView>
          <Pressable style={styles.registerTampoInferior}>
            <Text style={styles.registerTampoInferiorText}>Registrar Dispositivo</Text>
            <AntDesign name="plus" size={24} color="white" />
          </Pressable>
        </View>
      </View>

      {/* Modal de Adicionar Imagem */}
      <AddImageInProjectModal
        visible={isAddImageModalVisible}
        onClose={closeAddImageModal}
        onImagePicked={handleImagePicked}
        onCameraOpen={handleCameraOpen}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  textAreas: {
    borderColor: 'gray',
    borderBottomWidth: 1,
    marginBottom: 5,
    paddingVertical: 10,
    borderRadius: 5,
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold'
  },
  registerTampoInferior: {
    backgroundColor: '#1d4ed8',
    width: '90%',
    margin: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  registerTampoInferiorText: {
    color: '#fff'
  },
  imageRow: {
    flexDirection: 'row',
  },
  imageBox: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    marginRight: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  addImageBox: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: 'gray',
    marginRight: 10,
  },
  imageText: {
    marginTop: 5,
    color: 'gray',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default HydrostaticTestModal;
