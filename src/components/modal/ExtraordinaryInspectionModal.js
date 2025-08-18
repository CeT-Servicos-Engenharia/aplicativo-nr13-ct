import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const ExtraordinaryInspectionModal = ({ visible, onClose, selectedItems, onSelectItem }) => {
  const extraordinaryCases = [
    { id: 1, title: 'Problema operacional', description: 'Adequação de anormalidades apresentadas' },
    { id: 2, title: 'Alteração operacional', description: 'Adequação de parâmetros essenciais operacionais' },
    { id: 3, title: 'Alteração', description: 'Projeto de alteração' },
    { id: 4, title: 'Reparo', description: 'Projeto de reparo' },
    { id: 5, title: 'Reconstituição de prontuário', description: 'Reconstituição total ou parcial de prontuário' },
    { id: 6, title: 'Parado ou retorno de operação', description: 'Parada ou colocação de um vaso existente em operação' },
    { id: 7, title: 'Projeto de instalação geral', description: 'Identificação de todos os vasos da planta, NR-13 item 13.7' }
  ];

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.scrollView}>
            {extraordinaryCases.map((item) => {
              const isSelected = selectedItems.some(selectedItem => selectedItem.id === item.id);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => onSelectItem(item)}
                  style={[styles.itemContainer, isSelected && styles.selectedItem]}
                >
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable
            onPress={onClose}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>Salvar</Text>
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
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    padding: 16,
  },
  scrollView: {
    maxHeight: '95%',
  },
  itemContainer: {
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: '#f9f9f9', // Cor padrão de fundo
  },
  selectedItem: {
    backgroundColor: '#e0f7fa', // Azul claro para itens selecionados
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ExtraordinaryInspectionModal;
