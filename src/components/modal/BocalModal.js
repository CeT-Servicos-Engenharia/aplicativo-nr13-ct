import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

const BocalModal = ({ visible, onClose, onSave, selectedIndex, content }) => {
  const [bocalData, setBocalData] = useState(content || {});

  useEffect(() => {
    if (content) {
      setBocalData(content);
    } else {
      setBocalData({
        descrption: "",
        position: "",
        nps: "",
        typeConnection: "",
        materialConnection: "",
        neckThickness: "",
        neckMaterial: "",
        reforceTickness: "",
        materialTickness: "",
      });
    }
  }, [content]); 

  const handleFieldChange = (field, value) => {
    setBocalData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
    console.log(`Campo atualizado - ${field}:`, value);
  };


  const handleSave = () => {
    console.log("Dados do bocal antes de salvar:", bocalData);
    onSave(bocalData);
    setBocalData({
      descrption: "",
      position: "",
      nps: "",
      typeConnection: "",
      materialConnection: "",
      neckThickness: "",
      neckMaterial: "",
      reforceTickness: "",
      materialTickness: "",
    });
    onClose();
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
          <Text style={styles.title}>Bocais</Text>
          <ScrollView style={{ width: '90%' }}>
            <TextInput
              style={styles.textAreas}
              placeholder='Descrição'
              value={bocalData.descrption}
              onChangeText={(value) => handleFieldChange('descrption', value)}
            />
            <TextInput
              style={styles.textAreas}
              placeholder='Posição'
              value={bocalData.position}
              onChangeText={(value) => handleFieldChange('position', value)}
            />
            <TextInput
              style={styles.textAreas}
              placeholder='NPS'
              value={bocalData.nps}
              onChangeText={(value) => handleFieldChange('nps', value)}
            />
            <TextInput
              style={styles.textAreas}
              placeholder='Tipo de conexão'
              value={bocalData.typeConnection}
              onChangeText={(value) => handleFieldChange('typeConnection', value)}
            />
            <TextInput
              style={styles.textAreas}
              placeholder='Conexão material'
              value={bocalData.materialConnection}
              onChangeText={(value) => handleFieldChange('materialConnection', value)}
            />
            <TextInput
              style={styles.textAreas}
              placeholder='Espessura do pescoço'
              value={bocalData.neckThickness}
              onChangeText={(value) => handleFieldChange('neckThickness', value)}
            />
            <TextInput
              style={styles.textAreas}
              placeholder='Material do pescoço'
              value={bocalData.neckMaterial}
              onChangeText={(value) => handleFieldChange('neckMaterial', value)}
            />
            <TextInput
              style={styles.textAreas}
              placeholder='Espessura do reforço'
              value={bocalData.reforceTickness}
              onChangeText={(value) => handleFieldChange('reforceTickness', value)}
            />
            <TextInput
              style={styles.textAreas}
              placeholder='Material do reforço'
              value={bocalData.materialTickness}
              onChangeText={(value) => handleFieldChange('materialTickness', value)}
            />
          </ScrollView>
          <Pressable style={styles.registerBocal} onPress={handleSave}>
            <Text style={styles.registerBocalText}>{selectedIndex !== null ? "Atualizar Bocal" : "Registrar Bocal"}</Text>
            <AntDesign name="plus" size={24} color="white" />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}


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
  closeButtonText: {
    color: '#fff',
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
  registerBocal: {
    backgroundColor: '#1d4ed8',
    width: '90%',
    margin: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  registerBocalText: {
    color: '#fff'
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default BocalModal;
