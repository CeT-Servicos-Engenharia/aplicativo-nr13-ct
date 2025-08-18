import React, { useEffect, useState } from 'react'
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from '@react-navigation/native';
import { collection, deleteDoc, doc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../database/firebaseConfig';
import { AntDesign } from '@expo/vector-icons';

const InspectorsPage = () => {
  const [inspectors, setInspectors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInspector, setSelectedInspector] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigation = useNavigation();

  const loadInspectors = async () => {
    try {
      const inspectorsCollections = collection(db, "analyst");
      const inspectorsQuery = query(inspectorsCollections, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(inspectorsQuery);
      const InspectorsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInspectors(InspectorsList);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar a lista de inspetores.");
    }
  }

  useEffect(() => {
    loadInspectors();
  }, [])

  const filteredInspectors = searchQuery
    ? inspectors.filter(inspector => {
      const searchLower = searchQuery.toLowerCase();
      return (
        inspector.name.toLowerCase().includes(searchLower) ||
        inspector.cnpj.toLowerCase().includes(searchLower)
      )
    })
    : inspectors;

  const openModal = (inspector) => {
    setSelectedInspector(inspector);
    setIsModalVisible(true);
  };

  // Função para fechar o modal
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedInspector(null);
  };

  const handleRegisterInspectos = () => {
    navigation.navigate("Cadastro de Inspetor");
  }

  const handleEditInspector = () => {
    navigation.navigate("Cadastro de Inspetor", { inspector: selectedInspector })
    closeModal();
  };

  const handleDeleteInspector = async () => {
    if (!selectedInspector) {
      Alert.alert("Erro", "Nenhum inspetor selecionado.");
      return;
    }

    Alert.alert(
      "Excluir Inspetor",
      `Tem certeza que deseja excluir o inspetor: ${selectedInspector.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar", onPress: async () => {
            try {
              // Excluir o cliente no Firebase
              const inspectorRef = doc(db, "analyst", selectedInspector.id); // Referência ao cliente
              await deleteDoc(inspectorRef); // Excluindo o documento
              console.log(`Inspetor ${selectedInspector.name} excluído com sucesso.`);
              Alert.alert("Sucesso", `Inspetor ${selectedInspector.name} excluído com sucesso.`);

              // Fechar o modal e recarregar a lista de clientes
              closeModal();
              loadInspectors(); // Atualiza a lista de clientes após a exclusão
            } catch (error) {
              console.error("Erro ao excluir engenheiro: ", error);
              Alert.alert("Erro", "Não foi possível excluir o inspetor.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inspetor cadastrados</Text>

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

      <TouchableOpacity style={styles.buttonRegister} onPress={handleRegisterInspectos}>
        <Text style={styles.modalButtonText}>Cadastrar Inspetor</Text>
        <AntDesign name='plus' size={24} color="#fff"/>
      </TouchableOpacity>

      {filteredInspectors.length > 0 ? (
        <FlatList
          data={filteredInspectors}
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
        <Text style={styles.noClientsText}>Nenhum inspetor cadastrado.</Text>
      )}

      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Opções para: {selectedInspector?.name}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleEditInspector}>
              <Text style={styles.modalButtonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonDelete} onPress={handleDeleteInspector}>
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
})

export default InspectorsPage;