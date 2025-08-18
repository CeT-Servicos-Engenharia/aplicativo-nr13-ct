import React, { useState, useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View, Alert, Modal, TouchableOpacity } from 'react-native';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { db } from "../../database/firebaseConfig";
import { collection, query, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore'; // Importando as funções necessárias
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';

const EngenieersPage = () => {
  const [engenieers, setEngenieers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEngenieer, setSelectedEngenieer] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigation = useNavigation();

  // Função para carregar os engenheiros
  const loadEngenieers = async () => {
    try {
      const clientsCollection = collection(db, "engenieer");
      const clientsQuery = query(clientsCollection, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(clientsQuery);
      const EngenieersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(EngenieersList); // Verifique o que está sendo retornado
      setEngenieers(EngenieersList);
    } catch (error) {
      console.error("Erro ao carregar engenheiros: ", error);
      Alert.alert("Erro", "Não foi possível carregar a lista de engenheiros.");
    }
  };

  // Carregar clientes ao montar o componente
  useEffect(() => {
    loadEngenieers();
  }, []);

  // Filtrar engenheiros com base na pesquisa
  const filteredEngenieers = searchQuery
    ? engenieers.filter(engenieer => {
      const searchLower = searchQuery.toLowerCase();
      return (
        engenieer.name.toLowerCase().includes(searchLower) ||
        engenieer.cnpj.toLowerCase().includes(searchLower)
      );
    })
    : engenieers;

  const openModal = (engenieer) => {
    setSelectedEngenieer(engenieer);
    setIsModalVisible(true);
  };

  // Função para fechar o modal
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedEngenieer(null);
  };

  const handleRegisterEngenieers = () => {
    navigation.navigate("Cadastro de Engenheiro");
  }

  const handleEditEngenieer = () => {
    navigation.navigate("Cadastro de Engenheiro", { engenieer: selectedEngenieer })
    closeModal();
  };

  const handleDeleteEngenieer = async () => {
    if (!selectedEngenieer) {
      Alert.alert("Erro", "Nenhum engenheiro selecionado.");
      return;
    }

    Alert.alert(
      "Excluir Engenheiro",
      `Tem certeza que deseja excluir o engenheiro: ${selectedEngenieer.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar", onPress: async () => {
            try {
              // Excluir o cliente no Firebase
              const engenieerRef = doc(db, "engenieer", selectedEngenieer.id); // Referência ao cliente
              await deleteDoc(engenieerRef); // Excluindo o documento
              console.log(`Engenheiro ${selectedEngenieer.name} excluído com sucesso.`);
              Alert.alert("Sucesso", `Engenheiro ${selectedEngenieer.name} excluído com sucesso.`);

              // Fechar o modal e recarregar a lista de clientes
              closeModal();
              loadEngenieers(); // Atualiza a lista de clientes após a exclusão
            } catch (error) {
              console.error("Erro ao excluir engenheiro: ", error);
              Alert.alert("Erro", "Não foi possível excluir o engenheiro.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Engenheiros cadastrados</Text>

      <View style={styles.textInputModalSearch}>
        <FontAwesome
          name="search"
          size={24}
          color="gray"
          style={{ paddingRight: 10 }}
        />
        <TextInput
          placeholder="Procurar"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ flex: 1 }} />
      </View>

      <TouchableOpacity style={styles.buttonRegister} onPress={handleRegisterEngenieers}>
        <Text style={styles.modalButtonText}>Cadastrar Engenheiro</Text>
        <AntDesign name='plus' size={24} color="#fff"/>
      </TouchableOpacity>

      {filteredEngenieers.length > 0 ? (
        <FlatList
          data={filteredEngenieers}
          keyExtractor={(item) => item.id} // Certifique-se de que 'id' é realmente o ID do cliente
          renderItem={({ item }) => (
            <Pressable
              style={styles.lineClientsInOpen}
              onPress={() => { openModal(item) }}
            >
              <Text>
                {item.name} - {item.cnpj}
              </Text>
            </Pressable>
          )}
        />
      ) : (
        <Text style={styles.noClientsText}>Nenhum engenheiro cadastrado.</Text>
      )}

      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Opções para: {selectedEngenieer?.name}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleEditEngenieer}>
              <Text style={styles.modalButtonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonDelete} onPress={handleDeleteEngenieer}>
              <Text style={styles.modalButtonTextDelete}>Excluir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.modalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  textInputModalSearch: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 5,
  },
  lineClientsInOpen: {
    backgroundColor: "#7dd3fc",
    width: "100%",
    padding: 20,
    marginVertical: 5,
    borderRadius: 10,
  },
  noClientsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#999",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalButton: {
    padding: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
  },
  modalButtonDelete: {
    padding: 10,
    backgroundColor: "#dc2626",
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
  },
  modalButtonTextDelete: {
    color: "white",
    fontSize: 16,
  },
  buttonRegister: {
    padding: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "space-evenly",
    flexDirection: "row"
  },
});

export default EngenieersPage;
