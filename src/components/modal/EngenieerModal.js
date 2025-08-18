import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Alert, FlatList } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Helmet from '@expo/vector-icons/FontAwesome6';
import Search from '@expo/vector-icons/FontAwesome';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from '../../../database/firebaseConfig';
import { useEffect, useState } from 'react';

const EngenieerModal = ({
  modalEngineerVisible,
  setModalEngineerVisible,
  setEngenieer,
}) => {
  const [engenieers, setEngenieers] = useState([]);

  const loadEngenieers = async () => {
    try {
      const engeniersCollection = collection(db, "engenieer");
      const engenieersQuery = query(
        engeniersCollection,
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(engenieersQuery);
      const engenieerList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEngenieers(engenieerList);
    } catch (error) {
      console.error("Erro ao carregar engenheiros: ", error);
      Alert.alert("Erro", "Não foi possível carregar a lista de engenheiros.");
    }
  };

  useEffect(() => {
    if (modalEngineerVisible) {
      loadEngenieers();
    }
  }, [modalEngineerVisible]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalEngineerVisible}
      onRequestClose={() => setModalEngineerVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.overlay} />
        <View style={styles.modalContent}>
          <View style={styles.headerModal}>
            <Text style={styles.titleModal}>Selecionar Engenheiro</Text>
            <Pressable
              style={styles.closeModal}
              onPress={() => setModalEngineerVisible(false)}
            >
              <AntDesign name="closecircle" size={24} color="red" />
            </Pressable>
          </View>
          <View style={styles.textInputModalSearch}>
            <Search
              name="search"
              size={24}
              color="gray"
              style={{ paddingRight: 10 }}
            />
            <TextInput placeholder="Procurar" />
          </View>

          <FlatList
            data={engenieers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  setEngenieer({ id: item.id, name: item.name });
                  setModalEngineerVisible(false);
                }}
              >
                <View style={styles.lineClientsInOpen}>
                  <Text>{item.name}</Text>
                  <Text>{item.email}</Text>
                </View>
              </Pressable>
            )}
          />

          <Pressable
            style={styles.addClientModal}
            onPress={() => navigation.navigate("Cadastro de Engenheiro")}
          >
            <Text style={{ color: "#fff" }}>Cadastrar Engenehiro</Text>
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
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f44336",
    borderRadius: 5,
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    margin: 20,
    width: "80%",
    alignItems: "center",
  },
  headerModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  closeModal: {
    padding: 10,
  },
  titleModal: {
    fontSize: 20,
    fontWeight: "bold",
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
  addClientModal: {
    backgroundColor: "#007BFF",
    borderRadius: 5,
    padding: 10,
    width: "100%",
    marginVertical: 10,
    alignItems: "center",
  },
})

export default EngenieerModal;