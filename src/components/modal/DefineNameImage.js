import React, { useEffect, useState } from 'react'
import { Modal, View, Text, TextInput, Pressable, StyleSheet, Keyboard, Platform } from 'react-native'

const DefineNameImage = ({ visible, title, onSave, onClose }) => {
  const [tempTitle, setTempTitle] = useState(title);

  useEffect(() => {
    setTempTitle(title); // Sincroniza com o título recebido ao abrir o modal
  }, [title]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalBackground}>
        <View style={[styles.modalContainer, { height: "32%" }]}>
          <Text style={styles.title}>Definir Título</Text>
          <TextInput
            style={styles.textAreas}
            placeholder="Título da imagem"
            value={tempTitle}
            onChangeText={setTempTitle} // Atualiza o título temporariamente
          />
          <Pressable
            onPress={() => {
              onSave(tempTitle); // Atualiza o título final no pai
              onClose(); // Fecha o modal
            }}
            style={styles.registerButton}
          >
            <Text style={styles.registerButtonText}>Salvar</Text>
          </Pressable>
        </View>
      </View>
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
    height: '40%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  textAreas: {
    width: '100%',
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
  registerButton: {
    backgroundColor: '#1d4ed8',
    width: '100%',
    margin: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  registerButtonText: {
    color: '#fff'
  },
})

export default DefineNameImage