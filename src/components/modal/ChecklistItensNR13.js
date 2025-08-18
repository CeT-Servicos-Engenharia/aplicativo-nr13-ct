import React, { useState } from 'react';
import { View, Modal, Button, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import checklistItemsNR13 from '../checklistitensnr13';

const ChecklistItensNR13 = ({ isOpen, onClose, selectedItems, onSelectItem }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredItems = Array.isArray(checklistItemsNR13)
    ? checklistItemsNR13.filter((item) =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  : [];

  const handleSelectItem = (item) => {
    // Verifica se o item já foi selecionado
    const isSelected = selectedItems.some(selectedItem => selectedItem.id === item.id);

    if (isSelected) {
      // Se já estiver selecionado, remove-o da lista de selecionados
      setSelectedItems(selectedItems.filter(selectedItem => selectedItem.id !== item.id));
    } else {
      // Se não estiver selecionado, adiciona-o à lista
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleSave = () => {
    const selectedCount = Object.keys(selectedItems).length;
    console.log(`Total de itens selecionados: ${selectedCount}`);
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      onRequestClose={onClose}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.containerModal}>
        <View style={styles.contentModal}>
          <Text style={styles.title}>Recomendações da norma</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          <ScrollView style={styles.scrollView}>
            {filteredItems.map((item) => {
              const isSelected = selectedItems.some(selectedItem => selectedItem.id === item.id);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => onSelectItem(item)}
                  style={[styles.itemContainer, isSelected && styles.selectedItem]}
                >
                  <Text>{item.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Button onPress={handleSave} title="Salvar" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  containerModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contentModal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  searchInput: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  scrollView: {
    height: 400,
    width: '100%',
  },
  item: {
    paddingVertical: 10,
  },
  itemContainer: {
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  selectedItem: {
    backgroundColor: '#e0f7fa',
  },
});

export default ChecklistItensNR13;
