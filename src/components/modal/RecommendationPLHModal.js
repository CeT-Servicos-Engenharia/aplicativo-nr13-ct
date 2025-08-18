import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { db } from "../../../database/firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

const RecommendationPLHModal = ({
  isOpen,
  onClose,
  selectedItems = [],
  onSelectItem,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [newRecommendation, setNewRecommendation] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  const handleAddRecommendation = async () => {
    if (!newRecommendation) {
      Alert.alert("Erro", "Digite uma recomendação antes de adicionar.");
      return;
    }

    try {
      await addDoc(collection(db, "recommendationsPLH"), {
        text: newRecommendation,
        createdAt: new Date(),
      });

      Alert.alert("Sucesso", "Recomendação adicionada com sucesso!");
      setNewRecommendation("");
      fetchRecommendations();
    } catch (error) {
      Alert.alert("Erro", "Erro ao adicionar recomendação: " + error.message);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "recommendationsPLH"));
      const fetchedRecommendations = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecommendations(fetchedRecommendations);
    } catch (error) {
      Alert.alert("Erro", "Erro ao buscar recomendações: " + error.message);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecommendations();
    }
  }, [isOpen]);

  const filteredRecommendations = recommendations.filter((item) =>
    item.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <Text style={styles.title}>Recomendações do PLH</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />

          <View style={styles.containerNewRecommendation}>
            <TextInput
              style={styles.searchInput}
              placeholder="Nova recomendação"
              value={newRecommendation}
              onChangeText={setNewRecommendation}
            />
            <Pressable
              style={{ backgroundColor: '#1d4ed8', borderRadius: 10, width: '100%', paddingVertical: 10, alignItems: 'center' }}
              onPress={handleAddRecommendation}>
              <Text style={{ color: '#fff' }}>Adicionar recomendação</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.scrollView}>
            {filteredRecommendations.map((item) => {
              const isSelected = selectedItems.some(selectedItem => selectedItem.id === item.id);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => onSelectItem(item)}
                  style={[styles.itemContainer, isSelected && styles.selectedItem]}
                >
                  <Text>{item.text}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable style={styles.buttonSave} onPress={handleSave}>
            <Text
              style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}
            >
              Salvar
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};


const styles = StyleSheet.create({
  containerModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  contentModal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
  },
  searchInput: {
    width: "100%",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  scrollView: {
    height: 400,
    width: "100%",
  },
  itemContainer: {
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  selectedItem: {
    backgroundColor: "#e0f7fa",
  },
  buttonSave: {
    backgroundColor: "#1d4ed8",
    borderRadius: 10,
    padding: 10,
    marginTop: 15,
  },
  containerNewRecommendation: {
    backgroundColor: "#e0f7fa",
    alignItems: "center",
    padding: 5,
    borderRadius: 5,
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

export default RecommendationPLHModal;