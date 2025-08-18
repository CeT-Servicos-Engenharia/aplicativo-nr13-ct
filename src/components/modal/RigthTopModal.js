import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

const RigthTopModal = ({ visible, onClose, onChange }) => (
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
        <Text style={styles.title}>Tampo Direito</Text>
        <ScrollView style={{ width: '95%' }}>
          <TextInput
            style={styles.textAreas}
            placeholder='Tipo do tampo'
            onChangeText={(text) => onChange('tipo', text)}
          />
          <TextInput
            style={styles.textAreas}
            placeholder='Raio da Coroa(mm)'
            onChangeText={(text) => onChange('raioCoroa', text)}
          />
          <TextInput
            style={styles.textAreas}
            placeholder='Raio do rebordeado(mm)'
            onChangeText={(text) => onChange('raioRebordeado', text)}
          />
          <TextInput
            style={styles.textAreas}
            placeholder='Razão(D/2h)'
            onChangeText={(text) => onChange('razao', text)}
          />
          <TextInput
            style={styles.textAreas}
            placeholder='Semi-ângulo do vértice(º)'
            onChangeText={(text) => onChange('anguloVertice', text)}
          />
          <TextInput
            style={styles.textAreas}
            placeholder='Lado da pressão'
            onChangeText={(text) => onChange('ladoPressao', text)}
          />
          <TextInput
            style={styles.textAreas}
            placeholder='Diâmetro interno(mm)'
            onChangeText={(text) => onChange('diametroInterno', text)}
          />
          <TextInput
            style={styles.textAreas}
            placeholder='Material'
            onChangeText={(text) => onChange('material', text)}
          />
          <TextInput
            style={styles.textAreas}
            placeholder='Espessura nominal(mm)'
            onChangeText={(text) => onChange('espessuraNominal', text)}
          />
          <TextInput
            style={styles.textAreas}
            placeholder='Espessura requerida(mm)'
            onChangeText={(text) => onChange('espessuraRequerida', text)}
          />
          <TextInput
            style={styles.textAreas}
            placeholder='PMTA calculada'
            onChangeText={(text) => onChange('PMTAcalculada', text)}
          />
          <TextInput
            style={styles.textAreas}
            placeholder='Sobreespessura(mm)'
            onChangeText={(text) => onChange('sobreespessura', text)}
          />
          <TextInput
            style={styles.textAreas}
            placeholder='Alívio de tensões'
            onChangeText={(text) => onChange('alivioTensoes', text)}
          />
          <TextInput
            style={styles.textAreas}
            placeholder='Radiografia'
            onChangeText={(text) => onChange('radiografia', text)}
          />
          <TextInput
            style={styles.textAreas}
            placeholder='Eficiência da junta'
            onChangeText={(text) => onChange('eficienciaJunta', text)}
          />
        </ScrollView>
        <Pressable style={styles.registerTampoInferior} onPress={onClose}>
          <Text style={styles.registerTampoInferiorText}>Registrar Tampo Direito</Text>
          <AntDesign name="plus" size={24} color="white" />
        </Pressable>
      </View>
    </View>
  </Modal>
);

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
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
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
  }
});

export default RigthTopModal;
