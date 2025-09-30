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
  // ⬇️ imports mínimos adicionados para a sequência global por ano
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import generatePDFOpenning from "../components/PDF/generatePDFOpenning";
import generatePDFUpdate from "../components/PDF/generatePDFUpdate";

// ===== helper simples: gera numeroProjeto global por ano via transação Firestore =====
async function getNextNumeroProjeto(dbInstance) {
  const ano = new Date().getFullYear();
  const counterRef = doc(dbInstance, "counters", `global-${ano}`);

  const next = await runTransaction(dbInstance, async (tx) => {
    const snap = await tx.get(counterRef);
    if (!snap.exists()) {
      tx.set(counterRef, { next: 2, updatedAt: serverTimestamp() });
      return 1;
    } else {
      const curr = snap.data().next || 181;
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
    console.log("Client ID:", clientId);
    if (clientId) {
      fetchClientProjects();
    } else {
      console.error("Client ID is undefined or null");
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
      console.log(fetchedProjects);
    } catch (error) {
      console.error("Erro ao buscar projetos para o cliente:", error);
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

  const handleGeneratePDFWeb = async (projectId, tipoEquipamento, isOpening = false, isUpdate = false, isMedicalRecord = false) => {
    try {
      const pdfURL = `https://api-pdf-ct.vercel.app/api/options-pdf?projectId=${projectId}&type=${tipoEquipamento}&opening=${isOpening}&update=${isUpdate}&medicalRecord=${isMedicalRecord}`;

      console.log("Abrindo PDF em:", pdfURL);

        Linking.openURL(pdfURL);
    } catch (error) {
      console.error("Erro ao abrir o PDF:", error);
      Alert.alert("Erro", "Não foi possível abrir o PDF.");
    }
  };

  const handleGeneratePDFMobile = async (projectId, tipoEquipamento, isOpening = false, isUpdate = false, isMedicalRecord = false) => {
    try {
      const pdfURL = `https://api-pdf-ct.vercel.app/api/options-pdf?projectId=${projectId}&type=${tipoEquipamento}&opening=${isOpening}&update=${isUpdate}&medicalRecord=${isMedicalRecord}`;

      console.log("Abrindo PDF em:", pdfURL);

      // Abre a URL no navegador
      await Linking.openURL(pdfURL);

      console.log("Redirecionado para o PDF");
    } catch (error) {
      console.error("Erro ao abrir o PDF:", error);
      Alert.alert("Erro", "Não foi possível abrir o PDF.");
    }
  };

  const handleGeneratePDF = async () => {
    try {
      console.log("Gerar PDF para o projeto:", selectedProject);

      if (!selectedProject || !selectedProject.tipoEquipamento) {
        console.error("Projeto ou tipo de equipamento não definido.");
        Alert.alert("Erro", "Informações do projeto estão incompletas.");
        return;
      }

      console.log("Tipo de Equipamento:", selectedProject.tipoEquipamento);

      let equipamento = "";
      switch (selectedProject.tipoEquipamento) {
        case "Caldeira":
          equipamento = "boiler";
          break;
        case "Vaso de Pressão":
          equipamento = "pressure-vessel";
          break;
        case "Tubulação":
          equipamento = "tubing";
          break;
        default:
          throw new Error("Tipo de equipamento desconhecido.");
      }

      const projectId = selectedProject.id;

      if (Platform.OS === "web") {
        await handleGeneratePDFWeb(projectId, equipamento);
      } else {
        await handleGeneratePDFMobile(projectId, equipamento);
      }
    } catch (error) {
      console.error("Erro ao gerar o PDF:", error);
      Alert.alert("Erro", "Não foi possível gerar o PDF.");
    } finally {
      closeModal();
    }
  };

  const handleGeneratePDFOppening = async () => {
    try {
      if (!selectedProject || !selectedProject.tipoEquipamento) {
        console.error("Projeto ou tipo de equipamento não definido.");
        Alert.alert("Erro", "Informações do projeto estão incompletas.");
        return;
      }

      console.log("Gerar PDF de atualização para o projeto:", selectedProject);

      let equipamento = "";
      switch (selectedProject.tipoEquipamento) {
        case "Caldeira":
          equipamento = "boiler";
          break;
        case "Vaso de Pressão":
          equipamento = "pressure-vessel";
          break;
        case "Tubulação":
          equipamento = "tubing";
          break;
        default:
          throw new Error("Tipo de equipamento desconhecido.");
      }

      await handleGeneratePDFWeb(selectedProject.id, equipamento, true, false);
    } catch (error) {
      console.error("Erro ao gerar o PDF de atualização:", error);
      Alert.alert("Erro", "Não foi possível gerar o PDF.");
    } finally {
      closeModal();
    }
  };

  const handleGeneratePDFUpdate = async () => {
    try {
      if (!selectedProject || !selectedProject.tipoEquipamento) {
        console.error("Projeto ou tipo de equipamento não definido.");
        Alert.alert("Erro", "Informações do projeto estão incompletas.");
        return;
      }

      console.log("Gerar PDF de atualização para o projeto:", selectedProject);

      let equipamento = "";
      switch (selectedProject.tipoEquipamento) {
        case "Caldeira":
          equipamento = "boiler";
          break;
        case "Vaso de Pressão":
          equipamento = "pressure-vessel";
          break;
        case "Tubulação":
          equipamento = "tubing";
          break;
        default:
          throw new Error("Tipo de equipamento desconhecido.");
      }

      await handleGeneratePDFWeb(selectedProject.id, equipamento, false, true);
    } catch (error) {
      console.error("Erro ao gerar o PDF de atualização:", error);
      Alert.alert("Erro", "Não foi possível gerar o PDF.");
    } finally {
      closeModal();
    }
  };

  // ====== DUPLICAÇÃO com novo numeroProjeto ======
  const handleDuplicate = async () => {
    if (selectedProject) {
      try {
        const { id, numeroProjeto, ...projectData } = selectedProject;

        const novoNumero = await getNextNumeroProjeto(db);

        const newProjectData = {
          ...projectData,
          numeroProjeto: novoNumero,          // <- novo número gerado
          ano: new Date().getFullYear(),      // opcional, mantém histórico por ano
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

  const handleEdit = () => {
    if (selectedProject) {
      navigation.navigate("Projetos", { project: selectedProject });
      closeModal();
    }
  };

  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleDelete = () => {
    if (selectedProject) {
      if (Platform.OS === "web") {
        setShowConfirmDeleteModal(true);
      } else {
        Alert.alert(
          "Confirmar Exclusão",
          "Tem certeza de que deseja excluir este projeto? Não será possível recuperá-lo.",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Excluir",
              onPress: deleteProject,
            },
          ]
        );
      }
    }
  };

  const deleteProject = async () => {
    try {
      const projectRef = doc(db, "inspections", selectedProject.id);
      await deleteDoc(projectRef);
      setShowConfirmDeleteModal(false);
      setShowSuccessAlert(true);
      fetchClientProjects();
      closeModal();
    } catch (error) {
      console.error("Erro ao excluir o projeto:", error);
      Alert.alert("Erro", "Ocorreu um erro ao excluir o projeto.");
    }
  };

  const handleGeneratePDFMedicalRecord = async () => {
    try {
      if (!selectedProject || !selectedProject.tipoEquipamento) {
        console.error("Projeto ou tipo de equipamento não definido.");
        Alert.alert("Erro", "Informações do projeto estão incompletas.");
        return;
      }

      console.log("Gerar PDF de atualização para o projeto:", selectedProject);

      let equipamento = "";
      switch (selectedProject.tipoEquipamento) {
        case "Caldeira":
          equipamento = "boiler";
          break;
        case "Vaso de Pressão":
          equipamento = "pressure-vessel";
          break;
        case "Tubulação":
          equipamento = "tubing";
          break;
        default:
          throw new Error("Tipo de equipamento desconhecido.");
      }

      await handleGeneratePDFWeb(selectedProject.id, equipamento, false, false, true);
    } catch (error) {
      console.error("Erro ao gerar o PDF de atualização:", error);
      Alert.alert("Erro", "Não foi possível gerar o PDF.");
    } finally {
      closeModal();
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 20,
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>
            {client.person}
          </Text>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>{client.cnpj}</Text>
        </View>
        <Image
          source={{ uri: client.logo }}
          style={{ width: 80, height: 80, borderRadius: 10, marginRight: 10 }}
          resizeMode="cover"
        />
      </View>

      {loading ? (
        <Text>Carregando...</Text>
      ) : projects.length === 0 ? (
        <Text>Este usuário ainda não possui nenhuma inspeção registrada.</Text>
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
                <Text>Tipo de equipamento: {item.tipoEquipamento}</Text>
                <Text>Data: {formatTimestamp(item.inspection.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          )}
          style={{ maxHeight: 650, marginBottom: 80 }}
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
                  onPress={handleGeneratePDF}
                >
                  <Text style={{ color: "white", textAlign: "center" }}>
                    Gerar relatório
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    padding: 10,
                    backgroundColor: "#38bdf8",
                    borderRadius: 5,
                    marginBottom: 10,
                  }}
                  onPress={handleGeneratePDFUpdate}
                >
                  <Text style={{ color: "white", textAlign: "center" }}>
                    Gerar termo de atualização
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    padding: 10,
                    backgroundColor: "#38bdf8",
                    borderRadius: 5,
                    marginBottom: 10,
                  }}
                  onPress={handleGeneratePDFOppening}
                >
                  <Text style={{ color: "white", textAlign: "center" }}>
                    Gerar termo de abertura
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    padding: 10,
                    backgroundColor: "#38bdf8",
                    borderRadius: 5,
                    marginBottom: 10,
                  }}
                  onPress={handleGeneratePDFMedicalRecord}
                >
                  <Text style={{ color: "white", textAlign: "center" }}>
                    Gerar prontuário
                  </Text>
                </TouchableOpacity>

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
                    backgroundColor: "#38bdf8",
                    borderRadius: 5,
                    marginBottom: 10,
                  }}
                  onPress={handleEdit}
                >
                  <Text style={{ color: "white", textAlign: "center" }}>
                    Editar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    padding: 10,
                    backgroundColor: "#dc2626",
                    borderRadius: 5,
                    marginBottom: 10,
                  }}
                  onPress={handleDelete}
                >
                  <Text style={{ color: "white", textAlign: "center" }}>
                    Excluir
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text>Projeto não disponível.</Text>
            )}

            <Modal
              animationType="fade"
              transparent={true}
              visible={showConfirmDeleteModal}
              onRequestClose={() => setShowConfirmDeleteModal(false)}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: "#fff",
                    padding: 20,
                    borderRadius: 10,
                    alignItems: "center",
                    width: "80%",
                  }}
                >
                  <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
                    Confirmar Exclusão
                  </Text>
                  <Text style={{ textAlign: "center" }}>
                    Tem certeza de que deseja excluir este projeto? Não será possível recuperá-lo.
                  </Text>

                  <View style={{ flexDirection: "row", marginTop: 20 }}>
                    <Pressable
                      onPress={() => setShowConfirmDeleteModal(false)}
                      style={{
                        backgroundColor: "#ccc",
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        borderRadius: 5,
                        marginRight: 10,
                      }}
                    >
                      <Text>Cancelar</Text>
                    </Pressable>

                    <Pressable
                      onPress={deleteProject}
                      style={{
                        backgroundColor: "#dc2626",
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        borderRadius: 5,
                      }}
                    >
                      <Text style={{ color: "#fff" }}>Excluir</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>

            <Modal
              animationType="fade"
              transparent={true}
              visible={showSuccessAlert}
              onRequestClose={() => {
                setShowSuccessAlert(false);
                navigation.navigate("Home");
              }}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: "#fff",
                    padding: 20,
                    borderRadius: 10,
                    alignItems: "center",
                    width: "80%",
                  }}
                >
                  <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
                    Sucesso
                  </Text>
                  <Text>O projeto foi excluído com sucesso!</Text>
                  <Pressable
                    onPress={() => {
                      setShowSuccessAlert(false);
                      navigation.navigate("Home");
                    }}
                    style={{
                      marginTop: 15,
                      backgroundColor: "#1d4ed8",
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderRadius: 5,
                    }}
                  >
                    <Text style={{ color: "#fff" }}>OK</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>


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
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ClientProjects;
