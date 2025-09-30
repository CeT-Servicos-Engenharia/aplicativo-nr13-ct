import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Modal,
  TouchableOpacity,
  Alert,
  Linking,
  Pressable,
  Platform,
} from "react-native";
import { db } from "../../database/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
  runTransaction,
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

// ===== helper: gera numeroProjeto global por ano via transação Firestore =====
async function getNextNumeroProjeto(dbInstance) {
  const ano = new Date().getFullYear();
  const counterRef = doc(dbInstance, "counters", `global-${ano}`);

  const next = await runTransaction(dbInstance, async (tx) => {
    const snap = await tx.get(counterRef);
    if (!snap.exists()) {
      // busca maior numeroProjeto já salvo
      const q = query(collection(dbInstance, "inspections"), orderBy("numeroProjeto", "desc"), limit(1));
      const snapMax = await getDocs(q);
      let start = 1;
      if (!snapMax.empty) {
        const dataMax = snapMax.docs[0].data();
        start = (parseInt(dataMax.numeroProjeto, 10) || 0) + 1;
      }
      tx.set(counterRef, { next: start + 1, updatedAt: serverTimestamp() });
      return start;
    } else {
      const curr = snap.data().next || 1;
      tx.update(counterRef, { next: curr + 1, updatedAt: serverTimestamp() });
      return curr;
    }
  });

  return String(next);
}

const ClientProjects = ({ route }) => {
  const { clientId, client } = route.params;
  const navigation = useNavigation();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetchClientProjects();
    }
  }, [clientId]);

  const fetchClientProjects = async () => {
    try {
      const q = query(
        collection(db, "inspections"),
        where("client", "==", clientId)
      );
      const snapshot = await getDocs(q);
      const fetchedProjects = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjects(fetchedProjects);
    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString();
    }
    return "Data não disponível";
  };

  const openModal = (project) => {
    setSelectedProject(project);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedProject(null);
    setModalVisible(false);
  };

  // ====== DUPLICAÇÃO com novo numeroProjeto ======
  const handleDuplicate = async () => {
    if (selectedProject) {
      try {
        const { id, numeroProjeto, ...projectData } = selectedProject;

        const novoNumero = await getNextNumeroProjeto(db);

        const newProjectData = {
          ...projectData,
          numeroProjeto: novoNumero,
          ano: new Date().getFullYear(),
          createdAt: Timestamp.now(),
          updatedAt: serverTimestamp(),
        };

        const newProjectRef = await addDoc(collection(db, "inspections"), newProjectData);
        Alert.alert("Sucesso", `Projeto duplicado com sucesso! Nº ${novoNumero}`);
        fetchClientProjects();
        closeModal();
        console.log("Novo projeto duplicado com ID: ", newProjectRef.id);
      } catch (error) {
        console.error("Erro ao duplicar o projeto:", error);
        Alert.alert("Erro", "Ocorreu um erro ao duplicar o projeto.");
      }
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>{client.person}</Text>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>{client.cnpj}</Text>

      {loading ? (
        <Text>Carregando...</Text>
      ) : projects.length === 0 ? (
        <Text>Este cliente ainda não possui inspeções.</Text>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => openModal(item)}>
              <View
                style={{
                  marginBottom: 10,
                  backgroundColor: "#7dd3fc",
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <Text>ART: {item.artProjeto}</Text>
                <Text>Descrição: {item.descricaoRevisao}</Text>
                <Text>Tipo: {item.tipoEquipamento}</Text>
                <Text>Data: {formatTimestamp(item.inspection?.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              width: 300,
              padding: 20,
              backgroundColor: "white",
              borderRadius: 10,
            }}
          >
            {selectedProject ? (
              <>
                <Text style={{ fontSize: 18, marginBottom: 10 }}>
                  Projeto: {selectedProject.artProjeto}
                </Text>

                <TouchableOpacity
                  style={{
                    padding: 10,
                    backgroundColor: "#38bdf8",
                    borderRadius: 5,
                    marginBottom: 10,
                  }}
                  onPress={handleDuplicate}
                >
                  <Text style={{ color: "white", textAlign: "center" }}>
                    Duplicar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    padding: 10,
                    backgroundColor: "#9ca3af",
                    borderRadius: 5,
                  }}
                  onPress={closeModal}
                >
                  <Text style={{ color: "white", textAlign: "center" }}>
                    Fechar
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text>Projeto não disponível.</Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ClientProjects;
