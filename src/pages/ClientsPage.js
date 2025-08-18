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
  const [isDeleting, setIsDeleting] = useState(false);
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
  try {
    if (!selectedClient) {
      if (Platform.OS === 'web') {
        window.alert("Nenhum cliente selecionado.");
      } else {
        Alert.alert("Erro", "Nenhum cliente selecionado.");
      }
      return;
    }

    const message = `Tem certeza que deseja excluir o cliente: ${selectedClient.person}?`;

    let confirmed = false;
    if (Platform.OS === 'web') {
      confirmed = window.confirm(message);
    } else {
      confirmed = await new Promise((resolve) => {
        Alert.alert("Excluir Cliente", message, [
          { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
          { text: "Confirmar", style: "destructive", onPress: () => resolve(true) },
        ]);
      });
    }
    if (!confirmed) return;

    setIsDeleting(true);
    await deleteDoc(doc(db, "clients", selectedClient.id));

    // fechar modal e recarregar
    setIsModalVisible(false);
    setSelectedClient(null);
    if (typeof loadClients === 'function') {
      await loadClients();
    }

    if (Platform.OS === 'web') {
      window.alert("Cliente excluído com sucesso!");
    } else {
      Alert.alert("Sucesso", "Cliente excluído com sucesso!");
    }
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    if (Platform.OS === 'web') {
      window.alert("Não foi possível excluir o cliente.");
    } else {
      Alert.alert("Erro", "Não foi possível excluir o cliente.");
    }
  } finally {
    setIsDeleting(false);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clientes cadastrados</Text>

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

      <TouchableOpacity style={styles.buttonRegister} onPress={handleRegisterClients}>
        <Text style={styles.modalButtonText}>Cadastrar Cliente</Text>
        <AntDesign name='plus' size={24} color="#fff"/>
      </TouchableOpacity>

      <View style={styles.listContainer}>
        {filteredClients.length > 0 ? (
          <FlatList
            data={filteredClients}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={styles.lineClientsInOpen}
                onPress={() => { openModal(item) }}
              >
                <Text>
                  {item.person} - {item.cnpj}
                </Text>
              </Pressable>
            )}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <Text style={styles.noClientsText}>Nenhum cliente cadastrado.</Text>
        )}
      </View>

      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Opções para: {selectedClient?.person}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleViewInspections}>
              <Text style={styles.modalButtonText}>Ver Inspeções</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleEditClient}>
              <Text style={styles.modalButtonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonDelete} disabled={isDeleting} onPress={handleDeleteClient}>
              <Text style={styles.modalButtonTextDelete}>{isDeleting ? "Excluindo..." : "Excluir"}</Text>
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
