import React, { useState, useEffect } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert
} from "react-native";
import Search from "@expo/vector-icons/FontAwesome";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "../../../database/firebaseConfig";

const ClientsModal = ({ visible, onClose, onSelectClient, projectName }) => {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    console.log("📢 Estado do modal (visible):", visible);
    if (visible) { 
      console.log("🔍 Modal aberto, chamando loadClients...");
      loadClients();
    }
  }, [visible]);
  
  


  const loadClients = async () => {
    try {
      console.log("🔄 Buscando clientes...");
      const clientsCollection = collection(db, "clients");
      const clientsQuery = query(clientsCollection, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(clientsQuery);

      console.log(`📊 Total de clientes encontrados: ${querySnapshot.size}`);

      if (querySnapshot.empty) {
        console.log("⚠️ Nenhum cliente encontrado no Firestore!");
      }

      querySnapshot.forEach(doc => {
        console.log("📄 Cliente encontrado:", doc.id, doc.data());
      });

      const clientsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("✅ Clientes carregados:", clientsList);
      setClients(clientsList);
    } catch (error) {
      console.error("❌ Erro ao carregar clientes: ", error);
      Alert.alert("Erro", "Não foi possível carregar a lista de clientes.");
    }
  };



  console.log("Ta no modal")

  return (
    <Modal visible={visible} transparent={true} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContainerInternal}>
          <Text style={styles.title}>Clientes cadastrados</Text>
          <View style={styles.textInputModalSearch}>
            <Search name="search" size={24} color="gray" style={{ paddingRight: 10 }} />
            <TextInput
              placeholder="Procurar"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {clients.length > 0 ? (
            <FlatList
              data={clients}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onSelectClient({ id: item.id, name: item.person, projectName });
                    onClose();
                  }}
                >
                  <View style={styles.lineClientsInOpen}>
                    <Text>{item.person}</Text>
                  </View>
                </Pressable>
              )}
            />
          ) : (
            <Text style={styles.noClientsText}>Nenhum cliente cadastrado.</Text>
          )}

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text>Fechar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainerInternal: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  textInputModalSearch: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    width: "100%",
    marginVertical: 10,
  },
  lineClientsInOpen: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  noClientsText: {
    textAlign: "center",
    marginTop: 20,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f44336",
    borderRadius: 5,
    alignItems: "center",
  },
});

export default ClientsModal;
