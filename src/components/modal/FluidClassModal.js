import React, { useState } from 'react';
import { Pressable, Text, StyleSheet, View, Modal, ScrollView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const FluidClassModal = ({ visible, onClose, onSelect }) => {
  const [selectedClass, setSelectedClass] = useState(null);

  const handleSelectClass = (className) => {
    setSelectedClass(className);
    onSelect(className);
    onClose();
  };

  return (
    <Modal visible={visible} onRequestClose={onClose} transparent animationType="slide">
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <AntDesign name="closecircle" size={28} color="red" />
          </Pressable>
          <Text style={styles.title}>Classe de Fluídos</Text>
          <ScrollView>
            <Pressable
              style={[
                styles.itemContainer,
                selectedClass === 'A' && styles.fluidButtonPressable,
              ]}
              onPress={() => handleSelectClass('A')}
            >
              <Text>Classe de Fluído A</Text>
              <Text>- Fluidos Inflamáveis.</Text>
              <Text>- Fluidos Combustíveis com Temperatura Igual ou Superior a 200°C.</Text>
              <Text>- Fluidos Tóxicos com Limite de Tolerância Igual ou Inferior a 20 ppm.</Text>
              <Text>- Hidrogênio.</Text>
              <Text>- Acetileno</Text>
            </Pressable>

            <Pressable
              style={[
                styles.itemContainer,
                selectedClass === 'B' && styles.fluidButtonPressable,
              ]}
              onPress={() => handleSelectClass('B')}
            >
              <Text>Classe de Fluído B</Text>
              <Text>- Fluidos combustíveis com temperatura inferior a 200°C.</Text>
              <Text>- Fluidos tóxicos com limite de tolerância superior a 20 ppm.</Text>
            </Pressable>

            <Pressable
              style={[
                styles.itemContainer,
                selectedClass === 'C' && styles.fluidButtonPressable,
              ]}
              onPress={() => handleSelectClass('C')}
            >
              <Text>Classe de Fluído C</Text>
              <Text>- Vapor d'água.</Text>
              <Text>- Gases asfixiantes simples</Text>
              <Text>- Ar comprimido.</Text>
            </Pressable>

            <Pressable
              style={[
                styles.itemContainer,
                selectedClass === 'D' && styles.fluidButtonPressable,
              ]}
              onPress={() => handleSelectClass('D')}
            >
              <Text>Classe de Fluído D</Text>
              <Text>- Outros fluidos sem classificação específica.</Text>
            </Pressable>
          </ScrollView>
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
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  itemContainer: {
    width: "100%",
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  fluidButtonPressable: {
    backgroundColor: '#e0f7fa',
  },
});

export default FluidClassModal;
