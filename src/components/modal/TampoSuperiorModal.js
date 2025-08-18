import React, { useState, useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

const TampoSuperiorModal = ({ visible, onClose, onSave, initialData }) => {
  const [tampoData, setTampoData] = useState({
    tipo: '',
    raioCoroa: '',
    raioRebordeado: '',
    razao: '',
    anguloVertice: '',
    ladoPressao: '',
    diametroInterno: '',
    material: '',
    espessuraNominal: '',
    espessuraRequerida: '',
    sobreespessura: '',
    radiografia: '',
    eficienciaJunta: '',
  });

  useEffect(() => {
    if (initialData) {
      setTampoData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (field, value) => {
    setTampoData({ ...tampoData, [field]: value });
  };

  const handleSave = () => {
    console.log("Dados do tampo antes de salvar:", tampoData);

    // Validação básica (ajuste conforme necessário)
    if (!tampoData.tipo || !tampoData.material || !tampoData.diametroInterno) {
      alert('Por favor, preencha os campos obrigatórios: Tipo, Material e Diâmetro Interno.');
      return;
    }

    // Chama a função onSave passando os dados do tampo
    onSave(tampoData);

    // Fecha o modal
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
          <Text style={styles.title}>Tampo Superior</Text>
          <ScrollView style={{ width: '90%' }}>
            <TextInput
              style={styles.textAreas}
              placeholder='Tipo do tampo'
              value={tampoData.tipo}
              onChangeText={(text) => handleInputChange('tipo', text)}
            />
            <TextInput
              style={styles.textAreas}
              placeholder='Raio da Coroa(mm)'
              value={tampoData.raioCoroa}
              onChangeText={(text) => handleInputChange('raioCoroa', text)}
            />
            <TextInput
              style={styles.textAreas}
              placeholder='Raio do rebordeado(mm)'
              value={tampoData.raioRebordeado}
              onChangeText={(text) => handleInputChange('raioRebordeado', text)}
            />
            <TextInput
              style={styles.textAreas}
              placeholder='Razão(D/m²)'
              value={tampoData.razao}
              onChangeText={(text) => handleInputChange('razao', text)}
            />
            <TextInput
              style={styles.textAreas}
              placeholder='Semi-ângulo do vértice(º)'
              value={tampoData.anguloVertice}
              onChangeText={(text) => handleInputChange('anguloVertice', text)}
            />
            <TextInput
              style={styles.textAreas}
              placeholder='Lado da pressão'
              value={tampoData.ladoPressao}
              onChangeText={(text) => handleInputChange('ladoPressao', text)}
            />
            <TextInput
              style={styles.textAreas}
              placeholder='Diâmetro interno(mm)'
              value={tampoData.diametroInterno}
              onChangeText={(text) => handleInputChange('diametroInterno', text)}
            />
            <TextInput
              style={styles.textAreas}
              placeholder='Material'
              value={tampoData.material}
              onChangeText={(text) => handleInputChange('material', text)}
            />
            <TextInput
              style={styles.textAreas}
              placeholder='Espessura nominal(mm)'
              value={tampoData.espessuraNominal}
              onChangeText={(text) => handleInputChange('espessuraNominal', text)}
            />
            <TextInput
              style={styles.textAreas}
              placeholder='Espessura requerida(mm)'
              value={tampoData.espessuraRequerida}
              onChangeText={(text) => handleInputChange('espessuraRequerida', text)}
            />
            <TextInput
              style={styles.textAreas}
              placeholder='Sobreespessura(mm)'
              value={tampoData.sobreespessura}
              onChangeText={(text) => handleInputChange('sobreespessura', text)}
            />
            <TextInput
              style={styles.textAreas}
              placeholder='Radiografia'
              value={tampoData.radiografia}
              onChangeText={(text) => handleInputChange('radiografia', text)}
            />
            <TextInput
              style={styles.textAreas}
              placeholder='Eficiência da junta'
              value={tampoData.eficienciaJunta}
              onChangeText={(text) => handleInputChange('eficienciaJunta', text)}
            />
          </ScrollView>
          <Pressable style={styles.registerTampoSuperior} onPress={handleSave}>
            <Text style={styles.registerTampoSuperiorText}>Registrar Tampo Superior</Text>
            <AntDesign name="plus" size={24} color="white" />
          </Pressable>
        </View>
      </View>
    </Modal>
  )
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
  registerTampoSuperior: {
    backgroundColor: '#1d4ed8',
    width: '90%',
    margin: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  registerTampoSuperiorText: {
    color: '#fff'
  }
});

export default TampoSuperiorModal;
