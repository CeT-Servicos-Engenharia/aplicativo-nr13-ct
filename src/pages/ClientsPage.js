import React, { useState, useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View, Alert, Modal, TouchableOpacity, Platform } from 'react-native';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { db } from "../../database/firebaseConfig";
import { collection, query, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore'; // Importando as funções necessárias
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigation = useNavigation();

  // Função para carregar os clientes
  const loadClients = async () => {
    try {
      const clientsCollection = collection(db, "clients");
      const clientsQuery = query(clientsCollection, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(clientsQuery);
      const clientsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(clientsList); // Verifique o que está sendo retornado
      setClients(clientsList);
    } catch (error) {
      console.error("Erro ao carregar clientes: ", error);
      Alert.alert("Erro", "Não foi possível carregar a lista de clientes.");
    }
  };

  // Carregar clientes ao montar o componente
  useEffect(() => {
    loadClients();
  }, []);

  // Filtrar clientes com base na pesquisa
  const filteredClients = searchQuery
    ? clients.filter(client => {
      const searchLower = searchQuery.toLowerCase();
      return (
        client.person.toLowerCase().includes(searchLower) ||
        client.cnpj.toLowerCase().includes(searchLower)
      );
    })
    : clients;

  const openModal = (client) => {
    setSelectedClient(client);
    setIsModalVisible(true);
  };

  // Função para fechar o modal
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedClient(null);
  };

  
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async (message) => {
    if (Platform.OS === 'web') {
      return window.confirm(message);
    }
    return await new Promise((resolve) => {
      Alert.alert(
        "Excluir Cliente",
        message,
        [
          { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
          { text: "Confirmar", style: "destructive", onPress: () => resolve(true) },
        ]
      );
    });
  };
const handleRegisterClients = () => {
    navigation.navigate("Cadastro de Cliente");
  }

  // Funções para as opções do modal
  const handleViewInspections = () => {
    if (selectedClient) {
      navigation.navigate("Inspeções por Cliente", {
        client: selectedClient, // Enviando o cliente selecionado
        clientId: selectedClient.id, // Enviando o ID do cliente
      });
    } else {
      Alert.alert("Erro", "Nenhum cliente selecionado.");
    }
    closeModal();
  };


  const handleEditClient = () => {
    navigation.navigate("Cadastro de Cliente", { client: selectedClient })
    closeModal();
  };

  
const handleDeleteClient = async () => {
    if (!selectedClient) {
      Alert.alert("Erro", "Nenhum cliente selecionado.");
      return;
    }

    try {
      const message = `Tem certeza que deseja excluir o cliente: ${selectedClient.person}?`;
      const proceed = await confirmDelete(message);
      if (!proceed) return;

      setIsDeleting(true);
      const clientRef = doc(db, "clients", selectedClient.id);
      await deleteDoc(clientRef);

      Alert.alert("Sucesso", `Cliente ${selectedClient.person} excluído com sucesso.`);
      closeModal();
      await loadClients();
    } catch (error) {
      console.error("Erro ao excluir cliente: ", error);
      Alert.alert("Erro", error?.message || "Não foi possível excluir o cliente.");
    } finally {
      setIsDeleting(false);
    }
  };


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    ...Platform.select({
      web: {
        paddingTop: 20,
      },
    }),
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  textInputModalSearch: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 5,
  },
  listContainer: {
    flex: 1,
    marginTop: 10,
  },
  listContent: {
    paddingBottom: 20,
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
    marginTop: 20,
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
  buttonRegister: {
    padding: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "space-evenly",
    flexDirection: "row"
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
});

export default ClientsPage;
